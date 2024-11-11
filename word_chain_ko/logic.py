#끝말잇기 알고리즘(단어 검색, 두음법칙, 유효성 검사)
import hgtk
import random
from word_chain_ko.utils import is_valid_korean_word, fetch_nouns_from_api 
#decompose_korean_letter

history = []
#blacklist = ['즘', '틱', '늄', '슘', '퓸', '늬', '뺌', '섯', '숍', '튼', '름', '늠', '쁨']


def check_word_validity(word, history):
    print(f"Validating word: {word}")
    if word in history:
        print(f"Word '{word}' has already been used")
        return False, "Word has already been used"
    if len(word) < 2:
        print(f"Word '{word}' is too short")
        return False, "Word must be at least 2 characters long"
    if not is_valid_korean_word(word):
        print(f"Word '{word}' is not valid according to the dictionary")
        return False, "Word does not exist in the dictionary"
    return True, None


import hgtk

def apply_duum_law(full_letter):
    """
    두음법칙을 적용하여 변환된 음절을 반환합니다.
    """
    import hgtk
    try:
        # 글자 분해
        initial, vowel, final = hgtk.letter.decompose(full_letter)
    except hgtk.exception.NotHangulException:
        print(f"Invalid Hangul letter: {full_letter}")
        return full_letter  # 한글이 아닌 경우 그대로 반환

    # 두음법칙 적용 초성 변환
    duum_mapping = {
        "ㄴ": "ㅇ",  # "녀" → "여"
        "ㄹ": "ㄴ"   # "례" → "예"
    }
    transformed_initial = duum_mapping.get(initial, initial)  # 초성 변환

    # 변환된 음절 구성
    transformed_letter = hgtk.letter.compose(transformed_initial, vowel, final)
    print(f"Applying duum law: {full_letter} → {transformed_letter}")
    return transformed_letter




def generate_next_word(history):
    """
    사용자의 입력을 기반으로 컴퓨터의 다음 단어를 생성합니다.
    두음법칙을 우선 적용하여 API에서 단어를 검색하고 선택합니다.
    """
    if not history:
        return None  # 사용자가 입력한 단어가 없을 경우

    last_word = history[-1]  # 사용자가 마지막으로 입력한 단어
    last_char = last_word[-1]  # 마지막 글자 추출

    # 두음법칙 적용된 음절로 후보 찾기 (우선적으로 적용)
    transformed_char = apply_duum_law(last_char)
    print(f"Transformed char after duum law: {transformed_char}")
    candidates = fetch_nouns_from_api(transformed_char)
    print(f"Candidates after applying duum law: {candidates}")

    # 두음법칙으로 후보가 없을 경우 원래 마지막 글자로 후보 찾기
    if not candidates:
        print(f"No candidates with transformed char '{transformed_char}'. Trying last char '{last_char}'...")
        candidates = fetch_nouns_from_api(last_char)
        print(f"Candidates matching last char '{last_char}': {candidates}")

    # 후보가 없다면 None 반환
    if not candidates:
        print("No valid candidates available. Ending the game.")
        return None

    # 2글자 이상 단어만 필터링
    filtered_candidates = [word for word in candidates if len(word) >= 2]
    print(f"Filtered candidates (2 or more chars): {filtered_candidates}")

    # 필터링 후 후보가 없다면 None 반환
    if not filtered_candidates:
        print("No valid 2-character candidates available. Ending the game.")
        return None

    # 후보가 있다면 무작위로 선택하여 반환
    chosen_word = random.choice(filtered_candidates)
    print(f"Chosen word: {chosen_word}")
    return chosen_word


if __name__ == "__main__":
    history = ["사과", "라면"]  # 입력된 단어 기록
    next_word = generate_next_word(history)  # 다음 단어 생성
    print(f"Next word: {next_word}")
