// static/js/word_chain_en.js

document.addEventListener('DOMContentLoaded', function () {
    let navigableItems;
    let currentIndex = 0;

    // 게임 상태 변수
    let incorrectAttempts = 0;
    let totalExchanges = 0;
    let lastExchange = { user: '', computer: '' };
    let gameOver = false;

    // 초기화 함수
    function initializeMenu() {
        navigableItems = [
            document.getElementById('user-word-en'),
            document.getElementById('back-to-menu-en'),
        ];

        currentIndex = 0;
        navigableItems[currentIndex].classList.add('selected');
        navigableItems[currentIndex].focus();
        speakMessage(getItemLabel(navigableItems[currentIndex]));
        updateAttemptsDisplay();
        updateExchangeDisplay();
    }

    // 음성 출력 함수
      function speakMessage(message) {
        console.log('Speaking message:', message); // 디버깅 로그
        window.speechSynthesis.cancel(); // 이전 음성 중단
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }, 100); // 지연 시간 추가
    }

    // 각 항목의 라벨 가져오기
    function getItemLabel(item) {
        if (item.tagName === 'INPUT') {
            return 'Input Field';
        } else if (item.id === 'back-to-menu-en') {
            return 'Back to Menu Button';
        } else if (item.id === 'retry-button-en') {
            return 'Retry Button';
        } else if (item.id === 'cancel-button-en') {
            return 'Cancel Button';
        }
        return '';
    }

    // 시도 횟수 및 교환 횟수 업데이트 함수
    function updateAttemptsDisplay() {
        const attemptsDisplay = document.getElementById('attempts-en');
        attemptsDisplay.innerText = `Incorrect Attempts: ${incorrectAttempts} | Total Exchanges: ${totalExchanges}`;
    }

    // 교환 내용 업데이트 함수
    function updateExchangeDisplay() {
        const exchangeElement = document.getElementById('exchange-en');
        exchangeElement.style.opacity = 0; // 기존 단어 숨기기

        setTimeout(() => {
            if (lastExchange.user && lastExchange.computer) {
                exchangeElement.innerHTML = `${lastExchange.user} → ${lastExchange.computer}`;
            } else if (lastExchange.user) {
                exchangeElement.innerHTML = `${lastExchange.user} → `;
            } else if (lastExchange.computer) {
                exchangeElement.innerHTML = `→ ${lastExchange.computer}`;
            } else {
                exchangeElement.innerHTML = '';
            }

            // 게임스러운 애니메이션 추가
            exchangeElement.style.transform = 'scale(1.2)';
            exchangeElement.style.opacity = 1; // 새로운 단어 보여주기
            setTimeout(() => {
                exchangeElement.style.transform = 'scale(1)'; // 크기를 원래대로
            }, 300);
        }, 300);
    }



    // 교환 내용 업데이트 함수 (단어를 직접 교환할 때 사용)
    function updateExchange(userWord, computerWord) {
        const exchangeElement = document.getElementById('exchange-en');
        exchangeElement.style.opacity = 0; // 기존 단어 숨기기

        setTimeout(() => {
            if (userWord && computerWord) {
                exchangeElement.innerHTML = `${userWord} → ${computerWord}`;
            } else if (userWord) {
                exchangeElement.innerHTML = `${userWord} → `;
            } else if (computerWord) {
                exchangeElement.innerHTML = `→ ${computerWord}`;
            } else {
                exchangeElement.innerHTML = '';
            }

            // 게임스러운 애니메이션 추가
            exchangeElement.style.transform = 'scale(1.5)';
            exchangeElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            exchangeElement.style.opacity = 1; // 새로운 단어 보여주기
            setTimeout(() => {
                exchangeElement.style.transform = 'scale(1)'; // 크기를 원래대로
            }, 300);
        }, 300);
    }

    // 메뉴 간 이동 함수
    function navigateMenu(direction) {
        navigableItems[currentIndex].classList.remove('selected');
        window.speechSynthesis.cancel(); // 현재 음성 중단

        // 인덱스 업데이트
        if (direction === 'left') {
            currentIndex = (currentIndex - 1 + navigableItems.length) % navigableItems.length;
        } else if (direction === 'right') {
            currentIndex = (currentIndex + 1) % navigableItems.length;
        }

        navigableItems[currentIndex].classList.add('selected');
        navigableItems[currentIndex].focus();
        speakMessage(getItemLabel(navigableItems[currentIndex]));
    }

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', (event) => {
        if (document.getElementById('popup-en').style.display === 'block') {
            // 팝업이 열려있을 때는 외부 키보드 이벤트 무시
            return;
        }

        if (gameOver) {
            // 게임 종료 상태에서는 키보드 입력 무시
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateMenu('left');
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateMenu('right');
        } else if (event.key === 'Enter') {
            const activeElement = navigableItems[currentIndex];
            if (activeElement.id === 'back-to-menu-en') {
                // 뒤로가기 버튼 클릭 동작
                window.location.href = "/word_chain_menu"; // 실제 메뉴 URL로 변경하세요
            } else if (activeElement.tagName === 'INPUT') {
                // 입력창에서 Enter 키 누르면 단어 제출
                const word = document.getElementById('user-word-en').value.trim();
                if (word) {
                    submitWord(word);
                } else {
                    speakMessage('Please enter a word.');
                }
            }
        }
    });

    // 사용자가 단어를 제출했을 때
    function submitWord(word) {
        // 단어 길이 확인 (3글자 미만이면 틀린 횟수 증가하지 않음)
        const isEnglish = /^[a-zA-Z]+$/.test(word);
        if (!isEnglish) {
            speakMessage('Please enter a word in English.');
            document.getElementById('user-word-en').value = ''; // 입력창 초기화
            document.getElementById('user-word-en').focus(); // 입력창에 다시 포커스
            return; // 더 이상 처리하지 않음
        }

        // 단어 길이 확인 (3글자 미만이면 틀린 횟수 증가하지 않음)
        if (word.length < 3) {
            speakMessage('The word must be at least 3 letters long.');
            document.getElementById('user-word-en').value = ''; // 입력창 초기화
            document.getElementById('user-word-en').focus(); // 입력창에 다시 포커스
            return; // 더 이상 처리하지 않음
        }

        fetch('/word_chain_en/check_word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: word }),
        })
            .then((response) => response.json())
            .then((data) => {
                // 입력창 초기화 및 포커스는 성공/실패에 관계없이 항상 수행
                document.getElementById('user-word-en').value = ''; // 입력창 초기화
                document.getElementById('user-word-en').focus(); // 입력창에 다시 포커스

                if (data.error) {
                    document.getElementById('result-en').innerText = data.error;
                    speakMessage(data.error);

                    // 틀린 횟수 증가 조건 추가: 3단어 이상인 경우에만 증가
                    if (word.length >= 3) {
                        incorrectAttempts += 1; // 틀린 횟수 증가
                        updateAttemptsDisplay(); // 틀린 횟수 업데이트

                        if (incorrectAttempts >= 3) {
                            gameOver = true;
                            speakMessage('Game over. Press Enter to continue or Escape to quit.');
                            openGameOverPopup();
                        }
                    }
                } else {
                    document.getElementById('result-en').innerText = data.message;
                    speakMessage(word); // 사용자 단어 음성 출력
                    lastExchange.user = word; // 사용자 단어 기록
                    updateExchangeDisplay(); // 교환 내용 업데이트
                    totalExchanges += 1; // 교환 횟수 증가
                    updateAttemptsDisplay(); // 교환 횟수 업데이트

                    fetch('/word_chain_en/generate_word')
                        .then((response) => response.json())
                        .then((computerData) => {
                            if (computerData.error) {
                                speakMessage(computerData.error);
                                gameOver = true;
                                speakMessage('Computer cannot generate a word. Press Enter to continue or Escape to quit.');
                                openGameOverPopup();
                            } else {
                                const computerWord = computerData.word;
                                lastExchange.computer = computerWord; // 컴퓨터 단어 기록
                                updateExchangeDisplay(); // 교환 내용 업데이트
                                speakMessage(computerWord); // 컴퓨터 단어 음성 출력
                                totalExchanges += 1; // 교환 횟수 증가
                                updateAttemptsDisplay(); // 교환 횟수 업데이트
                            }
                        });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                speakMessage('An error occurred.');

                // 입력창 초기화 및 포커스는 실패 시에도 수행
                document.getElementById('user-word-en').value = '';
                document.getElementById('user-word-en').focus();
            });
    }




    // 유효하지 않은 단어 처리 함수
    function handleInvalidWord(errorMessage, word) {
        console.log(`Invalid word: ${errorMessage}`);
        speakMessage(errorMessage);
        incorrectAttempts += 1;
        updateAttemptsDisplay();
 
        // 1번 기능: 3글자 미만 입력 시
        if (errorMessage.includes('at least')) {
            // 이미 음성으로 안내되었으므로 추가 동작 필요 없음
        }

        // 3번 기능: 올바르지 않은 시작 글자
        // 4번 기능: 중복 단어
        // 이 두 기능은 errorMessage에 따라 분기 처리됨

        // 6번 기능: 3번 틀리면 게임 종료
        if (incorrectAttempts >= 3) {
            gameOver = true;
            speakMessage('Game over. Press Enter to continue or Escape to quit.');
            openGameOverPopup();
        }
    }

    // 유효한 단어 처리 함수
    function handleValidWord(userWord, history) {
        console.log(`Valid word: ${userWord}`);
        speakMessage(`You entered: ${userWord}`);
        document.getElementById('user-word-en').value = '';
        totalExchanges += 1;
        updateAttemptsDisplay();
        lastExchange.user = userWord;
        updateExchangeDisplay();

        // 컴퓨터 단어 생성
        generateComputerWord();
    }

    // 컴퓨터 단어 생성 함수
    function generateComputerWord() {
        fetch('/word_chain_en/generate_word', {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    handleComputerError(data.error);
                } else {
                    handleComputerWord(data.word);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                speakMessage('An error occurred while generating a word.');
            });
    }

    // 컴퓨터 단어 처리 함수
    function handleComputerWord(computerWord) {
        console.log(`Computer generated: ${computerWord}`);
        speakMessage(`Computer entered: ${computerWord}`);
        lastExchange.computer = computerWord;
        updateExchangeDisplay();
        totalExchanges += 1;
        updateAttemptsDisplay();
    }

    // 컴퓨터 오류 처리 함수
    function handleComputerError(errorMessage) {
        console.log(`Computer error: ${errorMessage}`);
        speakMessage(errorMessage);
        gameOver = true;
        speakMessage('Computer cannot generate a word. Press Enter to continue or Escape to quit.');
        openGameOverPopup();
    }

    // 히스토리 업데이트 함수
    function updateHistory(history) {
        const historyList = document.getElementById('history-en');
        historyList.innerHTML = '';
        history.forEach((word) => {
            const listItem = document.createElement('li');
            listItem.textContent = word;
            historyList.appendChild(listItem);
        });
    }

    // 팝업 열기 함수
    function openGameOverPopup() {
        const popup = document.getElementById('popup-en');
        const message = document.getElementById('popup-message-en');

        if (incorrectAttempts >= 3) {
            message.innerText = 'Game over. Press Enter to continue or Escape to quit.';
        } else {
            message.innerText = 'Computer cannot generate a word. Press Enter to continue or Escape to quit.';
        }

        popup.style.display = 'block';
        navigableItems = [
            document.getElementById('retry-button-en'),
            document.getElementById('cancel-button-en'),
        ];
        currentIndex = 0;
        navigableItems[currentIndex].classList.add('selected');
        navigableItems[currentIndex].focus();
        speakMessage(getItemLabel(navigableItems[currentIndex]));
    }

    // 팝업 닫기 함수
    function closeGameOverPopup() {
        const popup = document.getElementById('popup-en');
        popup.style.display = 'none';
        navigableItems.forEach(item => item.classList.remove('selected'));
        currentIndex = 0;
        initializeMenu();
    }

    // 팝업 내 키 입력 핸들러
    function handlePopupNavigationEn(e) {
        e.preventDefault();
        if (!navigableItems) return;

        if (e.key === 'ArrowLeft') {
            navigatePopupEn('left');
        } else if (e.key === 'ArrowRight') {
            navigatePopupEn('right');
        } else if (e.key === 'Enter') {
            const activeElement = navigableItems[currentIndex];
            if (activeElement.id === 'retry-button-en') {
                // 게임 재시작 버튼 클릭 동작
                restartGame();
            } else if (activeElement.id === 'cancel-button-en') {
                // 게임 종료 버튼 클릭 동작
                quitGame();
            }
        } else if (e.key === 'Escape') {
            // ESC 키를 누르면 게임 종료
            quitGame();
        }
    }

    // 팝업 메뉴 간 이동 함수
    function navigatePopupEn(direction) {
        navigableItems[currentIndex].classList.remove('selected');
        window.speechSynthesis.cancel(); // 현재 음성 중단

        // 인덱스 업데이트
        if (direction === 'left') {
            currentIndex = (currentIndex - 1 + navigableItems.length) % navigableItems.length;
        } else if (direction === 'right') {
            currentIndex = (currentIndex + 1) % navigableItems.length;
        }

        navigableItems[currentIndex].classList.add('selected');
        navigableItems[currentIndex].focus();
        speakMessage(getItemLabel(navigableItems[currentIndex]));
    }

    // 팝업 이벤트 리스너 추가
    document.addEventListener('keydown', (event) => {
        if (document.getElementById('popup-en').style.display === 'block') {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' || event.key === 'Escape') {
                handlePopupNavigationEn(event);
            }
        }
    });

    // 팝업 버튼 클릭 이벤트 리스너
    document.getElementById('retry-button-en').addEventListener('click', () => {
        restartGame();
    });

    document.getElementById('cancel-button-en').addEventListener('click', () => {
        quitGame();
    });

    // 게임 재시작 함수
    function restartGame() {
        fetch('/word_chain_en/reset', {
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
                speakMessage('Game has been restarted.');
                incorrectAttempts = 0; // 틀린 횟수 초기화
                totalExchanges = 0; // 교환 횟수 초기화
                lastExchange = { user: '', computer: '' }; // 교환 내용 초기화
                updateAttemptsDisplay(); // 시도 횟수 표시 초기화
                updateExchangeDisplay(); // 교환 내용 표시 초기화
                closeGameOverPopup();
                // 페이지 새로 고침
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error resetting game:', error);
                speakMessage('An error occurred while restarting the game.');
            });
    }

    // 게임 종료 함수
    function quitGame() {
        speakMessage('Exiting the game. Returning to the menu.');
        window.location.href = "/word_chain_menu"; // 실제 메뉴 URL로 변경하세요
    }

    // 게임 초기화 함수 호출
    function initializeGame() {
        // 게임을 처음 시작하거나 다시 시작할 때 서버 히스토리를 초기화
        fetch('/word_chain_en/reset', {
            method: 'POST',
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
                initializeMenu();
            })
            .catch((error) => {
                console.error('Error resetting game:', error);
                speakMessage('An error occurred while initializing the game.');
                initializeMenu(); // 초기화 시도
            });
    }

    

    // 게임 초기화 호출
    initializeGame();
});
