from typing import List, Optional
import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
from pydantic import BaseModel
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from database import DatabaseManager
from langdetect import detect

load_dotenv()

class Document(BaseModel):
    id: str
    content: str
    metadata: dict
    created_at: str

class RAGService:
    def __init__(self):
        # Initialize Cohere client
        cohere_api_key = os.getenv("COHERE_API_KEY")
        if cohere_api_key:
            try:
                self.cohere_client = cohere.Client(cohere_api_key)
                print("Cohere client initialized successfully")
            except Exception as e:
                print(f"WARNING: Failed to initialize Cohere client: {e}")
                print("Some features will be disabled.")
                self.cohere_client = None
        else:
            print("WARNING: COHERE_API_KEY not set. Some features will be disabled.")
            self.cohere_client = None

        # Initialize Qdrant client
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")

        # Only try to connect to cloud if we have both URL and API key and the URL is not a placeholder
        if qdrant_url and qdrant_api_key and "your_" not in qdrant_url and "example" not in qdrant_url:
            try:
                self.qdrant_client = QdrantClient(
                    url=qdrant_url,
                    api_key=qdrant_api_key,
                    prefer_grpc=True
                )
                print("Connected to Qdrant Cloud successfully")
            except Exception as e:
                print(f"Failed to connect to Qdrant Cloud: {e}")
                print("Using in-memory storage for testing")
                # Use in-memory Qdrant client
                self.qdrant_client = QdrantClient(":memory:")
        else:
            print("QDRANT_URL or QDRANT_API_KEY not set or using placeholder values. Using in-memory storage for testing")
            # Initialize in-memory Qdrant client
            self.qdrant_client = QdrantClient(":memory:")

        # Initialize database manager
        self.db_manager = DatabaseManager()

        # Ensure the collection exists (this will create it if needed)
        self._ensure_collection_exists()

        # Verify that the client has the required methods
        if not hasattr(self.qdrant_client, 'search'):
            print("WARNING: Qdrant client doesn't have 'search' method. This may indicate an issue with the client initialization.")

    def _ensure_collection_exists(self):
        """Ensure the Qdrant collection exists"""
        try:
            # Check if the collection exists
            self.qdrant_client.get_collection("physical_ai_docs")
        except Exception as e:
            print(f"Collection doesn't exist, creating it: {e}")
            try:
                # Create the collection with proper vector configuration
                self.qdrant_client.create_collection(
                    collection_name="physical_ai_docs",
                    vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
                )
                print("Collection 'physical_ai_docs' created successfully")
            except Exception as create_error:
                print(f"Failed to create collection: {create_error}")

    async def connect_to_neon_db(self):
        """Establish connection to Neon Postgres database"""
        await self.db_manager.connect()

    async def embed_text(self, text: str, input_type: str = "search_document") -> List[float]:
        """Generate embeddings for text using Cohere"""
        if not self.cohere_client:
            raise Exception("Cohere client not initialized. Please set COHERE_API_KEY.")

        try:
            response = self.cohere_client.embed(
                texts=[text],
                model="embed-english-v3.0",
                input_type=input_type
            )
            return response.embeddings[0]
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            raise

    async def store_document(self, content: str, metadata: dict = None) -> str:
        """Store a document in Qdrant with embeddings"""
        if metadata is None:
            metadata = {}

        doc_id = str(uuid.uuid4())
        vector = await self.embed_text(content)

        self.qdrant_client.upsert(
            collection_name="physical_ai_docs",
            points=[
                models.PointStruct(
                    id=doc_id,
                    vector=vector,
                    payload={
                        "content": content,
                        "metadata": metadata,
                        "created_at": datetime.now().isoformat()
                    }
                )
            ]
        )

        # Store in Neon Postgres as well if available
        if self.db_manager.has_pool:
            # Convert metadata to JSON string for database storage
            import json
            json_metadata = json.dumps(metadata) if isinstance(metadata, dict) else metadata
            await self.db_manager.store_document(doc_id, content, json_metadata)

        return doc_id

    async def search_documents(self, query: str, limit: int = 5) -> List[dict]:
        """Search for relevant documents in Qdrant"""
        query_vector = await self.embed_text(query, input_type="search_query")

        print(f"Qdrant client type: {type(self.qdrant_client)}")
        print(f"Qdrant client has search method: {hasattr(self.qdrant_client, 'search')}")

        # Check if the collection exists before searching
        try:
            self.qdrant_client.get_collection("physical_ai_docs")
            print("Collection 'physical_ai_docs' exists")
        except Exception as e:
            print(f"Collection 'physical_ai_docs' does not exist: {e}")
            # Try to create it again
            try:
                from qdrant_client.http import models
                self.qdrant_client.create_collection(
                    collection_name="physical_ai_docs",
                    vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
                )
                print("Collection 'physical_ai_docs' created successfully")
            except Exception as create_error:
                print(f"Failed to create collection: {create_error}")
                return []

        # Check if the qdrant_client has the search method
        if not hasattr(self.qdrant_client, 'search'):
            print("Qdrant client doesn't have search method - likely using in-memory mode without proper initialization")
            # Return empty results if search method is not available
            return []

        try:
            search_results = self.qdrant_client.search(
                collection_name="physical_ai_docs",
                query_vector=query_vector,
                limit=limit,
                with_payload=True
            )
        except Exception as e:
            print(f"Qdrant search error: {e}")
            import traceback
            traceback.print_exc()
            # Return empty results if search fails
            return []

        results = []
        for result in search_results:
            if result.payload:
                results.append({
                    "id": result.id,
                    "content": result.payload.get("content", ""),
                    "metadata": result.payload.get("metadata", {}),
                    "score": result.score
                })

        print(f"Found {len(results)} search results")
        return results

    async def generate_response(self, query: str, context: str = "") -> str:
        """Generate a response using Cohere based on query and context"""
        if not self.cohere_client:
            return "Sorry, the AI service is not configured. Please set the COHERE_API_KEY environment variable."

        try:
            # Detect the language of the query to provide appropriate response
            try:
                detected_lang = detect(query)
                print(f"Detected language: {detected_lang}")
            except:
                detected_lang = "en"  # Default to English if detection fails

            # Prepare the message content
            full_context = f"Context: {context}\n\n" if context else ""

            # Customize message based on detected language
            if detected_lang == 'ur':  # Urdu
                message = f"""
                {full_context}
                سوال: {query}

                براہ کرم فزیکل ای آئی اور روبوٹکس کے درسی منصوبے کے مواد کی بنیاد پر جامع جواب فراہم کریں۔
                اگر آپ کے پاس کافی معلومات نہیں ہیں تو واضح طور پر کہیں۔
                جواب اردو میں ہونا چاہیے۔
                """
            else:  # Default to English
                message = f"""
                {full_context}
                Question: {query}

                Please provide a comprehensive answer based on the Physical AI & Robotics textbook content.
                If you don't have enough information, say so clearly.
                """

            # Try different models in order of preference
            # Based on testing, command-r-08-2024 works with the current API key
            models_to_try = ["command-r-08-2024", "command-r-plus-08-2024", "command-r-plus", "command-r", "command", "command-light"]
            response = None

            for model in models_to_try:
                try:
                    # Generate response using Cohere Chat API
                    response = self.cohere_client.chat(
                        model=model,
                        message=message,
                        max_tokens=500,
                        temperature=0.7
                    )
                    print(f"Successfully used model: {model}")
                    break
                except Exception as model_error:
                    print(f"Model {model} not available: {model_error}")
                    continue

            if response is not None:
                return response.text.strip()
            else:
                # If no models are available, return a helpful message
                if detected_lang == 'ur':
                    return """AI سروس کا استعمال کرنے کے لیے ماڈل کی رسائی کی پابندیوں کی وجہ سے دستیاب نہیں ہے۔
                    یہ اس وجہ سے ہو سکتا ہے:
                    1. آپ کے کوہیر API کلید کے پاس درکار ماڈلز تک رسائی نہیں ہے
                    2. ماڈلز کو ختم کر دیا گیا ہے یا نام تبدیل کر دیا گیا ہے
                    3. آپ کا اکاؤنٹ ٹیئر ان ماڈلز کی حمایت نہیں کرتا

                    براہ کرم اپنی API کلید اور ماڈل تک رسائی چیک کریں، یا معاونت کے لیے رابطہ کریں۔"""
                else:
                    return """AI service is not currently available due to model access restrictions.
                    This may be because:
                    1. Your Cohere API key doesn't have access to the required models
                    2. The models have been deprecated or renamed
                    3. Your account tier doesn't support these models

                    Please check your API key and model access, or contact support for assistance."""

        except Exception as e:
            print(f"Error generating response: {e}")
            return "Sorry, I encountered an error while processing your request."

    async def generate_paper(self, topic: str, length: int = 3000) -> str:
        """Generate a research paper on a given topic"""
        if not self.cohere_client:
            return "Sorry, the AI service is not configured. Please set the COHERE_API_KEY environment variable."

        try:
            message = f"""
            Write a comprehensive research paper about {topic}.
            The paper should be approximately {length} words long.
            Include the following sections:
            1. Introduction
            2. Literature Review
            3. Methodology (if applicable)
            4. Discussion
            5. Conclusion
            6. References

            Make sure the paper is well-structured, academic in tone, and includes relevant information about Physical AI and Robotics.
            """

            # Try different models in order of preference
            # Based on testing, command-r-08-2024 works with the current API key
            models_to_try = ["command-r-08-2024", "command-r-plus-08-2024", "command-r-plus", "command-r", "command", "command-light"]
            response = None

            for model in models_to_try:
                try:
                    response = self.cohere_client.chat(
                        model=model,
                        message=message,
                        max_tokens=length,
                        temperature=0.7
                    )
                    print(f"Successfully used model for paper: {model}")
                    break
                except Exception as model_error:
                    print(f"Model {model} not available for paper generation: {model_error}")
                    continue

            if response is not None:
                paper_content = response.text.strip()

                # Store the generated paper in the database
                await self.store_document(
                    content=paper_content,
                    metadata={
                        "type": "generated_paper",
                        "topic": topic,
                        "length": length
                    }
                )

                return paper_content
            else:
                # If no models are available, return a helpful message
                return """AI service is not currently available for paper generation due to model access restrictions.
                This may be because:
                1. Your Cohere API key doesn't have access to the required models
                2. The models have been deprecated or renamed
                3. Your account tier doesn't support these models

                Please check your API key and model access, or contact support for assistance."""

        except Exception as e:
            print(f"Error generating paper: {e}")
            return "Sorry, I encountered an error while generating the paper."

    async def load_documents_from_db(self):
        """Load documents from Neon Postgres if available"""
        if not self.db_manager.has_pool:
            return []

        try:
            return await self.db_manager.search_documents("", limit=100)  # Get all documents
        except Exception as e:
            print(f"Error loading documents from database: {e}")
            return []