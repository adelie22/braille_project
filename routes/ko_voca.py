from flask import Blueprint, request, jsonify, Response
from db import get_db_connection
import json

# Blueprint 생성
ko_voca_api = Blueprint('ko_voca', __name__)

@ko_voca_api.route('/fetch_word', methods=['GET'])
def fetch_word():
    # GET 요청에서 'word' 파라미터를 가져옴
    word = request.args.get('word')
    if not word:
        return jsonify({"error": "No word parameter provided"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # ko_voca 테이블에서 특정 단어 검색
            sql = "SELECT * FROM ko_voca WHERE word = %s;"
            cursor.execute(sql, (word,))
            result = cursor.fetchone()

        if result:
            # 결과를 JSON으로 변환
            res = {
                "id": result['id'],
                "word": result['word'],
                "grade1_bin": result['grade1_bin'],
                "grade2_bin": result['grade2_bin']
            }
            return Response(json.dumps(res, ensure_ascii=False), content_type='application/json; charset=utf-8')
        else:
            return jsonify({"error": "Word not found"}), 404
    finally:
        connection.close()


#http://127.0.0.1:5000/ko_voca/fetch_word?word=사과 (브라우저에 '사과' 정보 출력)