FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Add gunicorn for production
RUN pip install --no-cache-dir gunicorn uvicorn

# Copy application files
COPY backend/ ./backend/
COPY model/ ./model/

# Expose port
EXPOSE 8000

# Run FastAPI with Gunicorn and Uvicorn workers
CMD ["gunicorn", "backend.app.main:app", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
