// 사용자와 컴퓨터가 사용한 단어를 저장하는 배열
let history = [];
let invalidAttempts = 0; // 잘못된 시도 횟수
let invalidAttemptsEn = 0; // 🟨 영어 틀린 횟수

// 🟨 추가된 변수: 횟수 관리
let exchangeCount = 0; // 주고받은 횟수
let exchangeCountEn = 0; // 영어 끝말잇기 주고받은 횟수
let isSubmitting = false;


function speakText(text, lang = 'ko-KR', rate = 1.0) {
    window.speechSynthesis.cancel(); // 현재 음성 중단
    setTimeout(() => {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = lang;
        speech.rate = rate; // Adjust the rate (default is 1.0)
        window.speechSynthesis.speak(speech);
    }, 100); // 짧은 딜레이 추가
}

// function speakTexten(text, lang = 'en-US') {
//     window.speechSynthesis.cancel(); // 현재 음성 중단
//     setTimeout(() => {
//         const speech = new SpeechSynthesisUtterance(text);
//         speech.lang = lang;
//         window.speechSynthesis.speak(speech);
//     }, 100); // 짧은 딜레이 추가
// }

async function submitWordKo() {
    if (isSubmitting) return; // 중복 방지
    isSubmitting = true; // 플래그 설정

    try {
        const word = document.getElementById('user-word').value.trim();

        if (!word) {
            document.getElementById('result').textContent = '단어를 입력하세요!';
            document.getElementById('result').style.color = 'red';
            return;
        }

        if (word.length < 2) {
            document.getElementById('result').textContent = '단어는 2글자 이상이어야 합니다!';
            document.getElementById('result').style.color = 'red';
            speakText('단어는 두 글자 이상이어야 합니다.', 'ko-KR');
            return;
        }



        // 유효성 검사 API 호출
        const response = await fetch('/word_chain/check_word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, history }),
        });

        const result = await response.json();

    

        if (response.ok && result.history) {
            history = result.history; // 서버로부터 history 동기화
            document.getElementById('result').textContent = '유효한 단어입니다!';
            document.getElementById('result').style.color = 'green';
            speakText(word, 'ko-KR');

            history = result.history; // 서버로부터 history 동기화
            const lastComputerWord = history[history.length - 1];
            const lastChar = lastComputerWord.charAt(lastComputerWord.length - 1);

            // 기록 추가
            const userItem = document.createElement('li');
            userItem.textContent = `사용자: ${word}`;
            document.getElementById('history').appendChild(userItem);

            exchangeCount++;
            document.getElementById('exchange-count').textContent = exchangeCount;

            // 컴퓨터 응답 처리
            const computerResponse = await fetch(
                `/word_chain/generate_word?history=${encodeURIComponent(history.join(','))}`
            );
            if (computerResponse.ok) {
                const computerResult = await computerResponse.json();
                if (computerResult.word) {
                    const computerWord = computerResult.word;

                    // 기록 추가
                    const computerItem = document.createElement('li');
                    computerItem.textContent = `컴퓨터: ${computerWord}`;
                    document.getElementById('history').appendChild(computerItem);

                    history.push(computerWord);
                    exchangeCount++;
                    document.getElementById('exchange-count').textContent = exchangeCount;

                    speakText(computerWord, 'ko-KR');
                }
            }
        } else {
            invalidAttempts++;
            document.getElementById('error-count').textContent = invalidAttempts;
            document.getElementById('result').textContent =
                result.error || '유효하지 않은 단어입니다!';
            document.getElementById('result').style.color = 'red';
            // speakText('유효하지 않은 단어입니다!', 'ko-KR')
            if (invalidAttempts >= 3) {
                speakText("게임이 종료되었습니다. 다시 시작하려면 엔터, 종료하려면 ESC를 누르세요.", 'ko-KR');
                document.getElementById('result').textContent =
                    '게임 종료. 다시 시작하시겠습니까?';
                setTimeout(() => {
                    const restart = confirm('게임이 종료되었습니다. 다시 시작하려면 확인을 누르세요.');
                    if (restart) {
                        resetGame(); // 게임 초기화
                    } else {
                        quitGame(); // 게임 종료
                    }
                }, 2000); // 2초 후 팝업 창 표시
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').textContent = '네트워크 오류가 발생했습니다!';
        document.getElementById('result').style.color = 'red';
    } finally {
        isSubmitting = false; // 항상 해제
        document.getElementById('user-word').value = ''; // 입력 필드 초기화
    }
}


// 🟨 영어 단어 제출 로직
async function submitWordEn() {
    if (isSubmitting) return; // 중복 제출 방지
    isSubmitting = true;

    const word = document.getElementById('user-word-en').value.trim();

    try {
        speakText(word, 'en-US');

        const response = await fetch('/word_chain_en/check_word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, history }),
        });

        const result = await response.json();

        if (response.ok && result.history) {
            history = result.history;
            document.getElementById('result-en').textContent = 'Valid word!';
            document.getElementById('result-en').style.color = 'green';

            const userItem = document.createElement('li');
            userItem.textContent = `Player: ${word}`;
            document.getElementById('history-en').appendChild(userItem);

            history.push(word);
            exchangeCountEn++;
            document.getElementById('exchange-count-en').textContent = exchangeCountEn;

            const computerResponse = await fetch('/word_chain_en/generate_word');

            if (computerResponse.ok) {
                const computerResult = await computerResponse.json();
                if (computerResult.word) {
                    const computerWord = computerResult.word;
                    const computerItem = document.createElement('li');
                    computerItem.textContent = `Computer: ${computerWord}`;
                    document.getElementById('history-en').appendChild(computerItem);

                    history.push(computerWord);
                    exchangeCountEn++;
                    document.getElementById('exchange-count-en').textContent = exchangeCountEn;
                    speakText(computerWord, 'en-US');
                }
            }
        } else {
            invalidAttemptsEn++;
            document.getElementById('error-count-en').textContent = invalidAttemptsEn;
            document.getElementById('result-en').textContent = result.error || 'Invalid word.';
            document.getElementById('result-en').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('result-en').textContent = 'Network error. Please try again.';
        document.getElementById('result-en').style.color = 'red';
        console.error('Error:', error);
    } finally {
        isSubmitting = false;
        document.getElementById('user-word-en').value = ''; // 입력 필드 초기화
    }
}

// 🟨 이벤트 리스너 추가
document.getElementById('submit-word').addEventListener('click', submitWordKo);
document.getElementById('submit-word-en').addEventListener('click', submitWordEn);
document.getElementById('user-word-en').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitWordEn();
    }
});
document.getElementById('user-word').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (!isSubmitting) {
            submitWordKo();
        }
    }
});

