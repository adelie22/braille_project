from flask import Blueprint, Response, request
from db import get_db_connection  # DB 연결 함수
from datetime import datetime
import json

# Blueprint 생성
diary_api = Blueprint('diary', __name__)

@diary_api.route('/content_from_char', methods=['GET'])
def get_content_from_char():
    date = request.args.get('date')  # 다이어리 날짜
    char_index = request.args.get('char_index')  # 커서 문자 인덱스

    # 필수 파라미터 확인
    if not date or not char_index:
        return Response(
            json.dumps({"error": "date and char_index parameters are required"}, ensure_ascii=False),
            content_type="application/json; charset=utf-8"
        ), 400

    # 날짜 형식 검증
    try:
        datetime.strptime(date, '%Y-%m-%d')  # YYYY-MM-DD 형식 확인
    except ValueError:
        return Response(
            json.dumps({"error": "date must be in YYYY-MM-DD format"}, ensure_ascii=False),
            content_type="application/json; charset=utf-8"
        ), 400

    # char_index 타입 변환
    try:
        char_index = int(char_index)
    except ValueError:
        return Response(
            json.dumps({"error": "char_index must be an integer"}, ensure_ascii=False),
            content_type="application/json; charset=utf-8"
        ), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # SQL 쿼리: date 속성을 사용
            sql = "SELECT content FROM diary WHERE date = %s;"
            cursor.execute(sql, (date,))
            result = cursor.fetchone()

        if result:
            content = result['content']  # 다이어리 전체 내용

            if 0 <= char_index < len(content):  # 문자 인덱스 범위 확인
                # \n을 공백(' ')으로 대체
                remaining_content = content[char_index:].replace('\n', ' ')
                return Response(
                    json.dumps({"remaining_content": remaining_content}, ensure_ascii=False),
                    content_type="application/json; charset=utf-8"
                )
            else:
                return Response(
                    json.dumps(
                        {"error": f"Character index {char_index} is out of range. Valid range is 0 to {len(content)-1}"},
                        ensure_ascii=False
                    ),
                    content_type="application/json; charset=utf-8"
                ), 400
        else:
            return Response(
                json.dumps({"error": "Diary entry not found"}, ensure_ascii=False),
                content_type="application/json; charset=utf-8"
            ), 404
    finally:
        connection.close()


# http://127.0.0.1:5000/diary/content_from_char?date=2024-11-08&char_index=5
# char_index를 바꾸면 해당 index부터 내용 출력
# 사용자가 커서를 위치한 곳 이후부터 음성출력 해주기 위함
