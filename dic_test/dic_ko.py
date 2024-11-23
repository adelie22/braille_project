import requests
import random

API_KEY = "EBA62B70858702831F1CBA4BF20BE924"
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
        # API 호출
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        # 단어 추출
        nouns = []
        items = data.get("channel", {}).get("item", [])
        print(f"DEBUG: Items count: {len(items)}")  # 디버깅: 아이템 개수 출력

        for item in items:
            word = item.get("sense", {}).get("word")
            pos = item.get("sense", {}).get("pos")

            print(f"DEBUG: Current word: {word}, POS: {pos}")  # 디버깅: 현재 단어와 품사 출력

            if word and pos == "명사":  # 명사 필터링
                nouns.append(word)

        # '-' 제거 처리
        nouns = [word.replace("-", "") for word in nouns]
        print(f"Cleaned nouns: {nouns}")

        # starting_char로 시작하는 단어 필터링
        filtered_nouns = [word for word in nouns if word.startswith(starting_char)]
        print(f"Nouns starting with '{starting_char}': {filtered_nouns}")
        return filtered_nouns
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

# 테스트 실행
if __name__ == "__main__":
    starting_char = "가나"  
# 여기 임의의 문자를 넣고 사전에서 starting_char을 포함하는 단어를 가져와서 전처리 후 해당 글자로 시작하는 단어를 불러오는지 확인 가능
    nouns = fetch_nouns_from_api(starting_char)  # 결과를 리스트로 저장

    if nouns:  # 리스트가 비어있지 않을 때
        random_word = random.choice(nouns)  # 랜덤 단어 선택
        print(f"Random word starting with '{starting_char}': {random_word}")
    else:
        print(f"No words found starting with '{starting_char}'")


