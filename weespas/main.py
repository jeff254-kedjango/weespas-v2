from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import create_tables
from routers.properties import router as properties_router

# Initialize FastAPI app
app = FastAPI(
    title="Weespas API",
    description="Enterprise-scale property marketplace API for millions of concurrent users",
    version="2.0.0"
)

# CORS Middleware: Configure for production with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",  # For development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== STARTUP EVENTS =====================
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    create_tables()


# ===================== API ROUTES =====================
app.include_router(properties_router, prefix="/api/v1", tags=["properties"])


# ===================== HEALTH CHECK =====================
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "Weespas API",
        "version": "2.0.0",
        "description": "Enterprise-scale property marketplace",
        "docs": "/docs",
        "redoc": "/redoc"
    }