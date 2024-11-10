from flask import Blueprint, jsonify
from db import get_db_connection 

# Blueprint 생성
en_grade1_api = Blueprint('en_grade1', __name__)

@en_grade1_api.route('/fetch_random_word_grade1', methods=['GET'])
def fetch_random_word_grade1():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT word FROM en_grade1 ORDER BY RAND() LIMIT 1;"
            cursor.execute(sql)
            result = cursor.fetchone()
        return jsonify(result)
    finally:
        connection.close()

#http://127.0.0.1:5000/en_grade1/fetch_random_word_grade1