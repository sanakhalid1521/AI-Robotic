from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
from contextlib import asynccontextmanager
import json
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv

# Import required libraries for RAG implementation
import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
import uuid

from services import RAGService

# Load environment variables from .env file
import os
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# OAuth imports (with fallback for missing authlib)
try:
    from authlib.integrations.starlette_client import OAuth
    from starlette.requests import Request
    from starlette.responses import RedirectResponse
    from starlette.middleware.sessions import SessionMiddleware
    AUTHLIB_AVAILABLE = True
except ImportError:
    # Fallback when authlib is not available
    class OAuth:
        pass
    from starlette.requests import Request
    from starlette.responses import RedirectResponse
    from starlette.middleware.sessions import SessionMiddleware
    AUTHLIB_AVAILABLE = False

# Authentication models
class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = ""
    programmingLevel: Optional[str] = "beginner"
    roboticsFamiliarity: Optional[str] = "none"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = ""
    programmingLevel: Optional[str] = "beginner"
    roboticsFamiliarity: Optional[str] = "none"
    preferredLanguage: Optional[str] = "en"
    contentDepth: Optional[str] = "basic"

class AuthResponse(BaseModel):
    user: UserResponse
    token: str

# Query models
class QueryRequest(BaseModel):
    query: str
    context: Optional[str] = ""
    language: Optional[str] = "auto"  # "auto", "en", "ur", etc.

class QueryResponse(BaseModel):
    response: str

class PaperGenerationRequest(BaseModel):
    topic: str
    length: int

class PaperGenerationResponse(BaseModel):
    paper: str

# Mock database for users (in production, use a real database)
users_db: Dict[str, Dict[str, Any]] = {}
sessions_db: Dict[str, Dict[str, Any]] = {}

# Initialize RAG Service
rag_service = None

