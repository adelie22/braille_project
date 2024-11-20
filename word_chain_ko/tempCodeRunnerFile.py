@word_chain_api.route('/word_chain/reset', methods=['POST'])
def reset_game():
    # Flask의 current_app.config로 history 초기화
    history = current_app.config.setdefault('HISTORY', [])
    history.clear()  # 기록 초기화
    print('Server-side history after reset:', history)
    return jsonify({"message": "게임이 재시작되었습니다."}), 200