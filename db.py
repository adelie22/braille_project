import pymysql

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='12341234',
        database='braille_db',
        cursorclass=pymysql.cursors.DictCursor
    )
