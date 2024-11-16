import random
import requests

# Merriam-Webster API 설정
API_KEY = 'fcd61f5d-0858-4191-a144-0f03567277fe'  # Merriam-Webster API 키
API_URL = "https://www.dictionaryapi.com/api/v3/references/sd4/json"

def is_word_in_dictionary(word):
    """
    Merriam-Webster 사전을 사용하여 단어의 존재 여부를 확인합니다.
    """
    params = {"key": API_KEY}
    try:
        # API 호출
        response = requests.get(f"{API_URL}/{word}", params=params)
        response.raise_for_status()
        data = response.json()

        # 단어가 사전에 존재하는지 판단
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            print(f"DEBUG: Word '{word}' exists in the dictionary.")
            return True
        # print(f"DEBUG: Word '{word}' does not exist in the dictionary.")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Error checking word in dictionary: {e}")
        return False

def check_word_validity(word, history):
    """
    사용자가 입력한 단어의 유효성을 검사합니다.
    """
    word = word.lower()  # 소문자로 변환하여 일관성 유지
    print(f"Validating word: {word}")

    # 단어 길이 검사
    if len(word) < 2:
        print(f"Word '{word}' is too short.")
        return False, "The word must be at least 2 letters long."

    # 사전에서 단어 유효성 확인
    if not is_word_in_dictionary(word):
        return False, f"'{word}' is not a valid word in the dictionary."

    # 처음 입력된 단어는 바로 통과
    if not history:
        # print(f"DEBUG: History is empty. '{word}' added as the first word.")
        return True, None

    # 끝말잇기 규칙 확인: 이전 단어의 마지막 글자와 현재 단어의 첫 글자
    last_word = history[-1].lower()
    if last_word[-1] != word[0]:
        error_message = f"The word must start with '{last_word[-1]}'."
        print(f"Invalid word: {error_message}")
        return False, error_message

    # 중복 단어 확인
    if word in history:
        print(f"Word '{word}' has already been used.")
        return False, "The word has already been used."

    # print(f"DEBUG: Word '{word}' is valid.")
    return True, None



def is_valid_english_word(word):
    """
    Merriam-Webster API를 사용하여 단어의 유효성을 확인합니다.
    """
    params = {"key": API_KEY}
    try:
        response = requests.get(f"{API_URL}/{word}", params=params)
        response.raise_for_status()
        data = response.json()
        # print(f"DEBUG: API response for '{word}': {data}")

        # 단어 존재 여부 확인
        return isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict)
    except Exception as e:
        print(f"Error checking word validity: {e}")
        return False


