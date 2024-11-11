#끝말잇기 알고리즘(단어 검색, 두음법칙, 유효성 검사)
import hgtk
import random
from word_chain_ko.utils import is_valid_korean_word, decompose_korean_letter

history = []
blacklist = ['즘', '틱', '늄', '슘', '퓸', '늬', '뺌', '섯', '숍', '튼', '름', '늠', '쁨']


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


word_list = [
    "사과", "바나나", "딸기", "수박", "복숭아", "포도", "물고기",
    "거북이", "코끼리", "호랑이", "물방울", "자전거", "버스", "기차",
    "비행기", "냉장고", "텔레비전", "컴퓨터", "스마트폰", "의자",
    "탁자", "아이스크림", "지우개", "연필", "과일", "야채",
    "김치", "과자", "노트", "책", "학생", "직장인", "소방관",
    "요리사", "과학자", "화가", "운동선수", "한국", "미국", "일본",
    "여름", "겨울", "가을", "아침", "점심", "저녁", "간식",
    "여행", "공원", "해변", "호텔", "식당", "영화관", "학교",
    "회사", "문화재", "유적지", "전통", "관습", "패션", "디자인",
    "정원", "인형", "침대", "사전", "화장실", "전기", "선생님",
    "이불", "축제", "스포츠", "음악", "미술", "게임", "드라마",
    "소설", "이야기", "뉴스", "정보", "역사", "인물", "가위",
    "리본", "고래", "오리", "개", "고양이", "토끼", 
    "소", "돼지", "벌레", "거미", "장갑", "신발", "후드티",
    "지갑", "햄버거", "프라이", "치킨", "떡볶이", "라면", "초밥",
    "가방", "가위", "가을", "가족", "간식", "감자", "강아지", "건물", "경찰", "공원", "공책", "과일",
    "교실", "구름", "그림", "기차", "나무", "낙엽", "냉장고", "노트", "눈", "다리", "다이아몬드", "단풍",
    "달걀", "달력", "대문", "도서관", "동물", "드라마", "등산", "딸기", "라디오", "라면", "레몬", "로봇",
    "마을", "망고", "매미", "매점", "머리", "모자", "목걸이", "목욕", "물고기", "미술", "바나나", "바람",
    "박물관", "반지", "배구", "배추", "백화점", "버스", "별", "병원", "보라색", "보석", "볼펜", "봄",
    "부엌", "북극곰", "분수", "빵", "사과", "사람", "사전", "산책", "살구", "삼각형", "생선", "서울",
    "섬", "성", "소금", "소방관", "소설", "소풍", "손목시계", "수박", "수영", "숲", "시계", "시장",
    "식당", "신문", "신발", "실내화", "아기", "아빠", "아이스크림", "아침", "안경", "애완동물", "야구",
    "약국", "양말", "어린이", "여름", "여우", "여행", "연필", "영화", "오리", "오징어", "온도계",
    "올림픽", "우산", "우체국", "운동", "운전", "원숭이", "유리", "유치원", "음악", "의자", "이불",
    "인형", "일기", "자동차", "자전거", "잔디", "잡지", "장갑", "저녁", "전화기", "정원", "종이", "주머니",
    "주말", "주방", "지갑", "지우개", "진주", "책", "책상", "청소", "초콜릿", "축구", "춤", "치약",
    "치킨", "친구", "침대", "카메라", "카페", "캠핑", "컴퓨터", "컵", "코끼리", "코트", "콩", "크리스마스",
    "태양", "텔레비전", "토끼", "토마토", "파란색", "팔찌", "팬티", "편지", "포도", "풍선", "피아노",
    "학교", "학생", "한글", "할머니", "할아버지", "햇빛", "햄버거", "허수아비", "헬리콥터", "호랑이",
    "호텔", "휴지", "흰색"
]

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
    if not history:
        return None  # 사용자가 입력한 단어가 없을 경우

    last_word = history[-1]  # 사용자가 마지막으로 입력한 단어
    last_char = last_word[-1]  # 마지막 글자 추출

    # 기본적으로 마지막 글자로 시작하는 단어 후보 찾기
    candidates = [
        word for word in word_list
        if word.startswith(last_char) and word not in history
    ]
    print(f"Candidates matching last char '{last_char}': {candidates}")

    # 두음법칙 적용된 음절로 후보 찾기 (필요한 경우)
    if not candidates:
        transformed_char = apply_duum_law(last_char)
        print(f"Transformed char after duum law: {transformed_char}")
        candidates = [
            word for word in word_list
            if word.startswith(transformed_char) and word not in history
        ]
        print(f"Candidates after applying duum law: {candidates}")

    # 후보가 없다면 None 반환
    if not candidates:
        print("No valid candidates available. Ending the game.")
        return None

    # 후보가 있다면 무작위로 선택하여 반환
    chosen_word = random.choice(candidates)
    print(f"Chosen word: {chosen_word}")
    return chosen_word