"""
FastAPI application for Hopple.
"""

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import time
from loguru import logger
import uvicorn

from hopple.config.config import get_settings
from hopple.database.db_config import get_db, init_db
from hopple.api.routes import api_routes
from hopple.api.routes import user_routes
from hopple.api.middlewares.auth import get_current_user, require_authenticated

# Get application settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="Hopple API",
    description="API for Hopple, an AI-powered project management system",
    version="0.1.0",
    debug=settings.api.API_DEBUG,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and their processing time."""
    start_time = time.time()
    
    # Generate a unique request ID
    request_id = str(uuid.uuid4())
    logger.info(f"Request {request_id} - Start: {request.method} {request.url.path}")
    
    # Process the request
    try:
        response = await call_next(request)
        
        # Log request completion
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"Request {request_id} - Complete: {request.method} {request.url.path} "
            f"- Status: {response.status_code} - Time: {process_time:.2f}ms"
        )
        
        return response
    except Exception as e:
        # Log any exceptions
        logger.error(
            f"Request {request_id} - Error: {request.method} {request.url.path} - {str(e)}"
        )
        raise
    
# Include API routes
app.include_router(api_routes.router, prefix="/api/v1")
app.include_router(user_routes.router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": app.version}

# Authentication check endpoint
@app.get("/auth/check")
async def auth_check(current_user = Depends(require_authenticated)):
    """Check if the user is authenticated."""
    return {
        "authenticated": True,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "username": current_user.username,
            "role": current_user.role
        }
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Execute actions when the application starts."""
    logger.info("Starting Hopple API")
    try:
        # Initialize the database
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Execute actions when the application shuts down."""
    logger.info("Shutting down Hopple API")


# Run the application if this module is executed directly
if __name__ == "__main__":
    uvicorn.run(
        "hopple.api.app:app",
        host=settings.api.API_HOST,
        port=settings.api.API_PORT,
        reload=settings.api.API_RELOAD
    )
