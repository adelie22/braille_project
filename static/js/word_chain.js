// 사용자와 컴퓨터가 사용한 단어를 저장하는 배열
let history = [];
let invalidAttempts = 0; // 잘못된 시도 횟수

// 게임 초기화 함수
function resetGame() {
    fetch('/word_chain/reset', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reset game on server');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message); // 서버 응답 확인
            console.log('Server-side history:', data.history); // 서버에서 초기화된 history 확인

            history = []; // 클라이언트 측 기록 초기화
            invalidAttempts = 0; // 잘못된 시도 횟수 초기화

            // UI 초기화
            document.getElementById('history').innerHTML = '';
            document.getElementById('result').textContent = '게임이 초기화되었습니다. 새로 시작합니다!';
            document.getElementById('result').style.color = 'green';
        })
        .catch(error => {
            console.error('Error resetting the game:', error);
            document.getElementById('result').textContent = '게임 초기화 중 오류가 발생했습니다.';
            document.getElementById('result').style.color = 'red';
        });
}
// 🟨 영어 게임 초기화 함수 추가
// 게임 초기화 함수
function resetGameEn() {
    fetch('/word_chain_en/reset', { method: 'POST' }) // 영어 끝말잇기 전용 API
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reset English game on server');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message); // 서버 응답 확인
            history = []; // 클라이언트 측 기록 초기화
            invalidAttempts = 0; // 잘못된 시도 횟수 초기화

            // UI 초기화
            document.getElementById('history-en').innerHTML = '';
            document.getElementById('result-en').textContent = 'Game has been reset. Start again!';
            document.getElementById('result-en').style.color = 'green';
            document.getElementById('user-word-en').value = ''; // 입력 필드 초기화
            document.getElementById('user-word-en').disabled = false; // 입력 필드 활성화
        })
        .catch(error => {
            console.error('Error resetting the game:', error);
            document.getElementById('result-en').textContent = 'Error resetting the game.';
            document.getElementById('result-en').style.color = 'red';
        });
}

// "제출" 버튼 클릭 이벤트 리스너
document.getElementById('submit-word').addEventListener('click', async () => {
    const word = document.getElementById('user-word').value.trim(); // 사용자 입력 값 가져오기

    if (!word) { // 빈 입력 확인
        document.getElementById('result').textContent = '단어를 입력하세요!';
        document.getElementById('result').style.color = 'red';
        return;
    }
    else if (word.length < 2) {
        document.getElementById('result').textContent = '단어는 2글자 이상이어야 합니다!';
        document.getElementById('result').style.color = 'red';
        return;
    }

    try {
        // 유효성 검사 API 호출
        const response = await fetch('/word_chain/check_word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, history }) // history를 서버로 전달
        });
        const result = await response.json();

        if (response.ok) {
            // 서버로부터 최신 history 동기화
            history = result.history;

            // 유효한 단어일 경우
            document.getElementById('result').textContent = '유효한 단어입니다!';
            document.getElementById('result').style.color = 'green';

            // 기록 추가
            const userItem = document.createElement('li');
            userItem.textContent = `사용자: ${word}`;
            document.getElementById('history').appendChild(userItem);

            // 사용자 입력 단어를 history에 추가
            history.push(word);

            // 컴퓨터 단어 생성 API 호출
            const computerResponse = await fetch(`/word_chain/generate_word?history=${encodeURIComponent(history.join(','))}`);

            if (computerResponse.ok) {
                const computerResult = await computerResponse.json(); // 서버 응답을 JSON으로 변환
                // 기록에 컴퓨터 단어 추가
                const computerItem = document.createElement('li');
                computerItem.textContent = `컴퓨터: ${computerResult.word}`;
                document.getElementById('history').appendChild(computerItem);

                // 컴퓨터 단어를 history에 추가
                history.push(computerResult.word);
                console.log('Updated history after computer move:', history);
            } else {
                const errorResult = await computerResponse.json(); // 에러 응답 처리
                document.getElementById('result').textContent = errorResult.error || '컴퓨터가 단어를 생성하지 못했습니다.';
                document.getElementById('result').style.color = 'blue';

                // 팝업으로 게임 종료 또는 재시작
                setTimeout(() => {
                    const continueGame = confirm('컴퓨터가 단어를 생성하지 못했습니다. Enter을 눌러 재시작하거나 Esc를 눌러 종료합니다.');
                    if (continueGame) {
                        resetGame();
                    } else {
                        quitGame();
                    }
                }, 100);
            }

        } else {
            // 유효하지 않은 단어일 경우
            document.getElementById('result').textContent = result.error || '유효하지 않은 단어입니다.';
            document.getElementById('result').style.color = 'red';

            invalidAttempts++;
            if (invalidAttempts >= 3) {
                document.getElementById('result').textContent = '게임이 끝났습니다. Enter을 눌러 재시작하거나 Esc를 눌러 종료하세요.';
                setTimeout(() => {
                    const continueGame = confirm('계속하시겠습니까? Enter을 누르면 재시작, Esc를 누르면 종료합니다.');
                    if (continueGame) {
                        resetGame();
                    } else {
                        quitGame();
                    }
                }, 2000);
            }
        }
    } catch (error) {
        // 네트워크 오류 또는 서버 오류 처리
        document.getElementById('result').textContent = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
        document.getElementById('result').style.color = 'red';
        console.error('Error:', error);
    }

    // 입력 필드 초기화
    document.getElementById('user-word').value = '';
});

