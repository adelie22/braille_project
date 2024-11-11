from flask import Blueprint, request, jsonify, current_app
from word_chain_ko.logic import check_word_validity, generate_next_word

# Blueprint 정의
word_chain_api = Blueprint('word_chain_api', __name__)

@word_chain_api.route('/word_chain/check_word', methods=['POST'])
def check_word():
    # Flask의 current_app.config로 서버 history 참조
    history = current_app.config.setdefault('HISTORY', [])  # 전역 history 초기화

    try:
        data = request.json
        word = data.get('word')
        client_history = data.get('history', [])  # 클라이언트에서 전달된 history
        
        print(f"Received word: {word}")
        print(f"Client history: {client_history}, Server history: {history}")

        if not word:
            return jsonify({"error": "Word is required"}), 400

        # 클라이언트와 서버 history 동기화: 서버의 history를 우선
        if client_history != history:
            print("History mismatch detected: Overriding with server-side history")
            client_history = history

        # 단어 유효성 검사
        is_valid, error = check_word_validity(word, history)
        if not is_valid:
            return jsonify({"error": error}), 400

        # 유효한 단어를 서버의 history에 추가
        history.append(word)
        print('Server-side history after adding word:', history)

        return jsonify({"message": "Valid word"}), 200
    except Exception as e:
        print("Error in check_word:", e)
        return jsonify({"error": "Internal server error"}), 500



@word_chain_api.route('/word_chain/generate_word', methods=['GET'])
def generate_word():
    try:
        # 클라이언트에서 전달된 history
        client_history = request.args.getlist('history')
        print(f"Client-side history received: {client_history}")

        if not client_history:
            return jsonify({"error": "단어 기록이 필요합니다."}), 400

        # 다음 단어 생성
        next_word = generate_next_word(client_history)
        print(f"Next word generated: {next_word}")

        if next_word:
            return jsonify({"word": next_word}), 200
        else:
            return jsonify({"error": "컴퓨터가 생성할 수 있는 단어가 없습니다."}), 400
    except Exception as e:
        print(f"Error in generate_word: {e}")
        return jsonify({"error": "서버 오류가 발생했습니다."}), 500


@word_chain_api.route('/word_chain/reset', methods=['POST'])
def reset_game():
    # Flask의 current_app.config로 history 초기화
    history = current_app.config.setdefault('HISTORY', [])
    history.clear()  # 기록 초기화
    print('Server-side history after reset:', history)
    return jsonify({"message": "게임이 재시작되었습니다."}), 200