// 🟨 한국어 게임 초기화 함수 수정
function resetGame() {
    fetch('/word_chain/reset', { method: 'POST' }) // 한국어 끝말잇기 초기화 API 호출
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reset the Korean game on the server');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message); // 초기화 성공 메시지 확인
            console.log('Server-side history:', data.history); // 서버 초기화 후 상태

            // 🟨 클라이언트 측 초기화
            history = [];
            invalidAttempts = 0;
            exchangeCount = 0;

            // 🟨 UI 초기화
            document.getElementById('history').innerHTML = '';
            document.getElementById('result').textContent = '게임이 초기화되었습니다. 새로 시작하세요!';
            document.getElementById('result').style.color = 'green';
            document.getElementById('exchange-count').textContent = exchangeCount;
            document.getElementById('error-count').textContent = invalidAttempts;
            document.getElementById('user-word').value = ''; // 입력 필드 초기화
        })
        .catch(error => {
            console.error('Error resetting the Korean game:', error);
            alert('게임 초기화 중 오류가 발생했습니다.');
        });
}

// 🟨 영어 게임 초기화 함수 수정
// 🟨 영어 끝말잇기 초기화 함수
function resetGameEn() {
    fetch('/word_chain_en/reset', { method: 'POST' }) // 영어 끝말잇기 초기화 API 호출
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reset the English game on the server');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message); // 초기화 성공 메시지 확인
            console.log('Server-side history:', data.history); // 서버 초기화 후 상태

            // 🟨 클라이언트 측 초기화
            history = [];
            invalidAttemptsEn = 0;
            exchangeCountEn = 0;

            // 🟨 UI 초기화
            document.getElementById('history-en').innerHTML = '';
            document.getElementById('result-en').textContent = 'Game has been reset. Start again!';
            document.getElementById('result-en').style.color = 'green';
            document.getElementById('exchange-count-en').textContent = exchangeCountEn;
            document.getElementById('error-count-en').textContent = invalidAttemptsEn;
            document.getElementById('user-word-en').value = ''; // 입력 필드 초기화
        })
        .catch(error => {
            console.error('Error resetting the English game:', error);
            alert('Error resetting the English game.');
        });
}