// 🟨 영어 제출 버튼 클릭 이벤트 추가
// "제출" 버튼 클릭 이벤트 리스너
document.getElementById('submit-word-en').addEventListener('click', async () => {
    const word = document.getElementById('user-word-en').value.trim();

    if (!word) {
        document.getElementById('result-en').textContent = 'Please enter a word!';
        document.getElementById('result-en').style.color = 'red';
        return;
    } else if (word.length < 2) {
        document.getElementById('result-en').textContent = 'The word must be at least 2 letters long!';
        document.getElementById('result-en').style.color = 'red';
        return;
    }

    try {
        // 유효성 검사 API 호출
        const response = await fetch('/word_chain_en/check_word', { // 영어 API 호출
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, history })
        });

        const result = await response.json();

        if (response.ok) {
            // 서버로부터 최신 history 동기화
            history = result.history;

            // 유효한 단어일 경우
            document.getElementById('result-en').textContent = 'Valid word!';
            document.getElementById('result-en').style.color = 'green';

            // 기록 추가
            const userItem = document.createElement('li');
            userItem.textContent = `Player: ${word}`;
            document.getElementById('history-en').appendChild(userItem);

            // 사용자 입력 단어를 history에 추가
            history.push(word);

            // 컴퓨터 단어 생성 API 호출
            const computerResponse = await fetch('/word_chain_en/generate_word');

            if (computerResponse.ok) {
                const computerResult = await computerResponse.json();
                if (computerResult.word) {
                    const computerItem = document.createElement('li');
                    computerItem.textContent = `Computer: ${computerResult.word}`;
                    document.getElementById('history-en').appendChild(computerItem);
                    history.push(computerResult.word);
                } else {
                    throw new Error('No word generated by the computer.');
                }
            } else {
                const errorResult = await computerResponse.json();
                document.getElementById('result-en').textContent = errorResult.error || 'Computer failed to generate a word.';
                document.getElementById('result-en').style.color = 'blue';

                setTimeout(() => {
                    const continueGame = confirm('The computer failed to generate a word. Press Enter to restart or Esc to quit.');
                    if (continueGame) {
                        resetGameEn();
                    } else {
                        quitGameEn();
                    }
                }, 100);
            }
        } else {
            document.getElementById('result-en').textContent = result.error || 'Invalid word.';
            document.getElementById('result-en').style.color = 'red';

            invalidAttempts++;
            if (invalidAttempts >= 3) {
                document.getElementById('result-en').textContent = 'Game over. Press Enter to restart or Esc to quit.';
                setTimeout(() => {
                    const continueGame = confirm('Do you want to continue? Press Enter to restart, Esc to quit.');
                    if (continueGame) {
                        resetGameEn();
                    } else {
                        quitGameEn();
                    }
                }, 2000);
            }
        }
    } catch (error) {
        document.getElementById('result-en').textContent = 'Network error. Please try again.';
        document.getElementById('result-en').style.color = 'red';
        console.error('Error:', error);
    }

    document.getElementById('user-word-en').value = ''; // 입력 필드 초기화
});


// "엔터" 키로 제출 이벤트 트리거
document.getElementById('user-word').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 동작(폼 제출) 방지
        document.getElementById('submit-word').click(); // "제출" 버튼 클릭 이벤트 트리거
    }
});

// "엔터" 키로 제출 이벤트 트리거 (영어 끝말잇기)
// "엔터" 키로 제출 이벤트 트리거
document.getElementById('user-word-en').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('submit-word-en').click();
    }
});


// 게임 종료 처리 함수
function quitGame() {
    document.getElementById('result').textContent = '게임을 종료합니다.';
    document.getElementById('result').style.color = 'blue';
    document.getElementById('user-word').disabled = true; // 입력 비활성화
}


// 게임 종료 처리 함수 (영어 끝말잇기)
// 영어 게임 종료 처리 함수
function quitGameEn() {
    document.getElementById('result-en').textContent = 'The game has ended.';
    document.getElementById('result-en').style.color = 'blue';
    document.getElementById('user-word-en').disabled = true; // 입력 비활성화
}
