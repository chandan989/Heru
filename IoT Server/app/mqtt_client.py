import asyncio
import json
import aiomqtt
from app.config import settings
from app.database import AsyncSessionLocal
from app.models import SensorData
from arq import create_pool
from arq.connections import RedisSettings

async def process_message(payload: bytes):
    try:
        data = json.loads(payload.decode())
        print(f"Received MQTT message: {data}")
        
        # Save to DB
        async with AsyncSessionLocal() as session:
            db_item = SensorData(
                device_id=data.get("device_id", "unknown"),
                temperature=data.get("temperature"),
                humidity=data.get("humidity"),
                raw_data=data
            )
            session.add(db_item)
            await session.commit()
            await session.refresh(db_item)
            
            # Enqueue job
            redis = await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))
            await redis.enqueue_job('process_sensor_data', db_item.id)
            
    except Exception as e:
        print(f"Error processing message: {e}")

async def mqtt_loop():
    while True:
        try:
            async with aiomqtt.Client(settings.MQTT_BROKER, port=settings.MQTT_PORT) as client:
                await client.subscribe(settings.MQTT_TOPIC)
                print(f"Subscribed to {settings.MQTT_TOPIC}")
                async for message in client.messages:
                    await process_message(message.payload)
        except Exception as e:
            print(f"MQTT connection failed: {e}. Retrying in 5s...")
            await asyncio.sleep(5)
