"""
FastAPI application entry point
Pet Health Companion API
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from typing import Dict
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.routes import auth, pets, symptom_checks, providers, recommendations
from app.services.seed_data import seed_providers

# Configure logging - don't log sensitive data
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


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
    lifespan=lifespan,
    docs_url="/docs" if settings.environment != "production" else None,  # Disable docs in production
    redoc_url="/redoc" if settings.environment != "production" else None
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Request size limit middleware
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    max_size = 10 * 1024 * 1024  # 10MB
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > max_size:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Request body too large. Maximum size is 10MB."}
        )
    return await call_next(request)

# Configure CORS middleware - MUST be before routers
# Use environment-based CORS origins for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Restricted to configured origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "X-Total-Count"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Add trusted host middleware for production
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts_list
    )

# Add custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for request validation errors to provide better error messages
    """
    # Log validation errors without sensitive data
    logger.warning(f"Validation error for {request.method} {request.url.path}")
    
    # Extract specific error messages (sanitized)
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