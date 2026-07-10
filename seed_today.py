import mysql.connector
import random
from datetime import datetime, timedelta

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="carbon_db"
)
cursor = db.cursor()

today_str = "2026-07-10"
for i in range(100):
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    created_at = f"{today_str} {hour:02d}:{minute:02d}:00"
    emission = random.uniform(5.0, 50.0)
    qty = random.uniform(10.0, 100.0)
    activity_type_id = 1
    user_id = 3
    
    sql = "INSERT INTO activity_logs (created_at, emission_value, log_date, quantity, unit, activity_type_id, user_id) VALUES (%s, %s, %s, %s, 'unit', %s, %s)"
    val = (created_at, emission, today_str, qty, activity_type_id, user_id)
    cursor.execute(sql, val)

db.commit()
print("100 records inserted for today!")
