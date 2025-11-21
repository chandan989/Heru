import asyncio
from arq import create_pool
from arq.connections import RedisSettings
from app.config import settings
from app.database import AsyncSessionLocal
from app.models import SensorData
from app.services.ipfs_service import upload_to_pinata
from app.services.hedera_service import submit_to_hedera
from sqlalchemy import select

async def process_sensor_data(ctx, sensor_data_id: int):
    print(f"Processing sensor data ID: {sensor_data_id}")
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(SensorData).where(SensorData.id == sensor_data_id))
        sensor_record = result.scalar_one_or_none()
        
        if not sensor_record:
            print(f"Sensor data {sensor_data_id} not found")
            return

        # 1. Upload to IPFS
        data_payload = {
            "device_id": sensor_record.device_id,
            "timestamp": str(sensor_record.timestamp),
            "temperature": sensor_record.temperature,
            "humidity": sensor_record.humidity,
            "raw": sensor_record.raw_data
        }
        cid = await upload_to_pinata(data_payload)
        
        # 2. Log to Hedera
        hedera_hash = await submit_to_hedera(f"IPFS_CID:{cid}")
        
        # 3. Update DB
        sensor_record.ipfs_cid = cid
        sensor_record.hedera_hash = hedera_hash
        sensor_record.processing_status = "COMPLETED"
        
        await session.commit()
        print(f"Successfully processed data {sensor_data_id}. CID: {cid}, Hash: {hedera_hash}")

async def startup(ctx):
    print("Worker starting...")

async def shutdown(ctx):
    print("Worker shutting down...")

class WorkerSettings:
    functions = [process_sensor_data]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
