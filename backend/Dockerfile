FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for asyncpg
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Make start script executable
RUN chmod +x ./huggingface.sh

# Expose the port
EXPOSE 8000

# Run the application
CMD ["./huggingface.sh"]