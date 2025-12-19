"""
FastAPI application entry point
Pet Health Companion API
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from typing import Dict
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.routes import auth, pets, symptom_checks, providers, recommendations
from app.services.seed_data import seed_providers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    
    # Seed provider data if needed
    try:
        await seed_providers()
    except Exception as e:
        print(f"[WARNING] Failed to seed providers: {e}")
    
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()


# Initialize FastAPI app
app = FastAPI(
    title="Pet Health Companion API",
    description="Backend API for Happy Tiger Run Pet Health Companion",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware - MUST be before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for request validation errors to provide better error messages
    """
    logger.error(f"Validation error for {request.method} {request.url}")
    logger.error(f"Errors: {exc.errors()}")
    logger.error(f"Body: {exc.body}")
    
    # Extract specific error messages
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(x) for x in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation failed",
            "errors": errors,
            "message": "Please check your request data and try again"
        }
    )

# Include routers
app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(symptom_checks.router)
app.include_router(providers.router)
app.include_router(recommendations.router)


@app.get("/api/v1/healthz", tags=["Health"])
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint that verifies MongoDB connection
    
    Returns:
        Dict with status and database connection state
    """
    try:
        # Verify database connection by pinging
        db = get_database()
        await db.client.admin.command('ping')
        
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """
    Root endpoint
    
    Returns:
        Welcome message with API documentation link
    """
    return {
        "message": "Welcome to Pet Health Companion API",
        "docs": "/docs",
        "health": "/api/v1/healthz"
    }