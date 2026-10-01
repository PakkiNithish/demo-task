# Use lightweight official Python 3.11 runtime
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from buffering stdout/stderr and reduce memory fragmentation
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MALLOC_ARENA_MAX=2 \
    PORT=8000

# Install OS libraries required by OpenCV, PyMuPDF, and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Step 1: Install lightweight CPU-only PyTorch first
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Step 2: Install remaining application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 3: Pre-cache embedding and EasyOCR models during build so container runs instantly
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')" && \
    python -c "import easyocr; easyocr.Reader(['hi', 'en'], gpu=False); easyocr.Reader(['te', 'en'], gpu=False); easyocr.Reader(['ta', 'en'], gpu=False)"

# Step 4: Copy application source code
COPY . .

# Expose standard FastAPI port
EXPOSE 8000

# Start Uvicorn bound to 0.0.0.0 and port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
