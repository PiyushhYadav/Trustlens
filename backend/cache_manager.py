import sqlite3
import json

DB_PATH = "trustlens.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS score_cache (
                platform_name TEXT PRIMARY KEY,
                score_data TEXT
            )
        """)
        conn.commit()

def get_cached_score(platform_name: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("SELECT score_data FROM score_cache WHERE platform_name = ?", (platform_name,))
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
    return None

def set_cached_score(platform_name: str, score_data: dict):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO score_cache (platform_name, score_data) VALUES (?, ?)",
            (platform_name, json.dumps(score_data))
        )
        conn.commit()
