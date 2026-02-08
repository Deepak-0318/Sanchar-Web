# Backend Setup Guide

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Setup Steps

### 1. Navigate to Backend Directory
```bash
cd Sanchar-Web/backend
```

### 2. Install Dependencies
```bash
pip install -r ../requirements.txt
```

### 3. Configure Environment Variables
Create/update `.env` file with valid API keys:
```
DEEPSEEK_API_KEY=your_actual_deepseek_key
GOOGLE_API_KEY=your_actual_google_gemini_key
GROQ_API_KEY=your_actual_groq_key
```

### 4. Run the Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:
```bash
python -m uvicorn main:app --reload
```

### 5. Verify Backend is Running
Open browser and go to: `http://localhost:8000/docs`

You should see the FastAPI Swagger documentation.

## Common Issues & Solutions

### Issue 1: Port 8000 Already in Use
**Solution:** Use a different port
```bash
uvicorn main:app --reload --port 8001
```

### Issue 2: Module Not Found Errors
**Solution:** Ensure you're in the correct directory and dependencies are installed
```bash
cd backend
pip install -r ../requirements.txt
```

### Issue 3: API Key Errors
**Solution:** Make sure `.env` file has valid API keys (not placeholders)

### Issue 4: Missing Data Files
**Solution:** Ensure `data/` folder exists with place data files

### Issue 5: Permission Errors
**Solution:** Try with elevated permissions or use virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
```

## Testing Backend
Once running, test with:
```bash
curl http://localhost:8000/system/stats
```

## Backend Endpoints
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/system/stats`
- Chat Start: `POST http://localhost:8000/chat/start`
