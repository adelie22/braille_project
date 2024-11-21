from flask import Blueprint, request, jsonify, current_app
from word_chain_en.logic import check_word_validity, generate_next_word

# Blueprint 정의
word_chain_en_api = Blueprint('word_chain_en_api', __name__)

@word_chain_en_api.route('/word_chain_en/check_word', methods=['POST'])
def check_word():
    history_en = current_app.config.setdefault('HISTORY_EN', [])  # 서버 전역 history 가져오기

    print(f"Server history (before validation): {history_en}")

    try:
        data = request.json
        word = data.get('word')
        if not word:
            return jsonify({"error": "Word is required"}), 400

        # 유효성 검사: 항상 history의 마지막 단어를 기준으로 확인
        is_valid, error_message = check_word_validity(word, history_en)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        # 유효한 단어인 경우, history에 추가
        history_en.append(word.lower())  # 단어를 소문자로 변환하여 추가
        print(f"Server history (after validation): {history_en}")

        return jsonify({"message": "Valid word", "history": history_en}), 200

    except Exception as e:
        print(f"Error during word validation: {e}")
        return jsonify({"error": "Internal server error"}), 500


@word_chain_en_api.route('/word_chain_en/generate_word', methods=['GET'])
def generate_word():
    try:
        # 서버의 history 가져오기
        history_en = current_app.config.setdefault('HISTORY_EN', [])
        # print(f"DEBUG: Server history before generating word: {history}")

        # 다음 단어 생성
        next_word = generate_next_word(history_en)

        if next_word:
            # 컴퓨터 단어를 history에 추가
            history_en.append(next_word.lower())  # 단어를 소문자로 변환하여 추가
            # print(f"DEBUG: Server history after generating word: {history}")
            return jsonify({"word": next_word}), 200
        else:
            # print("DEBUG: No valid word generated. Game over.")
            return jsonify({"error": "The computer cannot generate a word."}), 400
    except Exception as e:
        print(f"Error in generate_word: {e}")
        return jsonify({"error": "Internal server error"}), 500


@word_chain_en_api.route('/word_chain_en/reset', methods=['POST'])
def reset_game():
    # Flask의 current_app.config로 history 초기화
    history_en = current_app.config.setdefault('HISTORY_EN', [])
    history_en.clear()  # 기록 초기화
    print('Server-side history after reset:', history_en)
    return jsonify({"message": "Game has been reset."}), 200
