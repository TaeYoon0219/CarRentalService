# 🚗 Car Rental Service

A modern car rental service with a React frontend and FastAPI backend.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

**For macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**For Windows:**
```cmd
start.bat
```

The script will:
- ✅ Check system requirements
- 📦 Install dependencies automatically
- 🔥 Start the backend server (port 3001)
- 🎨 Start the frontend server (port 5173)
- 🌐 Open your browser automatically

### Option 2: Install Dependencies First

If you want to install all dependencies at once:

```bash
# Install all dependencies (Python + Node.js)
python3 install_dependencies.py

# Or install manually:
pip install -r requirements.txt  # Backend dependencies
cd client && npm install         # Frontend dependencies
```

### Manual Setup

If you prefer to run services manually:

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python src/app.py
```
Backend will run on: http://localhost:3001

#### Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

## 📋 System Requirements

- **Python 3.7+** (for backend)
- **Node.js 16+** (for frontend)
- **npm** (comes with Node.js)

## 🔗 Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs (FastAPI auto-generated docs)

## 🗂️ Project Structure

```
CarRentalService/
├── backend/                 # FastAPI backend
│   ├── db/                 # Database files and schema
│   │   ├── carrental.db    # SQLite database
│   │   ├── database.sql    # Database schema
│   │   └── schema_overview.md
│   └── src/
│       └── app.py          # Main FastAPI application
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── App.css         # Styling
│   │   └── main.tsx        # Entry point
│   └── package.json
├── start.sh               # Auto-start script (macOS/Linux)
├── start.bat              # Auto-start script (Windows)
└── README.md
```

## 🎯 Features

### Frontend Features
- **Car Browsing**: View available rental cars with detailed information
- **User Registration**: Create user accounts
- **Reservation System**: Book cars for specific dates
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with animations

### Backend Features
- **RESTful API**: FastAPI-powered REST endpoints
- **Database Integration**: SQLite database with proper schema
- **CORS Support**: Configured for frontend-backend communication
- **Auto Documentation**: Interactive API docs at `/docs`

### API Endpoints
- `GET /api/cars` - Retrieve all available cars
- `POST /api/users` - Create new user account
- `POST /api/reservations` - Create new reservation

## 🗄️ Database Schema

The application uses SQLite with the following tables:
- **users** - Customer accounts
- **cars** - Vehicle inventory
- **reservations** - Booking records
- **features** - Car features
- **car_features** - Car-feature relationships
- **payments** - Payment records

## 🛠️ Development

### Adding Sample Data

The database starts empty. You can add sample cars through the API or directly to the database:

```python
# Example: Add a sample car via Python
import sqlite3

conn = sqlite3.connect('backend/db/carrental.db')
cursor = conn.cursor()

cursor.execute('''
INSERT INTO cars (vin, make, model, year, transmission, seats, doors, color, daily_rate_cents, status)
VALUES ('1HGBH41JXMN109186', 'Toyota', 'Camry', 2023, 'Automatic', 5, 4, 'Silver', 4500, 'available')
''')

conn.commit()
conn.close()
```

### Tech Stack

**Frontend:**
- React 19.1.1
- TypeScript
- Vite (build tool)
- Modern CSS with animations

**Backend:**
- FastAPI (Python web framework)
- SQLite database
- Pydantic (data validation)
- CORS middleware

## 🐛 Troubleshooting

**Port already in use:**
The startup scripts automatically kill existing processes on ports 3001 and 5173.

**Dependencies not installing:**
- Ensure Python 3.7+ and Node.js 16+ are installed
- Try running `pip install --upgrade pip` and `npm install -g npm@latest`

**Database issues:**
- The database is auto-created from `backend/db/database.sql`
- Delete `backend/db/carrental.db` to reset the database

**CORS errors:**
- Make sure both frontend and backend are running
- Check that backend is accessible at http://localhost:3001

## 📝 License

This project is for educational purposes.
