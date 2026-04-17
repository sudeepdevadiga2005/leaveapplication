from pymongo import MongoClient
import os

_client = None

def get_db():
    global _client
    if _client is None:
        uri = os.getenv('MONGO_URI')
        _client = MongoClient(uri)
    db_name = os.getenv('MONGO_DB_NAME', 'absentalert')
    return _client[db_name]
