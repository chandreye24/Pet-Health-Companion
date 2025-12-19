# Pet Health Companion API

Backend API for the Happy Tiger Run Pet Health Companion application - a comprehensive pet health management system.

## 🚀 Features

- **FastAPI Framework**: Modern, fast (high-performance) web framework for building APIs
- **MongoDB Atlas**: Cloud-based NoSQL database with Motor async driver
- **Pydantic v2**: Data validation using Python type annotations
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Configured for frontend integration
- **Async/Await**: Full asynchronous support for optimal performance

## 📋 Prerequisites

- Python 3.13 or higher
- MongoDB Atlas account (or local MongoDB instance)
- pip (Python package manager)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and update with your actual values:

```env
MONGODB_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
DATABASE_NAME=pet_health_companion
JWT_SECRET_KEY=your-secure-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Important**: 
- Replace MongoDB credentials with your actual MongoDB Atlas connection string
- Generate a secure JWT secret key (you can use: `openssl rand -hex 32`)
- Update CORS origins to match your frontend URL

## 🏃 Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/healthz

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py           # Package initialization
│   ├── main.py               # FastAPI app entry point
│   ├── config.py             # Environment configuration
│   ├── database.py           # MongoDB connection
│   ├── models/               # Pydantic models
│   │   └── __init__.py
│   ├── routes/               # API endpoints
│   │   └── __init__.py
│   ├── services/             # Business logic
│   │   └── __init__.py
│   └── utils/                # Helper functions
│       └── __init__.py
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🔌 API Endpoints

### Health Check
- **GET** `/api/v1/healthz` - Check API and database health status

### Root
- **GET** `/` - API welcome message and links

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly.

## 🧪 Testing the Setup

1. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

2. Check health endpoint:
   ```bash
   curl http://localhost:8000/api/v1/healthz
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```

## 🔧 Development

### Adding New Dependencies

```bash
pip install package-name
pip freeze > requirements.txt
```

### Code Style

- Follow PEP 8 guidelines
- Use type hints for all functions
- Write docstrings for modules, classes, and functions
- Use async/await for all database operations

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. Verify your MongoDB Atlas connection string in `.env`
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that database user has proper permissions

### Port Already in Use

If port 8000 is already in use, specify a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

### Import Errors

Make sure you're in the `backend/` directory and virtual environment is activated:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

## 📝 License

This project is part of the Happy Tiger Run Pet Health Companion application.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📧 Support

For issues and questions, please create an issue in the repository.