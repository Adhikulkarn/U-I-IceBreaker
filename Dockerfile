# Use lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 10000

# Set proper working directory
WORKDIR /app

# Install system dependencies required for psycopg2 and Pillow
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    python3-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first for layer caching
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Expose Render port properly
EXPOSE $PORT

# Production start command: run migrations and start uvicorn
CMD python manage.py migrate && uvicorn config.asgi:application --host 0.0.0.0 --port $PORT
