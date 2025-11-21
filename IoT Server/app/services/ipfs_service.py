import httpx
from app.config import settings
import json

async def upload_to_pinata(data: dict) -> str:
    """
    Uploads a JSON dictionary to IPFS via Pinata.
    Returns the IPFS CID.
    """
    if not settings.PINATA_API_KEY or not settings.PINATA_API_SECRET:
        print("Pinata credentials not found. Skipping upload.")
        return "mock_cid_" + str(hash(json.dumps(data)))

    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    headers = {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_API_SECRET
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            return response.json()["IpfsHash"]
        except Exception as e:
            print(f"Error uploading to Pinata: {e}")
            return None
