from word_chain.utils import is_valid_korean_word, generate_next_word

if __name__ == "__main__":
    test_words = ["사과", "바나나", "1234", "abc", "꽃"]
    for word in test_words:
        result = is_valid_korean_word(word)
        print(f"Word: {word}, Valid: {result}")

word_list = ["여름", "여자", "여행", "남자", "사과"]
history = ["자녀"]
result = generate_next_word(history)
print(f"Generated next word: {result}")