document.getElementById('submit-word').addEventListener('click', submitWordKo);
document.getElementById('user-word').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitWordKo();
    }
});





// 🟨 영어 제출 버튼 클릭 이벤트 추가

document.getElementById('submit-word-en').addEventListener('click', async () => {
    if (isSubmitting) return; // 중복 제출 방지
    isSubmitting = true;

    const word = document.getElementById('user-word-en').value.trim();

    if (!word) {
        document.getElementById('result-en').textContent = 'Please enter a word!';
        document.getElementById('result-en').style.color = 'red';
        setTimeout(() => (isSubmitting = false), 100); // 플래그 초기화
        return;
    } else if (word.length < 3) {
        speakText("The word must be at least three letters long", 'en-US', 2.0);
        document.getElementById('result-en').textContent = 'The word must be at least 3 letters long!';
        document.getElementById('result-en').style.color = 'red';
        
        setTimeout(() => (isSubmitting = false), 100); // 플래그 초기화
        return;
    }

    try {
        speakText(word, 'en-US');

        // 유효성 검사 API 호출
        const response = await fetch('/word_chain_en/check_word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, history }),
        });

        const result = await response.json();

        if (response.ok && result.history) {
            // 올바른 단어 처리
            history = result.history;
            document.getElementById('result-en').textContent = 'Valid word!';
            document.getElementById('result-en').style.color = 'green';

            const userItem = document.createElement('li');
            userItem.textContent = `Player: ${word}`;
            document.getElementById('history-en').appendChild(userItem);

            history.push(word);

            // 🟨 교환 횟수 업데이트
            exchangeCountEn++;
            document.getElementById('exchange-count-en').textContent = exchangeCountEn;

            // 컴퓨터 단어 생성 API 호출
            const computerResponse = await fetch('/word_chain_en/generate_word');

            if (computerResponse.ok) {
                const computerResult = await computerResponse.json();
                if (computerResult.word) {
                    const computerWord = computerResult.word;

                    setTimeout(() => {
                        const computerItem = document.createElement('li');
                        computerItem.textContent = `Computer: ${computerWord}`;
                        document.getElementById('history-en').appendChild(computerItem);
                        history.push(computerWord);

                        // 🟨 교환 횟수 업데이트
                        exchangeCountEn++;
                        document.getElementById('exchange-count-en').textContent = exchangeCountEn;

                        speakText(computerWord, 'en-US');
                    }, 1000); // 1초 딜레이
                } else {
                    throw new Error('No word generated by the computer.');
                }
            } else {
                const errorResult = await computerResponse.json();
                document.getElementById('result-en').textContent =
                    errorResult.error || 'Computer failed to generate a word.';
                document.getElementById('result-en').style.color = 'blue';
            }
        } else {
            // 유효하지 않은 단어 처리
            invalidAttemptsEn++;
            document.getElementById('error-count-en').textContent = invalidAttemptsEn; // 🟨 틀린 횟수 UI 업데이트
            document.getElementById('result-en').textContent = result.error || 'Invalid word.';
            document.getElementById('result-en').style.color = 'red';
            //3번이상 틀리면 resetGameEn함수, quitGameEn함수 호출해서 게임종료, 초기화
            if (invalidAttemptsEn >= 3) {
                speakText("The game is over. Press Enter to restart or - E-S-C  to quit", 'en-US', 2.0);
                document.getElementById('result-en').textContent =
                    'Game over. Press Enter to restart or ESC to quit.';
                setTimeout(() => {
                    const continueGame = confirm(
                        'Do you want to continue? Press Enter to restart, Esc to quit.'
                    );
                    if (continueGame) {
                        resetGameEn();
                    } else {
                        quitGameEn();
                    }
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result-en').textContent = 'Network error. Please try again.';
        document.getElementById('result-en').style.color = 'red';
    } finally {
        setTimeout(() => (isSubmitting = false), 100); // 플래그 초기화
    }

    document.getElementById('user-word-en').value = ''; // 입력 필드 초기화
});





// 단어 입력창에서 엔터키 동작 제어 (영어)
document.getElementById('user-word-en').addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !isSubmitting) {
        event.preventDefault(); // 기본 엔터 동작 방지
        isSubmitting = true; // 플래그 설정

        const word = event.target.value.trim(); // 사용자가 입력한 단어
        if (word) {
            document.getElementById('submit-word-en').click(); // 제출 버튼 동작
        }

        // 100ms 뒤 플래그 초기화
        setTimeout(() => {
            isSubmitting = false;
        }, 100);
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


// 🟨 한국어 끝말잇기 뒤로가기
document.getElementById('back-to-menu-ko').addEventListener('click', async () => {
    try {
        await resetGame(); // 기존 resetGame 함수 호출
        // 화면 전환 및 UI 초기화
        document.getElementById('word-chain-game').classList.add('hidden');
        document.getElementById('language-selection').classList.remove('hidden');
        currentIndex = 0; // 커서를 첫 번째 메뉴로 초기화
        highlightMenu(currentIndex); // 초기화된 커서 강조 표시
        speakText(menuItems[currentIndex].voice); // 초기화된 메뉴 음성 출력
    } catch (error) {
        console.error('Error resetting the game:', error);
        alert('게임 초기화 중 오류가 발생했습니다.');
    }
});

// 🟨 영어 끝말잇기 뒤로가기
document.getElementById('back-to-menu-en').addEventListener('click', async () => {
    try {
        await resetGameEn(); // 기존 resetGameEn 함수 호출
        // 화면 전환 및 UI 초기화
        document.getElementById('word-chain-game-en').classList.add('hidden');
        document.getElementById('language-selection').classList.remove('hidden');
        currentIndex = 0; // 커서를 첫 번째 메뉴로 초기화
        highlightMenu(currentIndex); // 초기화된 커서 강조 표시
        speakText(menuItems[currentIndex].voice); // 초기화된 메뉴 음성 출력
    } catch (error) {
        console.error('Error resetting the game:', error);
        alert('Error resetting the game.');
    }
});



// // 🟨 한국어 끝말잇기 뒤로가기
// document.getElementById('back-to-menu-ko').addEventListener('click', async () => {
//     try {
//         // 서버에서 한국어 게임 초기화 요청
//         const response = await fetch('/word_chain/reset', { method: 'POST' });
//         if (!response.ok) {
//             throw new Error('Failed to reset the game on the server');
//         }
//         const data = await response.json();
//         console.log(data.message); // 서버 응답 확인

//         // 클라이언트 데이터 초기화
//         history = [];
//         invalidAttempts = 0;
//         document.getElementById('history').innerHTML = '';
//         document.getElementById('result').textContent = '';
//         document.getElementById('user-word').value = '';

//         // 🟨 UI 횟수 초기화
//         document.getElementById('exchange-count').textContent = 0;
//         document.getElementById('error-count').textContent = 0;

//         // 화면 전환
//         document.getElementById('word-chain-game').classList.add('hidden');
//         document.getElementById('language-selection').classList.remove('hidden');

//         // 🟨 언어 선택 화면에서 커서 초기화
//         currentIndex = 0; // 커서를 첫 번째 메뉴(한국어)로 초기화
//         highlightMenu(currentIndex); // 초기화된 커서 강조 표시
//         speakText(menuItems[currentIndex].voice); // 초기화된 메뉴 음성 출력
//     } catch (error) {
//         console.error('Error resetting the game:', error);
//         alert('게임 초기화 중 오류가 발생했습니다.');
//     }
// });

// // 🟨 영어 끝말잇기 뒤로가기
// document.getElementById('back-to-menu-en').addEventListener('click', async () => {
//     try {
//         // 서버에서 영어 게임 초기화 요청
//         const response = await fetch('/word_chain_en/reset', { method: 'POST' });
//         if (!response.ok) {
//             throw new Error('Failed to reset the English game on the server');
//         }
//         const data = await response.json();
//         console.log(data.message); // 서버 응답 확인

//         // 클라이언트 데이터 초기화
//         history = [];
//         invalidAttempts = 0;
//         document.getElementById('history-en').innerHTML = '';
//         document.getElementById('result-en').textContent = '';
//         document.getElementById('user-word-en').value = '';

//         // 🟨 UI 횟수 초기화
//         document.getElementById('exchange-count-en').textContent = 0;
//         document.getElementById('error-count-en').textContent = 0;

//         // 화면 전환
//         document.getElementById('word-chain-game-en').classList.add('hidden');
//         document.getElementById('language-selection').classList.remove('hidden');

//         // 🟨 언어 선택 화면에서 커서 초기화
//         currentIndex = 0; // 커서를 첫 번째 메뉴(한국어)로 초기화
//         highlightMenu(currentIndex); // 초기화된 커서 강조 표시
//         speakText(menuItems[currentIndex].voice); // 초기화된 메뉴 음성 출력
//     } catch (error) {
//         console.error('Error resetting the game:', error);
//         alert('Error resetting the game.');
//     }
// });


//----------------------------음성출력관련---------------------------//

// 메뉴 항목 및 초기 상태
const menuItems = [
    { id: 'korean-btn', text: '한국어', voice: '한국어' },
    { id: 'english-btn', text: 'English', voice: '영어' }
];
let currentIndex = 0; // 현재 선택된 메뉴 인덱스
let inLanguageSelection = true; // 현재 언어 선택 화면 상태

// 음성 출력 함수
function speakText(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = text === 'English' ? 'en-US' : 'ko-KR'; // 언어 설정
    window.speechSynthesis.speak(speech);
}

// 메뉴 선택 강조 함수
function highlightMenu(index) {
    menuItems.forEach((item, i) => {
        const button = document.getElementById(item.id);
        if (i === index) {
            button.style.backgroundColor = 'yellow'; // 강조 표시
            button.style.color = 'black';
        } else {
            button.style.backgroundColor = ''; // 기본 스타일
            button.style.color = '';
        }
    });
}

// 언어 선택 화면에서 끝말잇기 화면으로 이동 시
document.addEventListener('keydown', (event) => {
    if (inLanguageSelection) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            // 방향키로 메뉴 이동
            if (event.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % menuItems.length;
            } else if (event.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            }

            highlightMenu(currentIndex); // 메뉴 강조
            speakText(menuItems[currentIndex].voice); // 음성 출력
        } else if (event.key === 'Enter') {
            // 선택된 언어의 끝말잇기 화면으로 전환
            const selectedItem = menuItems[currentIndex];
            document.getElementById('language-selection').classList.add('hidden');
            document.getElementById(selectedItem.id === 'korean-btn' ? 'word-chain-game' : 'word-chain-game-en').classList.remove('hidden');
            inLanguageSelection = false; // 언어 선택 종료

            // 🟨 선택된 화면에 따라 커서 초기화 및 강조
            if (selectedItem.id === 'korean-btn') {
                koreanGameIndex = 0; // 한국어 끝말잇기 커서 초기화
                highlightGameItem(koreanGameIndex, koreanGameItems);
                speakText(koreanGameItems[koreanGameIndex].voice, 'ko-KR');
            } else if (selectedItem.id === 'english-btn') {
                englishGameIndex = 0; // 영어 끝말잇기 커서 초기화
                highlightGameItem(englishGameIndex, englishGameItems);
                speakText(englishGameItems[englishGameIndex].voice, 'en-US');
            }
        }
    }
});


let isResetting = false; // 중복 요청 방지 플래그

// 한국어 끝말잇기 뒤로가기
document.getElementById('back-to-menu-ko').addEventListener('click', async () => {
    if (isResetting) return; // 진행 중인 요청이 있으면 종료
    isResetting = true;

    try {
        const response = await fetch('/word_chain/reset', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to reset the game on the server');
        }
        console.log('Server-side history after reset:', (await response.json()).history);

        // 데이터 및 UI 초기화
        history = [];
        invalidAttempts = 0;
        document.getElementById('history').innerHTML = '';
        document.getElementById('result').textContent = '';
        document.getElementById('user-word').value = '';
        document.getElementById('exchange-count').textContent = 0;
        document.getElementById('error-count').textContent = 0;

        // 화면 전환
        document.getElementById('word-chain-game').classList.add('hidden');
        document.getElementById('language-selection').classList.remove('hidden');

        // 언어 선택 커서 및 상태 초기화
        currentIndex = 0;
        inLanguageSelection = true; // 언어 선택 화면 활성화
        highlightMenu(currentIndex);
        speakText(menuItems[currentIndex].voice);
    } catch (error) {
        console.error('Error resetting the game:', error);
        alert('게임 초기화 중 오류가 발생했습니다.');
    } finally {
        isResetting = false; // 요청 완료 후 플래그 해제
    }
});

// 영어 끝말잇기 뒤로가기
document.getElementById('back-to-menu-en').addEventListener('click', async () => {
    if (isResetting) return; // 진행 중인 요청이 있으면 종료
    isResetting = true;

    try {
        const response = await fetch('/word_chain_en/reset', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to reset the English game on the server');
        }
        console.log('Server-side history after reset:', (await response.json()).history);

        // 데이터 및 UI 초기화
        history = [];
        invalidAttempts = 0;
        document.getElementById('history-en').innerHTML = '';
        document.getElementById('result-en').textContent = '';
        document.getElementById('user-word-en').value = '';
        document.getElementById('exchange-count-en').textContent = 0;
        document.getElementById('error-count-en').textContent = 0;

        // 화면 전환
        document.getElementById('word-chain-game-en').classList.add('hidden');
        document.getElementById('language-selection').classList.remove('hidden');

        // 언어 선택 커서 및 상태 초기화
        currentIndex = 0;
        inLanguageSelection = true; // 언어 선택 화면 활성화
        highlightMenu(currentIndex);
        speakText(menuItems[currentIndex].voice);
    } catch (error) {
        console.error('Error resetting the game:', error);
        alert('Error resetting the game.');
    } finally {
        isResetting = false; // 요청 완료 후 플래그 해제
    }
});


// 초기 강조 표시 및 음성 출력
highlightMenu(currentIndex);
speakText(menuItems[currentIndex].voice);




// 메뉴 항목 및 초기 상태
const koreanGameItems = [
    { id: 'user-word', text: '단어 입력창', voice: '단어 입력창', action: focusInput },
    { id: 'submit-word', text: '제출', voice: '제출', action: submitWord },
    { id: 'back-to-menu-ko', text: '뒤로가기', voice: '뒤로가기', action: backToMenu }
];
let koreanGameIndex = 0; // 현재 선택된 한국어 끝말잇기 항목 인덱스

const englishGameItems = [
    { id: 'user-word-en', text: 'Enter word box', voice: 'Enter word box', action: focusInputEn },
    { id: 'submit-word-en', text: 'Submit', voice: 'Submit', action: submitWordEn },
    { id: 'back-to-menu-en', text: 'Back to menu', voice: 'Back to menu', action: backToMenuEn }
];
let englishGameIndex = 0; // 현재 선택된 영어 끝말잇기 항목 인덱스


let isSpeaking = false; // 음성 출력 중 여부 플래그

// 단어 입력창 포커스 (한국어)
function focusInput() {
    const inputField = document.getElementById('user-word');
    if (document.activeElement !== inputField) {
        inputField.focus();
        if (!isSpeaking) { // 음성이 이미 출력 중이 아니라면
            speakText('단어를 입력하세요.', 'ko-KR');
        }
    }
}

// 단어 입력창 포커스 (영어)
function focusInputEn() {
    const inputField = document.getElementById('user-word-en');
    if (document.activeElement !== inputField) {
        inputField.focus();
        if (!isSpeaking) { // 음성이 이미 출력 중이 아니라면
            speakText('Enter a word.', 'en-US');
        }
    }
}


function submitWord() {
    document.getElementById('submit-word').click(); // 제출 버튼 동작
}

function submitWordEn() {
    document.getElementById('submit-word-en').click(); // 영어 제출 버튼 동작
}

function backToMenu() {
    document.getElementById('back-to-menu-ko').click(); // 한국어 끝말잇기 뒤로가기
}

function backToMenuEn() {
    document.getElementById('back-to-menu-en').click(); // 영어 끝말잇기 뒤로가기
}

// 음성 출력 함수
function speakText(text, lang = 'ko-KR') {
    window.speechSynthesis.cancel(); // 현재 음성 중단
    setTimeout(() => {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = lang;
        window.speechSynthesis.speak(speech);
    }, 100); // 짧은 딜레이 추가
}

// 항목 강조 표시
function highlightGameItem(index, gameItems) {
    gameItems.forEach((item, i) => {
        const element = document.getElementById(item.id);
        if (i === index) {
            element.style.backgroundColor = 'yellow'; // 강조 표시
            element.style.color = 'black';
        } else {
            element.style.backgroundColor = ''; // 기본 스타일
            element.style.color = '';
        }
    });
}

// 방향키 및 Enter 키 입력 처리
document.addEventListener('keydown', (event) => {
    // 한국어 끝말잇기 화면
    // 한국어 끝말잇기 커서 이동 및 동작 수행
    if (!document.getElementById('word-chain-game').classList.contains('hidden')) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if (event.key === 'ArrowRight') {
                koreanGameIndex = (koreanGameIndex + 1) % koreanGameItems.length;
            } else if (event.key === 'ArrowLeft') {
                koreanGameIndex = (koreanGameIndex - 1 + koreanGameItems.length) % koreanGameItems.length;
            }

            // 🟨 항목 강조 및 음성 출력
            highlightGameItem(koreanGameIndex, koreanGameItems);
            speakText(koreanGameItems[koreanGameIndex].voice, 'ko-KR');
        } else if (event.key === 'Enter') {
            koreanGameItems[koreanGameIndex].action(); // 선택된 항목의 동작 수행
        }
    }

    // 영어 끝말잇기 커서 이동 및 동작 수행
    if (!document.getElementById('word-chain-game-en').classList.contains('hidden')) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if (event.key === 'ArrowRight') {
                englishGameIndex = (englishGameIndex + 1) % englishGameItems.length;
            } else if (event.key === 'ArrowLeft') {
                englishGameIndex = (englishGameIndex - 1 + englishGameItems.length) % englishGameItems.length;
            }

            // 🟨 항목 강조 및 음성 출력
            highlightGameItem(englishGameIndex, englishGameItems);
            speakText(englishGameItems[englishGameIndex].voice, 'en-US');
        } else if (event.key === 'Enter') {
            englishGameItems[englishGameIndex].action(); // 선택된 항목의 동작 수행
        }
    }

});

// 초기 항목 강조 및 음성 출력
highlightGameItem(koreanGameIndex, koreanGameItems);
highlightGameItem(englishGameIndex, englishGameItems);