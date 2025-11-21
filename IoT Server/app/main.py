import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import engine, Base
from app.mqtt_client import mqtt_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start MQTT loop in background
    asyncio.create_task(mqtt_loop())
    
    yield
    
    # Shutdown
    print("Shutting down...")

app = FastAPI(title="Heru IoT Server", lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Heru IoT Server is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
