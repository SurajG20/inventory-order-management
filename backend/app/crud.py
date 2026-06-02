from sqlalchemy import select, func, text, extract
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models import Product, Customer, Order, OrderItem
from app.schemas import ProductCreate, ProductUpdate, CustomerCreate, OrderCreate


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    existing = await db.execute(select(Product).where(Product.sku == data.sku))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Product with SKU '{data.sku}' already exists")
    product = Product(**data.model_dump())
    db.add(product)
    try:
        await db.commit()
        await db.refresh(product)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Product with SKU '{data.sku}' already exists")
    return product


async def get_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).order_by(Product.created_at.desc()))
    return result.scalars().all()


async def get_product(db: AsyncSession, product_id: int) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Product:
    product = await get_product(db, product_id)
    update_data = data.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = await db.execute(select(Product).where(Product.sku == update_data["sku"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Product with SKU '{update_data['sku']}' already exists")
    for key, value in update_data.items():
        setattr(product, key, value)
    try:
        await db.commit()
        await db.refresh(product)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Product with SKU '{update_data.get('sku')}' already exists")
    return product


async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await get_product(db, product_id)
    await db.delete(product)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cannot delete this product because it is referenced by existing orders. Remove the orders first.",
        )


async def create_customer(db: AsyncSession, data: CustomerCreate) -> Customer:
    existing = await db.execute(select(Customer).where(Customer.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Customer with email '{data.email}' already exists")
    customer = Customer(**data.model_dump())
    db.add(customer)
    try:
        await db.commit()
        await db.refresh(customer)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Customer with email '{data.email}' already exists")
    return customer


async def get_customers(db: AsyncSession) -> list[Customer]:
    result = await db.execute(select(Customer).order_by(Customer.created_at.desc()))
    return result.scalars().all()


async def get_customer(db: AsyncSession, customer_id: int) -> Customer:
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


async def delete_customer(db: AsyncSession, customer_id: int) -> None:
    customer = await get_customer(db, customer_id)
    await db.delete(customer)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cannot delete this customer because they have existing orders. Remove the orders first.",
        )


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    customer = await get_customer(db, data.customer_id)

    product_ids = [item.product_id for item in data.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    if len(products) != len(product_ids):
        missing = set(product_ids) - set(products.keys())
        raise HTTPException(status_code=400, detail=f"Products not found: {missing}")

    total_amount = 0
    order_items_data = []

    for item_data in data.items:
        product = products[item_data.product_id]
        if product.quantity_in_stock < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.quantity_in_stock}, requested: {item_data.quantity}",
            )
        product.quantity_in_stock -= item_data.quantity
        total_amount += float(product.price) * item_data.quantity
        order_items_data.append(
            OrderItem(
                product_id=product.id,
                quantity=item_data.quantity,
                unit_price=float(product.price),
            )
        )

    order = Order(
        customer_id=customer.id,
        total_amount=round(total_amount, 2),
        items=order_items_data,
    )
    db.add(order)
    try:
        await db.commit()
        await db.refresh(order)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create order")

    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
    )
    order = result.scalar_one()
    return order


async def get_orders(db: AsyncSession) -> list[Order]:
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    return orders


async def get_order(db: AsyncSession, order_id: int) -> Order:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


async def delete_order(db: AsyncSession, order_id: int) -> None:
    order = await get_order(db, order_id)
    for item in order.items:
        product = await db.get(Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity
    await db.delete(order)
    await db.commit()


async def update_order_status(db: AsyncSession, order_id: int, status: str) -> Order:
    order = await get_order(db, order_id)
    order.status = status
    await db.commit()
    await db.refresh(order)
    return order


async def get_dashboard(db: AsyncSession) -> dict:
    total_products = (await db.execute(select(func.count(Product.id)))).scalar()
    total_customers = (await db.execute(select(func.count(Customer.id)))).scalar()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()

    total_revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.status != "cancelled")
    )
    total_revenue = float(total_revenue_result.scalar() or 0)

    inventory_value_result = await db.execute(
        select(func.coalesce(func.sum(Product.price * Product.quantity_in_stock), 0))
    )
    inventory_value = float(inventory_value_result.scalar() or 0)

    low_stock = (await db.execute(
        select(Product)
        .where(Product.quantity_in_stock <= 5)
        .order_by(Product.quantity_in_stock.asc())
    )).scalars().all()

    recent_orders_result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    recent_orders = recent_orders_result.scalars().all()

    monthly_orders = []
    monthly_revenue = []
    months_result = await db.execute(
        select(
            func.to_char(Order.created_at, "Mon"),
            func.count(Order.id),
            func.coalesce(func.sum(Order.total_amount), 0),
            extract("month", Order.created_at),
            extract("year", Order.created_at),
        )
        .where(
            Order.created_at >= func.date_trunc("month", func.now()) - text("interval '5 months'")
        )
        .group_by(
            extract("year", Order.created_at),
            extract("month", Order.created_at),
            func.to_char(Order.created_at, "Mon"),
        )
        .order_by(
            extract("year", Order.created_at),
            extract("month", Order.created_at),
        )
    )
    for row in months_result:
        monthly_orders.append({"month": row[0], "orders": row[1]})
        monthly_revenue.append({"month": row[0], "revenue": float(row[2])})

    in_stock = (await db.execute(
        select(func.count(Product.id)).where(Product.quantity_in_stock > 5)
    )).scalar() or 0
    low = (await db.execute(
        select(func.count(Product.id)).where(
            Product.quantity_in_stock > 0, Product.quantity_in_stock <= 5
        )
    )).scalar() or 0
    out_of_stock = (await db.execute(
        select(func.count(Product.id)).where(Product.quantity_in_stock == 0)
    )).scalar() or 0

    stock_distribution = [
        {"status": "in_stock", "count": in_stock},
        {"status": "low_stock", "count": low},
        {"status": "out_of_stock", "count": out_of_stock},
    ]

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "inventory_value": inventory_value,
        "low_stock_products": list(low_stock),
        "recent_orders": list(recent_orders),
        "monthly_orders": monthly_orders,
        "monthly_revenue": monthly_revenue,
        "stock_distribution": stock_distribution,
    }
