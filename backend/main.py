import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from routes.auth import router as auth_router
from routes.projects import router as projects_router
from routes.ws import router as ws_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("autonomous_co_founder.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"CORS origins allowed: {settings.cors_origins_list}")
    logger.info(f"Static Sandbox Directory: {settings.STATIC_SANDBOX_DIR}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for flexible local dev / Vite preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Sandboxed Generated Apps Preview Directory
app.mount(
    "/preview",
    StaticFiles(directory=settings.STATIC_SANDBOX_DIR, html=True),
    name="preview"
)

# Register API Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
