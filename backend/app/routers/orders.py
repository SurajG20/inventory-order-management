from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
from pydantic import BaseModel, Field

from app.database import get_db
from app.schemas import OrderCreate, OrderOut
from app import crud
from app.models import Order


class StatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|processing|completed|cancelled)$")


router = APIRouter(prefix="/orders", tags=["Orders"])


def _format_order(order: Order) -> dict[str, Any]:
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else "",
        "total_amount": float(order.total_amount),
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "",
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
            }
            for item in order.items
        ],
    }


@router.post("", response_model=dict, status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    order = await crud.create_order(db, data)
    return _format_order(order)


@router.get("", response_model=list[dict])
async def list_orders(db: AsyncSession = Depends(get_db)):
    orders = await crud.get_orders(db)
    return [_format_order(o) for o in orders]


@router.get("/{order_id}", response_model=dict)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await crud.get_order(db, order_id)
    return _format_order(order)


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    await crud.delete_order(db, order_id)


@router.patch("/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: int, data: StatusUpdate, db: AsyncSession = Depends(get_db)
):
    order = await crud.update_order_status(db, order_id, data.status)
    return _format_order(order)
