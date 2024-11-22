from flask import Flask, render_template, jsonify, request
from routes import register_blueprints  # Ensure this function is defined in routes/__init__.py
from db import get_db_connection  # Ensure this connects to the correct database
from word_chain_ko.api import word_chain_api  # Import the word_chain Blueprint(현재 사용안함)
from word_chain_en.api import word_chain_en_api  # 
from routes.diary import diary_api  # Blueprint가 'diary_api'로 이름 변경됨
import sys
import os


# 프로젝트 경로가 PYTHONPATH에 포함되었는지 확인
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
if PROJECT_DIR not in sys.path:
    sys.path.append(PROJECT_DIR)

# 전역 변수 선언
history_ko = []  # 한국어 끝말잇기 기록
history_en = []  # 영어 끝말잇기 기록




# Flask 애플리케이션 초기화
app = Flask(__name__)
 # 이름 중복 문제 해결
app.config['JSON_AS_ASCII'] = False  # Allow UTF-8 encoding in JSON responses
app.config['TESTING'] = True  # Enable Flask testing mode
app.config['DATABASE'] = 'test_database'  # Set test database configuration

# Blueprint 등록
app.register_blueprint(word_chain_api)
app.register_blueprint(word_chain_en_api)
app.register_blueprint(diary_api, url_prefix='/diary')

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Route for rendering the HTML page
@app.route('/word_chain')
def word_chain():
    return render_template('word_chain.html')  # Render templates/word_chain.html


# 🟩 초기화 엔드포인트 추가 (추가)
@app.route('/word_chain/reset', methods=['POST'])
def reset_word_chain_ko():
    """초기화: 한국어 끝말잇기 전역 상태"""
    global history_ko
    history_ko = []  # 한국어 전역 기록 초기화
    return jsonify({"message": "Korean Word Chain has been reset", "history": history_ko})

@app.route('/word_chain_en/reset', methods=['POST'])
def reset_word_chain_en():
    """초기화: 영어 끝말잇기 전역 상태"""
    global history_en
    history_en = []  # 영어 전역 기록 초기화
    return jsonify({"message": "English Word Chain has been reset", "history": history_en})


# Register other existing blueprints
register_blueprints(app)

# Debugging: Print the URL map
print("Registered URL Map:")
print(app.url_map)


print("Registered Blueprints:")
print(app.blueprints)


if __name__ == '__main__':
    # Run the app in debug mode
    app.run(debug=True, port=5000)





#아래는 각 api를 성공적으로 호출하는지 브라우저에서 확인하는 코드
#http://127.0.0.1:5000/en_grade2/fetch_random_word_grade2
#http://127.0.0.1:5000/ko_grade1/fetch_random_word_grade1
# http://127.0.0.1:5000/word_chain (wword chain 주소)