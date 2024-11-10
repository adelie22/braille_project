from flask import Blueprint, jsonify
from db import get_db_connection  # DB 연결 함수 가져오기

# Blueprint 생성
en_grade2_api = Blueprint('en_grade2', __name__)

@en_grade2_api.route('/fetch_random_word_grade2', methods=['GET'])
def fetch_random_word_grade2():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT word FROM en_grade2 ORDER BY RAND() LIMIT 1;"
            cursor.execute(sql)
            result = cursor.fetchone()
        return jsonify(result)
    finally:
        connection.close()

#http://127.0.0.1:5000/en_grade2/fetch_random_word_grade2