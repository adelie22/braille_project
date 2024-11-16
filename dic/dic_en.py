import requests

# Merriam-Webster API 키 및 URL 설정
API_KEY = "fcd61f5d-0858-4191-a144-0f03567277fe"  # Merriam-Webster API 키를 여기에 입력하세요
API_URL = "https://www.dictionaryapi.com/api/v3/references/sd4/json"

def check_word_in_dictionary(word):
    """
    Merriam-Webster 사전을 사용하여 단어의 존재 여부를 확인합니다.
    :param word: 확인하려는 단어 (str)
    :return: 단어가 사전에 존재하면 True, 아니면 False
    """
    params = {
        "key": API_KEY  # API 키
    }
    try:
        # API 호출
        response = requests.get(f"{API_URL}/{word}", params=params)
        response.raise_for_status()
        data = response.json()

        # API 응답 디버깅 출력 (선택적으로 주석 처리 가능)
        print(f"DEBUG: API response for '{word}': {data}")

        # 단어가 존재하는지 판단
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            return True  # 단어가 사전에 존재
        else:
            return False  # 단어가 사전에 존재하지 않음

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False
    
if __name__ == "__main__":
    word_to_check = "awesome"  # 확인하려는 단어
    exists = check_word_in_dictionary(word_to_check)
    print(f"Does the word '{word_to_check}' exist? {exists}")


