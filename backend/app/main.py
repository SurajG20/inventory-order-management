from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

from app.database import init_db
from app.routers import products, customers, orders, dashboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    max_retries = 10
    for attempt in range(max_retries):
        try:
            await init_db()
            logger.info("Database tables initialized successfully")
            break
        except Exception as e:
            logger.warning(f"DB init attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(3)
            else:
                logger.error("Database initialization failed after all retries. App will start but DB routes may fail.")
    yield


app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
