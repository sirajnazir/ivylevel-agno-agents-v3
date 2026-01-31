from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # CRI Settings (v9.2)
    cri_barrier_boost: float = 1.2
    cri_max_value: float = 3.0
    
    # Ivy+ Scoring
    ivy_plus_benchmark: int = 50
    
    class Config:
        env_prefix = "IVY_"

settings = Settings()