def generate_next_word(history):
    """
    끝말잇기를 위한 컴퓨터의 다음 단어 생성.
    """
    if not history:
        # print("DEBUG: History is empty. No word to generate from.")
        return None

    last_word = history[-1]
    last_char = last_word[-1]

    # 단순 후보 단어 목록 (실제 프로젝트에서는 외부 API나 데이터베이스 활용 가능)
    possible_words = [
    # A
    "apple", "animal", "airplane", "actor", "artist", "arrow", "angel", "ant", "apron", "arm",
    # B
    "ball", "basket", "bottle", "bridge", "button", "butterfly", "box", "bicycle", "bird", "blanket",
    "book", "bread", "broom", "belt", "bubble", "boat", "bench", "bag", "brick", "branch",
    # C
    "cat", "candle", "car", "cloud", "camera", "chair", "cup", "circle", "clock", "card",
    "castle", "cave", "chess", "cheese", "chicken", "cucumber", "cake", "cart", "coin", "crown",
    # D
    "dog", "dolphin", "drum", "desk", "door", "duck", "diamond", "doll", "dragon", "daisy",
    "dance", "dirt", "dove", "dinner", "dream", "dust", "drill", "dish", "donkey", "drift",
    # E
    "elephant", "engine", "eraser", "egg", "eye", "envelope", "ear", "echo", "energy", "earth",
    "exit", "eagle", "elevator", "elbow", "emerald", "evening", "event", "effort", "engineer", "example",
    # F
    "flower", "fish", "frog", "friend", "food", "forest", "fan", "feather", "fence", "fire",
    "fox", "flute", "field", "farm", "feast", "fairy", "fountain", "fruit", "frame", "flame",
    # G
    "gift", "garden", "game", "guitar", "gate", "gold", "glass", "glove", "goose", "glue",
    "goal", "giant", "grape", "group", "grain", "green", "grass", "growth", "gum", "glacier",
    # H
    "hat", "house", "hand", "heart", "hero", "honey", "hammer", "hill", "hole", "horn",
    "horse", "hood", "horizon", "hobby", "hair", "heaven", "holiday", "hour", "hatch", "harbor",
    # I
    "ice", "igloo", "idea", "island", "iron", "ink", "image", "ivory", "inch", "impact",
    "income", "index", "input", "insect", "interest", "item", "identity", "idol", "issue", "invitation",
    # J
    "jacket", "jewel", "jump", "jungle", "jar", "jelly", "jam", "joy", "journey", "juice",
    "jeep", "joke", "journal", "jigsaw", "judge", "junior", "job", "javelin", "jackal", "joint",
    # K
    "key", "kite", "kitchen", "koala", "king", "kid", "kangaroo", "kitten", "kettle", "knee",
    "knot", "knife", "knight", "knob", "knapsack", "knee", "kernel", "kite", "kingdom", "kitchenware",
    # L
    "lake", "lamp", "lion", "light", "leaf", "lunch", "lock", "ladder", "land", "love",
    "lemon", "loaf", "line", "lime", "ladle", "lip", "lighthouse", "library", "lizard", "luck",
    # M
    "milk", "moon", "mountain", "monkey", "music", "man", "mirror", "mask", "mouse", "match",
    "mango", "mint", "meal", "map", "market", "motor", "mud", "magic", "marble", "mist",
    # N
    "nest", "night", "nose", "number", "net", "needle", "napkin", "note", "necklace", "noise",
    "nature", "nap", "nail", "nurse", "name", "nut", "news", "notebook", "novel", "network",
    # O
    "ocean", "orange", "onion", "oven", "owl", "oak", "oil", "orchid", "orbit", "orchestra",
    "oven", "omelet", "opinion", "order", "oxygen", "olive", "output", "object", "organ", "outlook",
    # P
    "pencil", "paper", "pizza", "phone", "plant", "pool", "panda", "park", "paint", "peach",
    "pear", "plum", "pine", "plate", "planet", "path", "pillow", "parrot", "pot", "picnic",
    # Q
    "queen", "quill", "quilt", "quiz", "quart", "queue", "question", "quote", "quality", "quiet",
    # R
    "rabbit", "rain", "river", "rocket", "ring", "room", "rope", "roof", "road", "rose",
    "robot", "ruler", "rug", "raven", "rice", "rainbow", "raft", "restaurant", "record", "riverbank",
    # S
    "star", "school", "sky", "snake", "song", "stone", "sun", "table", "tiger", "tree",
    "shirt", "scarf", "shell", "sand", "sock", "shadow", "ship", "swan", "snow", "stream",
    # T
    "umbrella", "van", "village", "water", "whale", "window", "wolf", "zebra", "train", "truck",
    "torch", "toy", "tent", "tower", "trumpet", "thread", "tractor", "track", "tray", "turkey",
     # U
    "unicorn", "utility", "utensil", "umbrella", "uniform", "universe", "utopia", "uranium", "update", "urge",
    "ulcer", "ultrasound", "ultimate", "underpass", "upgrade", "undertone", "uptake", "urgency", "upstream", "uproar",
    # V
    "violet", "vase", "village", "vehicle", "valley", "victory", "violin", "vampire", "venture", "vision",
    "volcano", "vacuum", "vessel", "visitor", "vine", "verse", "vendor", "velocity", "vortex", "value",
    # W
    "waterfall", "whale", "wind", "wheat", "walnut", "wagon", "whisker", "whistle", "wilderness", "wrist",
    "window", "wallet", "witch", "workshop", "witness", "wolf", "warrior", "wish", "waffle", "weight",
    # X
    "xylophone", "xenon", "xerox", "x-ray", "x-axis", "xenophobia", "xylitol", "xiphoid", "xenopus", "xenolith",
    # Y
    "yellow", "yarn", "yard", "yawn", "yogurt", "yacht", "year", "yield", "yeti", "yoke",
    "yo-yo", "youth", "yesterday", "yearbook", "yellowtail", "yeast", "yearling", "yelp", "yucca", "yawnfest",
    # Z
    "zebra", "zoo", "zero", "zipper", "zone", "zephyr", "zodiac", "zombie", "zinc", "zigzag",
    "zeppelin", "zap", "zenith", "zucchini", "zinger", "zipline", "zoology", "zookeeper", "zoom", "zinger"
]


    # 마지막 글자로 시작하는 단어 필터링
    filtered_words = [word for word in possible_words if word.startswith(last_char) and word not in history]
    # print(f"DEBUG: Filtered words starting with '{last_char}': {filtered_words}")

    # 후보가 없으면 None 반환
    if not filtered_words:
        # print("DEBUG: No valid candidates available. Game over.")
        return None

    # 후보 중 랜덤으로 선택
    chosen_word = random.choice(filtered_words)
    history.append(chosen_word)
    # print(f"DEBUG: Computer chose '{chosen_word}'.")
    return chosen_word


if __name__ == "__main__":
    # 테스트 실행
    history = ["apple"]
    print("Initial history:", history)

    # 사용자 단어 검증
    word = "elephant"
    valid, error = check_word_validity(word, history)
    if valid:
        print(f"'{word}' is a valid word.")
    else:
        print(f"Invalid word: {error}")

    # 컴퓨터 단어 생성
    next_word = generate_next_word(history)
    if next_word:
        print(f"Computer generated: {next_word}")
    else:
        print("No word generated. Game over.")
