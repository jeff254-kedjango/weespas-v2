from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:jeff@localhost:5432/commercial"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
