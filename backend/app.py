import os
from main import app

# This app.py file is needed for Hugging Face Spaces
# It imports the main FastAPI app from main.py
# The Hugging Face Space will run this app

# The app is already defined in main.py with all the RAG functionality
# This file just ensures Hugging Face can run it properly

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))