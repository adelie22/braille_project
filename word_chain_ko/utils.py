import requests, hgtk
from word_chain_ko.config import API_KEY  # API 키를 config에서 가져오기

API_URL = "https://opendict.korean.go.kr/api/search"

def fetch_nouns_from_api(starting_char, num_results=100):
    params = {
        "key": API_KEY,
        "q": starting_char,
        "req_type": "json",
        "part": "word",
        "sort": "popular",
        "pos": 1,
        "num": num_results,
    }
    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        nouns = [
            item.get("sense", {}).get("word").replace("-", "")
            for item in data.get("channel", {}).get("item", [])
            if item.get("sense", {}).get("pos") == "명사"
        ]
        return [word for word in nouns if word.startswith(starting_char)]
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return []

def get_last_character(word):
    """단어의 마지막 글자를 반환"""
    return hgtk.text.decompose(word)[-1] if word else None

def is_valid_korean_word(word):
    """
    국립국어원 API를 사용하여 한국어 단어의 유효성을 확인합니다.
    """
    if not all('\uac00' <= char <= '\ud7a3' for char in word):
        print(f"Invalid Korean word: {word}")
        return False

    params = {
        "key": API_KEY,
        "q": word,
        "req_type": "xml",
        "part": "word",
        "sort": "dict"
    }
    try:
        response = requests.get(API_URL, params=params)
        print(f"Requesting: {response.url}")
        if response.status_code == 200 and "<item>" in response.text:
            print(f"Valid word found: {word}")
            return True
        return False
    except Exception as e:
        print(f"Error validating word: {e}")
        return False





# def decompose_korean_letter(letter):
#     # 한글 분해 함수 (예: hgtk 사용)
#     import hgtk
#     return hgtk.letter.decompose(letter)

# test_words = ["사과", "바나나", "1234", "abc"]
# for word in test_words:
#     result = is_valid_korean_word(word)
#     print(f"Word: {word}, Valid: {result}")