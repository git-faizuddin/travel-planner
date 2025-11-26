from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.v1 import blogs, recommendations
from app import crud
from app.utils.mock_data import get_mock_blog_posts
# Import models to ensure they're registered with SQLAlchemy
from app.models import BlogPost, Hotel  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize with mock data if database is empty
def init_mock_data():
    """Initialize database with mock blog posts if empty"""
    db = SessionLocal()
    try:
        # Check if database is empty
        existing_posts = crud.blog.get_blog_posts(db, skip=0, limit=1)
        if len(existing_posts) == 0:
            # Add mock data
            mock_posts = get_mock_blog_posts()
            for post_data in mock_posts:
                crud.blog.create_blog_post(db=db, post=post_data)
            print(f"Initialized database with {len(mock_posts)} mock blog posts")
    finally:
        db.close()

# Initialize mock data on startup
init_mock_data()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(blogs.router, prefix=f"{settings.api_v1_prefix}/blogs", tags=["blogs"])
app.include_router(recommendations.router, prefix=f"{settings.api_v1_prefix}/recommendations", tags=["recommendations"])


@app.get("/")
def root():
    return {
        "message": "Hotel Recommendation API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

