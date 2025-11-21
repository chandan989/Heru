from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/heru_iot"
    REDIS_URL: str = "redis://localhost:6379"
    
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883
    MQTT_TOPIC: str = "heru/sensors/#"
    
    PINATA_API_KEY: str = ""
    PINATA_API_SECRET: str = ""
    
    HEDERA_ACCOUNT_ID: str = ""
    HEDERA_PRIVATE_KEY: str = ""
    HEDERA_TOPIC_ID: str = ""

    model_config = ConfigDict(env_file=".env")

settings = Settings()
