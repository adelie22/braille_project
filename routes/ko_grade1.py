from flask import Blueprint, Response
from db import get_db_connection
import json

# Blueprint 생성
ko_grade1_api = Blueprint('ko_grade1', __name__)

@ko_grade1_api.route('/fetch_random_word_grade1', methods=['GET'])
def fetch_random_word_grade1():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 랜덤 단어 쿼리 실행
            sql = "SELECT word FROM ko_grade1 ORDER BY RAND() LIMIT 1;"
            cursor.execute(sql)
            result = cursor.fetchone()
        if result:
            # JSON으로 변환 후 UTF-8로 인코딩
            res = json.dumps(result, ensure_ascii=False).encode('utf8')
            return Response(res, content_type='application/json; charset=utf-8')
        else:
            res = json.dumps({"error": "No word found"}, ensure_ascii=False).encode('utf8')
            return Response(res, content_type='application/json; charset=utf-8')
    finally:
        connection.close()


#http://127.0.0.1:5000/ko_grade1/fetch_random_word_grade1