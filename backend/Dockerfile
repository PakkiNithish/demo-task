# Use lightweight official Python 3.11 runtime
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from buffering stdout/stderr and writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

# Install OS libraries required by OpenCV, PyMuPDF, and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Step 1: Install lightweight CPU-only PyTorch first (only ~160MB, avoids 3GB CUDA download)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Step 2: Install remaining application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 3: Copy application source code
COPY . .

# Expose Render's standard port
EXPOSE 10000

# Start Uvicorn bound to 0.0.0.0 and port 10000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
