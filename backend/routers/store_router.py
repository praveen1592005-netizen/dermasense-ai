import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List

from services.supabase_service import get_supabase_client
from fastapi import Depends
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/store", tags=["Store & Products"], dependencies=[Depends(verify_token)])

class OrderItem(BaseModel):
    product_id: str
    quantity: int

class OrderRequest(BaseModel):
    user_id: str
    items: List[OrderItem]
    total_amount: float
    shipping_address: str

@router.get("/products")
async def get_products():
    try:
        client = get_supabase_client()
        res = client.table("products").select("*").execute()
        return JSONResponse(content={"success": True, "products": res.data})
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

@router.post("/orders")
async def place_order(req: OrderRequest):
    try:
        client = get_supabase_client()
        # Ensure orders table exists in schema for this to fully work
        # Insert main order
        order_data = {
            "user_id": req.user_id,
            "total_amount": req.total_amount,
            "shipping_address": req.shipping_address,
            "status": "pending"
        }
        res = client.table("orders").insert(order_data).execute()
        order_id = res.data[0]['id'] if res.data else None
        
        if order_id:
            # Insert items
            items_data = [
                {"order_id": order_id, "product_id": item.product_id, "quantity": item.quantity} 
                for item in req.items
            ]
            client.table("order_items").insert(items_data).execute()
            
        return JSONResponse(content={"success": True, "order_id": order_id})
    except Exception as e:
        logger.error(f"Error placing order: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})
