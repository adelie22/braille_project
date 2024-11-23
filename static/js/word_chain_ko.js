// static/js/word_chain_ko.js

document.addEventListener('DOMContentLoaded', function () {
    let navigableItems;
    let currentIndex = 0;

    // 초기화 함수
    function initializeMenu() {
        navigableItems = [
            document.getElementById('user-word-ko'),
            document.getElementById('back-to-menu-ko'),
        ];

        navigableItems[currentIndex].classList.add('selected');
        speakMessage(getItemLabel(navigableItems[currentIndex]));
    }

    // 음성 출력 함수
    function speakMessage(message) {
        console.log('Speaking message:', message); // 디버깅 로그
        window.speechSynthesis.cancel(); // 이전 음성 중단
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'ko-KR';
            window.speechSynthesis.speak(utterance);
        }, 100); // 지연 시간 추가
    }

    // 각 항목의 라벨 가져오기
    function getItemLabel(item) {
        if (item.tagName === 'INPUT') {
            return '단어 입력창';
        } else if (item.id === 'back-to-menu-ko') {
            return '뒤로가기 버튼';
        }
        return '';
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
        speakMessage(getItemLabel(navigableItems[currentIndex]));
        navigableItems[currentIndex].focus();
    }

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', (event) => {
        if (document.getElementById('popup-ko').style.display === 'block') {
            // 팝업이 열려있을 때는 외부 키보드 이벤트 무시
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
            if (activeElement.id === 'back-to-menu-ko') {
                // 뒤로가기 버튼 클릭 동작
                window.location.href = "/word_chain_menu"; // 실제 메뉴 URL로 변경하세요
            } else if (activeElement.tagName === 'INPUT') {
                // 입력창에서 Enter 키 누르면 단어 제출
                const word = document.getElementById('user-word-ko').value.trim();
                if (word) {
                    submitWord(word);
                } else {
                    speakMessage('단어를 입력하세요.');
                }
            }
        }
    });

    // 단어 제출 함수
    function submitWord(word) {
        fetch('/word_chain_ko/check_word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: word }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    document.getElementById('result-ko').innerText = data.error;
                    speakMessage(data.error);
                    openPopupKo(data.error);
                } else {
                    document.getElementById('result-ko').innerText = data.message;
                    speakMessage(data.message);
                    updateHistory(data.history);
                    // 입력창 초기화
                    document.getElementById('user-word-ko').value = '';
                    // 입력창에 다시 포커스
                    document.getElementById('user-word-ko').focus();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                speakMessage('오류가 발생했습니다.');
            });
    }

    // 히스토리 업데이트 함수
    function updateHistory(history) {
        const historyList = document.getElementById('history-ko');
        historyList.innerHTML = '';
        history.forEach((word) => {
            const listItem = document.createElement('li');
            listItem.textContent = word;
            historyList.appendChild(listItem);
        });
    }

    // 팝업 열기 함수 (오류 발생 시)
    function openPopupKo(message) {
        document.getElementById('popup-ko').style.display = 'block';
        document.getElementById('popup-message-ko').innerText = message;
        navigableItems = [
            document.getElementById('retry-button-ko'),
            document.getElementById('cancel-button-ko'),
        ];
        currentIndex = 0;
        navigableItems[currentIndex].classList.add('selected');
        speakMessage(getItemLabel(navigableItems[currentIndex]));
    }

    // 팝업 닫기 함수
    function closePopupKo() {
        document.getElementById('popup-ko').style.display = 'none';
        navigableItems.forEach(item => item.classList.remove('selected'));
        currentIndex = 0;
        initializeMenu();
    }

    // 팝업 내 키 입력 핸들러
    function handlePopupNavigationKo(e) {
        e.preventDefault();
        if (!navigableItems) return;

        if (e.key === 'ArrowLeft') {
            navigatePopupKo('left');
        } else if (e.key === 'ArrowRight') {
            navigatePopupKo('right');
        } else if (e.key === 'Enter') {
            const activeElement = navigableItems[currentIndex];
            if (activeElement.id === 'retry-button-ko') {
                // 재시도 버튼 클릭 동작
                const word = document.getElementById('user-word-ko').value.trim();
                if (word) {
                    submitWord(word);
                    closePopupKo();
                } else {
                    speakMessage('단어를 입력하세요.');
                }
            } else if (activeElement.id === 'cancel-button-ko') {
                // 취소 버튼 클릭 동작
                closePopupKo();
            }
        }
    }

    // 팝업 메뉴 간 이동 함수
    function navigatePopupKo(direction) {
        navigableItems[currentIndex].classList.remove('selected');
        window.speechSynthesis.cancel(); // 현재 음성 중단

        // 인덱스 업데이트
        if (direction === 'left') {
            currentIndex = (currentIndex - 1 + navigableItems.length) % navigableItems.length;
        } else if (direction === 'right') {
            currentIndex = (currentIndex + 1) % navigableItems.length;
        }

        navigableItems[currentIndex].classList.add('selected');
        speakMessage(getItemLabel(navigableItems[currentIndex]));
        navigableItems[currentIndex].focus();
    }

    // 팝업 이벤트 리스너 추가
    document.addEventListener('keydown', (event) => {
        if (document.getElementById('popup-ko').style.display === 'block') {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter') {
                handlePopupNavigationKo(event);
            }
        }
    });

    // 팝업 버튼 클릭 이벤트 리스너
    document.getElementById('retry-button-ko').addEventListener('click', () => {
        const word = document.getElementById('user-word-ko').value.trim();
        if (word) {
            submitWord(word);
            closePopupKo();
        } else {
            speakMessage('단어를 입력하세요.');
        }
    });

    document.getElementById('cancel-button-ko').addEventListener('click', () => {
        closePopupKo();
    });

    // 초기화
    initializeMenu();
});
