from flask import Flask, Blueprint, Response, request, jsonify, render_template
from db import get_db_connection  # DB 연결 함수
from datetime import datetime
import json

# Blueprint 생성
diary_api = Blueprint('diary', __name__)  # 고유한 이름 사용


@diary_api.route('/delete/<id>', methods=['POST'])
def delete_diary(id):
    try:
        # 데이터베이스 연결
        conn = get_db_connection()
        cursor = conn.cursor()

        # id를 정수로 변환하여 안전하게 사용
        diary_id = int(id)

        # 해당 ID의 다이어리 항목 삭제
        cursor.execute("DELETE FROM diary WHERE id = %s", (diary_id,))
        conn.commit()

        # 삭제 성공 메시지 반환
        return jsonify({'success': True}), 200
    except ValueError:
        # ID가 정수로 변환되지 않는 경우 처리
        return jsonify({'success': False, 'error': 'Invalid ID format'}), 400
    except Exception as e:
        # 오류 발생 시 오류 메시지 반환
        print(f"삭제 중 오류 발생: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        # 데이터베이스 연결 닫기
        cursor.close()
        conn.close()


@diary_api.route('/create', methods=['POST'])
def create_diary():
    data = request.get_json()
    date = data.get('date')
    content = data.get('content')

    if not date or not content:
        return jsonify({'success': False, 'error': 'Missing date or content'}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO diary (date, content) VALUES (%s, %s)"
            cursor.execute(sql, (date, content))
            connection.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        connection.close()





# 다이어리 목록을 HTML로 렌더링
@diary_api.route('/', methods=['GET'])
def show_diary_entries():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 데이터베이스에서 모든 다이어리 데이터를 가져옴
            sql = "SELECT id, date, content FROM diary ORDER BY date;"
            cursor.execute(sql)
            diary_entries = cursor.fetchall()  # 데이터 가져오기

        # diary.html 템플릿에 데이터 전달
        return render_template('diary.html', entries=diary_entries)
    finally:
        connection.close()

# 특정 ID의 다이어리 내용을 HTML로 렌더링하여 반환
@diary_api.route('/content/<int:id>', methods=['GET'])
def get_diary_content(id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT date, content FROM diary WHERE id = %s;"
            cursor.execute(sql, (id,))
            result = cursor.fetchone()

        if result:
            # 다이어리 내용을 바로 HTML 템플릿에 전달
            content = result['content']
            date = result['date']
            return render_template('diary_content.html', content=content, date=date, id=id)
        else:
            return Response(
                json.dumps({"error": "Diary entry not found"}, ensure_ascii=False),
                content_type="application/json; charset=utf-8"
            ), 404
    finally:
        connection.close()




# 다이어리 내용을 문자 단위로 가져오는 API
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

# diary 테이블의 id 기준으로 content 업데이트 반영
@diary_api.route('/update_content', methods=['POST'])
def update_diary_content():
    data = request.get_json()
    diary_id = data.get('id')
    updated_content = data.get('content')

    if not diary_id or not updated_content:
        return jsonify({'success': False, 'error': 'Missing id or content'}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "UPDATE diary SET content = %s WHERE id = %s"
            cursor.execute(sql, (updated_content, diary_id))
            connection.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        connection.close()

# 새로운 페이지 렌더링 추가
@diary_api.route('/content', methods=['GET'])
def show_diary_page():
    return render_template('diary.html')  # templates/diary.html 렌더링

@diary_api.route('/index', methods=['GET'])
def show_diary_page_detail():
    return render_template('index.html')  # templates/index.html 렌더링


# diary.py 파일 최상단에 추가하세요
if __name__ == "__main__":
    # 맞춤법 검사기 테스트 코드
    test_content = "친구들과 함께 영화관에 갔다. 재밌는 시간을 보냈다."
    try:
        checked_result = spell_checker.check(test_content)
        # 검사 결과를 딕셔너리로 출력하여 확인
        print("Checked Result (Raw):", checked_result.as_dict())  # 응답 데이터를 확인
        corrected_text = checked_result.checked
        print("Corrected Text:", corrected_text)
    except KeyError as e:
        print(f"KeyError: {e}")  # KeyError 발생 시 오류 메시지 출력
    except Exception as e:
        print(f"Spell check error: {e}")  # 다른 모든 오류 출력
