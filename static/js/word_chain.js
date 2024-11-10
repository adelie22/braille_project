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



// "제출" 버튼 클릭 이벤트 리스너
document.getElementById('submit-word').addEventListener('click', async () => {
    const word = document.getElementById('user-word').value.trim(); // 사용자 입력 값 가져오기

    if (!word) { // 빈 입력 확인
        document.getElementById('result').textContent = '단어를 입력하세요!';
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
            // 유효한 단어일 경우
            document.getElementById('result').textContent = '유효한 단어입니다!';
            document.getElementById('result').style.color = 'green';

            // 기록 추가
            const userItem = document.createElement('li');
            userItem.textContent = `사용자: ${word}`;
            document.getElementById('history').appendChild(userItem);

            // 사용자 입력 단어를 history에 추가
            history.push(word);
            invalidAttempts = 0; // 잘못된 시도 초기화

            // 컴퓨터 단어 생성 API 호출
            const computerResponse = await fetch(`/word_chain/generate_word?history=${encodeURIComponent(history.join(','))}`);

            if (computerResponse.ok) {
                const computerResult = await computerResponse.json(); // 서버 응답을 JSON으로 변환

                // 기록 추가
                const computerItem = document.createElement('li');
                computerItem.textContent = `컴퓨터: ${computerResult.word}`;
                document.getElementById('history').appendChild(computerItem);

                history.push(computerResult.word); // 컴퓨터 단어를 history에 추가
            } else {
                const errorResult = await computerResponse.json(); // 에러 응답 처리
                document.getElementById('result').textContent = errorResult.error || '컴퓨터가 단어를 생성하지 못했습니다.';
                document.getElementById('result').style.color = 'blue';

                // 팝업으로 게임 종료 또는 재시작
                setTimeout(() => {
                    const continueGame = confirm('계속하시겠습니까? Enter을 누르면 재시작, Esc를 누르면 종료합니다.');
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

// "엔터" 키로 제출 이벤트 트리거
document.getElementById('user-word').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 동작(폼 제출) 방지
        document.getElementById('submit-word').click(); // "제출" 버튼 클릭 이벤트 트리거
    }
});

// 게임 종료 처리 함수
function quitGame() {
    document.getElementById('result').textContent = '게임을 종료합니다.';
    document.getElementById('result').style.color = 'blue';
    document.getElementById('user-word').disabled = true; // 입력 비활성화
}