def hash_password(password: str) -> str:
    """Simple password hashing (in production, use a proper hashing library like bcrypt)"""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a random token"""
    return secrets.token_urlsafe(32)

# Initialize FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Initializing RAG system...")
    print(f"QDRANT_URL: {os.getenv('QDRANT_URL')}")
    print(f"QDRANT_API_KEY exists: {bool(os.getenv('QDRANT_API_KEY'))}")
    global rag_service
    try:
        rag_service = RAGService()
        print(f"RAGService created. Qdrant client type: {type(rag_service.qdrant_client)}")
        print(f"Qdrant client has search method: {hasattr(rag_service.qdrant_client, 'search')}")
        await rag_service.connect_to_neon_db()
        print("RAG system initialized successfully")
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
        import traceback
        traceback.print_exc()
        # Don't let initialization errors crash the entire app
        # The API endpoints will return errors if rag_service is None
        pass
    yield
    # Shutdown
    print("Shutting down RAG system...")

app = FastAPI(
    title="Physical AI RAG API",
    description="API for Retrieval Augmented Generation with Physical AI content",
    version="1.0.0",
    lifespan=lifespan
)

# Add session middleware for OAuth (only if authlib is available)
if AUTHLIB_AVAILABLE:
    app.add_middleware(SessionMiddleware, secret_key=secrets.token_urlsafe(32))

    # OAuth setup
    oauth = OAuth()
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'your-google-client-id')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', 'your-google-client-secret')

    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
else:
    oauth = None

# Authentication endpoints
@app.post("/api/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        if user_data.email in users_db:
            raise HTTPException(status_code=400, detail="User already exists")

        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user_data.password)

        user = {
            "id": user_id,
            "email": user_data.email,
            "password": hashed_password,
            "name": user_data.name,
            "programmingLevel": user_data.programmingLevel,
            "roboticsFamiliarity": user_data.roboticsFamiliarity,
            "preferredLanguage": "en",
            "contentDepth": "basic",
            "created_at": datetime.now().isoformat()
        }

        users_db[user_data.email] = user

        # Generate token
        token = generate_token()
        sessions_db[token] = {
            "user_id": user_id,
            "email": user_data.email,
            "expires_at": datetime.now() + timedelta(days=7)
        }

        return AuthResponse(
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                programmingLevel=user["programmingLevel"],
                roboticsFamiliarity=user["roboticsFamiliarity"],
                preferredLanguage=user["preferredLanguage"],
                contentDepth=user["contentDepth"]
            ),
            token=token
        )
    except Exception as e:
        print(f"Error in register: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    """Login user with email and password"""
    try:
        # Check if user exists
        if credentials.email not in users_db:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        user = users_db[credentials.email]
        hashed_password = hash_password(credentials.password)

        if user["password"] != hashed_password:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Generate token
        token = generate_token()
        sessions_db[token] = {
            "user_id": user["id"],
            "email": user["email"],
            "expires_at": datetime.now() + timedelta(days=7)
        }

        return AuthResponse(
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                programmingLevel=user["programmingLevel"],
                roboticsFamiliarity=user["roboticsFamiliarity"],
                preferredLanguage=user["preferredLanguage"],
                contentDepth=user["contentDepth"]
            ),
            token=token
        )
    except Exception as e:
        print(f"Error in login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/api/auth/logout")
async def logout(request: Request):
    """Logout user"""
    try:
        # In a real implementation, you'd extract the token from headers
        # For now, we'll return a success response
        return {"message": "Logged out successfully"}
    except Exception as e:
        print(f"Error in logout: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user(request: Request):
    """Get current user profile"""
    try:
        # In a real implementation, you'd validate the token from headers
        # For now, return a dummy user
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not token or token not in sessions_db:
            raise HTTPException(status_code=401, detail="Not authenticated")

        session = sessions_db[token]
        user_email = session["email"]

        if user_email not in users_db:
            raise HTTPException(status_code=401, detail="User not found")

        user = users_db[user_email]

        return UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            programmingLevel=user["programmingLevel"],
            roboticsFamiliarity=user["roboticsFamiliarity"],
            preferredLanguage=user["preferredLanguage"],
            contentDepth=user["contentDepth"]
        )
    except Exception as e:
        print(f"Error in get_current_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")


@app.get("/api/auth/signin/google")
async def google_signin(request: Request):
    """Google OAuth endpoint - redirect to Google for authentication"""
    if not AUTHLIB_AVAILABLE:
        return {"error": "Google OAuth is not available. Authlib is not installed."}

    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/api/auth/signin/google/callback")
async def google_callback(request: Request):
    """Google OAuth callback - handle the response from Google"""
    if not AUTHLIB_AVAILABLE:
        raise HTTPException(status_code=500, detail="Google OAuth is not available. Authlib is not installed.")

    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')

        if user_info:
            email = user_info.get('email')
            name = user_info.get('name', '')
            google_id = user_info.get('sub')

            # Check if user already exists
            if email not in users_db:
                # Create new user
                user_id = str(uuid.uuid4())

                user = {
                    "id": user_id,
                    "email": email,
                    "password": "",  # No password for OAuth users
                    "name": name,
                    "programmingLevel": "beginner",
                    "roboticsFamiliarity": "none",
                    "preferredLanguage": "en",
                    "contentDepth": "basic",
                    "created_at": datetime.now().isoformat(),
                    "google_id": google_id  # Store Google ID for future logins
                }

                users_db[email] = user
            else:
                # Update existing user with Google ID if not already present
                users_db[email]["google_id"] = google_id
                user = users_db[email]

            # Generate token
            token_str = generate_token()
            sessions_db[token_str] = {
                "user_id": user["id"],
                "email": user["email"],
                "expires_at": datetime.now() + timedelta(days=7)
            }

            # In a real app, you'd redirect to frontend with the token
            # For now, we'll return the token and let frontend handle redirect
            return RedirectResponse(url=f"/?token={token_str}")
        else:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

    except Exception as e:
        print(f"Error in Google callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Physical AI RAG API is running!"}

@app.post("/api/rag/query", response_model=QueryResponse)
async def rag_query(request: QueryRequest):
    """
    Process a query using RAG (Retrieval Augmented Generation)
    """
    try:
        if rag_service is None:
            raise HTTPException(status_code=500, detail="RAG service not initialized")

        # Check if the query is a greeting or general conversation
        query_lower = request.query.lower().strip()
        greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "good night"]

        if any(greeting in query_lower for greeting in greetings):
            # For greetings, provide a simple response without searching the knowledge base
            # Check language to provide appropriate greeting
            if request.language == "ur" or (request.language == "auto" and detect_language(request.query) == "ur"):
                simple_response = f"ہیلو! میں آپ کا فزیکل ای آئی اور روبوٹکس اسسٹنٹ ہوں۔ آپ کتاب کے مواد کے بارے میں کچھ بھی پوچھ سکتے ہیں، اور میں آپ کو فزیکل ای آئی اور روبوٹکس کے اہم مضامین سے متعلق معلومات تلاش کرنے میں مدد کروں گا۔"
            else:
                simple_response = f"Hello! I'm your Physical AI & Robotics assistant. You can ask me anything about the textbook content, and I'll help you find relevant information from the Physical AI & Robotics lessons."
            return QueryResponse(response=simple_response)

        # Search for relevant documents
        search_results = await rag_service.search_documents(request.query, limit=5)

        # Combine context from retrieved documents
        retrieved_context = ""
        for result in search_results:
            retrieved_context += result["content"] + "\n\n"

        # If no context was found, use a default response
        if not retrieved_context.strip():
            retrieved_context = "No relevant documents found in the knowledge base."

        # Generate response using the RAG service
        response = await rag_service.generate_response(request.query, retrieved_context)

        return QueryResponse(response=response)

    except Exception as e:
        print(f"Error in rag_query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


def detect_language(text: str) -> str:
    """
    Detect the language of the given text
    Uses Unicode range detection for Urdu as a fallback to avoid import issues
    """
    # First check for Urdu characters using Unicode range
    # Urdu characters are in the Arabic block (0x0600-0x06FF) and Arabic Supplement block (0x0750-0x077F)
    # Also check for Arabic Presentation Forms (0xFB50-0xFDFF, 0xFE70-0xFEFF)
    for char in text:
        if '\u0600' <= char <= '\u06FF' or '\u0750' <= char <= '\u077F' or '\uFB50' <= char <= '\uFDFF' or '\uFE70' <= char <= '\uFEFF':
            return "ur"

    # If no Urdu characters found, try langdetect as fallback
    try:
        from langdetect import detect
        return detect(text)
    except ImportError:
        # If langdetect is not available, default to English
        return "en"
    except:
        # If detection fails for any reason, default to English
        return "en"  # Default to English if detection fails

@app.post("/api/rag/generate-paper", response_model=PaperGenerationResponse)
async def generate_paper(request: PaperGenerationRequest):
    """
    Generate a research paper on a given topic
    """
    try:
        if rag_service is None:
            raise HTTPException(status_code=500, detail="RAG service not initialized")

        # Generate the paper using the RAG service
        generated_paper = await rag_service.generate_paper(request.topic, request.length)

        return PaperGenerationResponse(paper=generated_paper)

    except Exception as e:
        print(f"Error in generate_paper: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating paper: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)