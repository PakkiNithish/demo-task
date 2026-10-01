# Use lightweight official Python 3.11 runtime
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from buffering stdout/stderr and reduce memory fragmentation
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MALLOC_ARENA_MAX=2 \
    PORT=10000

# Install minimal runtime utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Step 1: Install lightweight application dependencies (No PyTorch!)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Step 2: Pre-cache the fast 30MB ONNX embedding model during build (0 runtime model downloads!)
RUN python -c "from fastembed import TextEmbedding; list(TextEmbedding(model_name='sentence-transformers/all-MiniLM-L6-v2').embed(['warmup']))"

# Step 3: Copy application source code
COPY . .

# Expose Render's standard port
EXPOSE 10000

# Start Uvicorn bound to 0.0.0.0 and port 10000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
