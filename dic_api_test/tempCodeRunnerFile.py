def check_word_in_dictionary(word):
    """
    Merriam-Webster 사전을 사용하여 단어의 존재 여부를 확인합니다.
    """
    params = {
        "key": API_KEY  # API 키
    }
    try:
        # API 호출
        response = requests.get(f"{API_URL}/{word}", params=params)
        response.raise_for_status()
        data = response.json()

        # API 응답 디버깅 출력
        print(f"DEBUG: API response for '{word}': {data}")

        # 단어가 존재하는지 판단
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            print(f"'{word}' exists in the dictionary.")
            return True
        else:
            print(f"'{word}' does not exist in the dictionary.")
            return False

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

# 테스트 실행
if __name__ == "__main__":
    word_to_check = "apple"  # 확인하려는 단어
    exists = check_word_in_dictionary(word_to_check)

    if exists:
        print(f"The word '{word_to_check}' is valid in the dictionary.")
    else:
        print(f"The word '{word_to_check}' is not found in the dictionary.")
