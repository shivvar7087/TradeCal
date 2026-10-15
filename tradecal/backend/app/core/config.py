import os
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory if present
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "TradeCal"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tradecal-super-secret-key-change-in-production-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days default
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    # Database settings
    # Default to local SQLite for instant zero-configuration setup.
    # Can switch to MySQL by setting DATABASE_URL or DB_TYPE=mysql in .env
    DB_TYPE: str = os.getenv("DB_TYPE", "sqlite")
    DB_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    DB_PORT: str = os.getenv("MYSQL_PORT", "3306")
    DB_NAME: str = os.getenv("MYSQL_DATABASE", "tradecal_db")
    DB_USER: str = os.getenv("MYSQL_USER", "root")
    DB_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")

    @property
    def DATABASE_URL(self) -> str:
        explicit_url = os.getenv("DATABASE_URL")
        if explicit_url:
            # Render supplies PostgreSQL URLs using the legacy postgres scheme.
            if explicit_url.startswith("postgres://"):
                return explicit_url.replace("postgres://", "postgresql+psycopg2://", 1)
            return explicit_url
        if self.DB_TYPE.lower() == "mysql":
            pwd = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
            return f"mysql+mysqlconnector://{self.DB_USER}{pwd}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        # Default zero-setup SQLite database file located in backend directory
        sqlite_file = BASE_DIR / "tradecal.db"
        return f"sqlite:///{sqlite_file.as_posix()}"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
