---
title: Physical AI RAG Chatbot
emoji: 🤖
colorFrom: blue
colorTo: red
sdk: docker
pinned: false
license: mit
---

# Physical AI RAG Backend

This is the backend service for the Physical AI & Robotics textbook RAG (Retrieval Augmented Generation) system.

## Tech Stack

- **FastAPI**: Web framework for building the API
- **Cohere**: For embeddings and language model generation
- **Qdrant Cloud**: Vector database for semantic search
- **Neon Postgres**: Cloud PostgreSQL database for document storage
- **Python 3.9+**: Programming language

## Setup for Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys and connection strings
   ```

3. Start the server:
   ```bash
   # On Unix/Linux/Mac:
   ./start.sh

   # On Windows:
   start.bat
   ```

## Hugging Face Space Configuration

This application is designed to run on Hugging Face Spaces with Docker SDK. The following environment variables must be configured in the Space settings:

- `COHERE_API_KEY`: Your Cohere API key
- `QDRANT_URL`: Your Qdrant Cloud URL
- `QDRANT_API_KEY`: Your Qdrant API key
- `NEON_DB_URL`: Your Neon Postgres connection string

## API Endpoints

- `GET /` - Health check
- `POST /api/rag/query` - Query the RAG system
- `POST /api/rag/generate-paper` - Generate a research paper
- `GET /api/health` - Health check

## Architecture

The backend follows a service-oriented architecture:

- `main.py`: FastAPI application with API endpoints
- `services.py`: Business logic for RAG operations
- `database.py`: Database operations and management