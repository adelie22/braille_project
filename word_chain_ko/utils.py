import requests
from word_chain.config import API_KEY  # API 키를 config에서 가져오기

def is_valid_korean_word(word):
    """
    국립국어원 API를 사용하여 한국어 단어의 유효성을 확인합니다.
    """

    # 한글이 아닌 단어를 미리 필터링
    if not all('\uac00' <= char <= '\ud7a3' for char in word):
        print(f"Invalid Korean word: {word}")
        return False

    # 국립국어원 API URL
    URL = "https://opendict.korean.go.kr/api/search"
    params = {
        "key": API_KEY,  # 발급받은 API 키
        "q": word,       # 검색할 단어
        "req_type": "xml",  # 응답 형식: XML
        "part": "word",  # 검색 범위: 단어
        "sort": "dict"   # 사전순 정렬
    }

    try:
        # API 요청
        response = requests.get(URL, params=params)
        print(f"Requesting: {response.url}")

        if response.status_code == 200:
            # 응답 본문에서 "<item>" 문자열 검색
            if "<item>" in response.text:
                print(f"Valid word found: {word}")
                return True
            else:
                print(f"Word not found in dictionary: {word}")
                return False
        elif response.status_code == 403:
            print("Invalid API key or unauthorized access.")
        elif response.status_code == 400:
            print("Bad request. Please check your parameters.")
        else:
            print(f"Unexpected error: {response.status_code}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return False


# 테스트 코드
if __name__ == "__main__":
    test_words = ["사과", "바나나", "1234", "abc", "꽃"]
    for word in test_words:
        result = is_valid_korean_word(word)
        print(f"Word: {word}, Valid: {result}")




def decompose_korean_letter(letter):
    # 한글 분해 함수 (예: hgtk 사용)
    import hgtk
    return hgtk.letter.decompose(letter)

test_words = ["사과", "바나나", "1234", "abc"]
for word in test_words:
    result = is_valid_korean_word(word)
    print(f"Word: {word}, Valid: {result}")

