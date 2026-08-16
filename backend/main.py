import os
import warnings
import logging

# Suppress internal LangChain/LangGraph pending deprecation notices
warnings.filterwarnings("ignore", category=UserWarning)
try:
    from langchain_core._api.deprecation import LangChainPendingDeprecationWarning
    warnings.filterwarnings("ignore", category=LangChainPendingDeprecationWarning)
except ImportError:
    pass
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

# Register API Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(ws_router)

# Dynamic HTML Preview fallback route (in case Render ephemeral disk wiped the static file)
from fastapi.responses import HTMLResponse
from firebase import get_db

@app.get("/preview/{project_id}/index.html", response_class=HTMLResponse)
@app.get("/preview/{project_id}", response_class=HTMLResponse)
async def serve_preview_html(project_id: str):
    """Serves the generated landing page directly from memory/database or static sandbox."""
    static_file = os.path.join(settings.STATIC_SANDBOX_DIR, project_id, "index.html")
    if os.path.exists(static_file):
        with open(static_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    
    # Dynamic DB fallback
    try:
        db = get_db()
        doc = db.collection("projects").document(project_id).get()
        if doc.exists:
            data = doc.to_dict()
            code_arch = data.get("code_architect")
            if code_arch and isinstance(code_arch, dict) and code_arch.get("html_code"):
                return HTMLResponse(content=code_arch["html_code"])
    except Exception as e:
        logger.warning(f"Error fetching preview from DB: {e}")

    return HTMLResponse(content="<h1>Preview Not Found</h1><p>The requested preview is unavailable or still generating.</p>", status_code=404)

# Mount Sandboxed Generated Apps Preview Directory for assets
app.mount(
    "/preview",
    StaticFiles(directory=settings.STATIC_SANDBOX_DIR, html=True),
    name="preview"
)


from datetime import datetime
from fastapi.responses import JSONResponse, Response


@app.get("/")
@app.head("/")
async def root():
    """Root status endpoint with HEAD support for fast ping monitoring."""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )


@app.get("/health")
@app.head("/health")
async def health_check():
    """Dedicated lightweight health check endpoint for UptimeRobot keep-alive."""
    return JSONResponse(
        content={"status": "ok", "uptime_check": "active", "timestamp": datetime.utcnow().isoformat() + "Z"},
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
