FROM python:3.12.1-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
RUN mkdir /app
WORKDIR /app

# Install the required packages
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Export port
EXPOSE 8003

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]

