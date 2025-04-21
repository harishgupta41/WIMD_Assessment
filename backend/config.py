import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI= f"mysql+mysqlconnector://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@localhost/{os.getenv('MYSQL_DB')}"
    SQLALCHEMY_TRACK_MODIFICATION = False
    SECRET_KEY = os.getenv('SECRET_KEY','supersecretkey')