# 🪟 Windows Troubleshooting Guide

## 🚨 Common Issues & Solutions

### **Issue 1: "Python is not installed or not in PATH"**

**Solution:**
1. Download Python from [python.org](https://www.python.org/downloads/)
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Restart Command Prompt
4. Test: `python --version` or `py --version`

### **Issue 2: "npm is not installed or not in PATH"**

**Solution:**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install with default settings (npm comes included)
3. Restart Command Prompt
4. Test: `node --version` and `npm --version`

### **Issue 3: Permission Errors**

**Solution:**
1. Run Command Prompt as Administrator
2. Or use: `python -m pip install --user -r requirements.txt`

### **Issue 4: Port Already in Use**

**Solution:**
The script should handle this automatically, but if not:
```cmd
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

### **Issue 5: Emoji Display Issues**

**Solution:**
- Use Windows Terminal or PowerShell instead of Command Prompt
- Or ignore the display issues - functionality is not affected

## 🔧 Step-by-Step Troubleshooting

### **Step 1: Check Prerequisites**
```cmd
python --version
# Should show Python 3.7+

npm --version
# Should show npm version

pip --version
# Should show pip version
```

### **Step 2: Manual Installation (if start.bat fails)**
```cmd
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install Node.js dependencies
cd ..\client
npm install
```

### **Step 3: Manual Startup (if automatic startup fails)**
```cmd
# Terminal 1 - Backend
cd backend
python src/app.py

# Terminal 2 - Frontend
cd client
npm run dev
```

### **Step 4: Alternative Python Commands**
If `python` doesn't work, try:
- `py` (Python Launcher for Windows)
- `python3`
- `py -3`

### **Step 5: Virtual Environment (Recommended)**
```cmd
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python src/app.py
```

## 🆘 If Nothing Works

### **Nuclear Option - Clean Install:**
1. Delete `node_modules` folders
2. Delete `venv` folder (if exists)
3. Run: `python install_dependencies.py`
4. Try `start.bat` again

### **Alternative Startup Methods:**

**Method 1: Use Python installer**
```cmd
python install_dependencies.py
```

**Method 2: Manual step-by-step**
```cmd
# Backend setup
cd backend
pip install fastapi uvicorn pydantic python-multipart
python src/app.py

# In another terminal - Frontend setup
cd client
npm install
npm run dev
```

## 📞 Still Having Issues?

**Common Error Messages:**

1. **"'python' is not recognized"**
   - Python not installed or not in PATH
   - Try `py` instead of `python`

2. **"'npm' is not recognized"**
   - Node.js not installed
   - Restart terminal after installing Node.js

3. **"Permission denied"**
   - Run as Administrator
   - Or use `--user` flag with pip

4. **"Port 3001 is already in use"**
   - Another process is using the port
   - Restart your computer or kill the process manually

5. **"Module not found"**
   - Dependencies not installed properly
   - Try reinstalling: `pip install -r requirements.txt --force-reinstall`

## ✅ Success Indicators

When everything works, you should see:
- Backend running on: http://localhost:3001
- Frontend running on: http://localhost:5173
- Browser opens automatically
- No error messages in terminals

## 🔍 Debug Information

If you're still having issues, provide this information:
```cmd
python --version
pip --version
npm --version
node --version
echo %PATH%
```

And the exact error message you're seeing.
