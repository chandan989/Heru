from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    raw_data = Column(JSON)
    
    # Metadata from external services
    ipfs_cid = Column(String, nullable=True)
    hedera_hash = Column(String, nullable=True)
    processing_status = Column(String, default="PENDING") # PENDING, COMPLETED, FAILED
