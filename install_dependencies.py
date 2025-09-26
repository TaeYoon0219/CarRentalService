#!/usr/bin/env python3
"""
Dependency Installation Script for Car Rental Service
This script installs all required dependencies for both backend and frontend
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None, description=""):
    """Run a command and handle errors"""
    print(f"📦 {description}")
    print(f"   Running: {' '.join(command)}")
    
    try:
        result = subprocess.run(
            command, 
            cwd=cwd, 
            check=True, 
            capture_output=True, 
            text=True
        )
        print(f"   ✅ Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print(f"   ❌ Command not found: {command[0]}")
        return False

def check_python():
    """Check if Python is available"""
    try:
        result = subprocess.run([sys.executable, "--version"], 
                              capture_output=True, text=True)
        print(f"✅ Python found: {result.stdout.strip()}")
        return True
    except:
        print("❌ Python not found")
        return False

def check_node():
    """Check if Node.js and npm are available"""
    try:
        node_result = subprocess.run(["node", "--version"], 
                                   capture_output=True, text=True)
        npm_result = subprocess.run(["npm", "--version"], 
                                  capture_output=True, text=True)
        print(f"✅ Node.js found: {node_result.stdout.strip()}")
        print(f"✅ npm found: {npm_result.stdout.strip()}")
        return True
    except:
        print("❌ Node.js or npm not found")
        return False

def install_python_dependencies(project_root):
    """Install Python dependencies"""
    print("\n🐍 Installing Python Dependencies...")
    print("=" * 50)
    
    requirements_file = project_root / "requirements.txt"
    
    if not requirements_file.exists():
        print(f"❌ Requirements file not found: {requirements_file}")
        return False
    
    # Try pip3 first, then pip
    pip_commands = ["pip3", "pip"]
    
    for pip_cmd in pip_commands:
        print(f"\n🔧 Trying {pip_cmd}...")
        success = run_command([
            pip_cmd, "install", "-r", str(requirements_file), "--upgrade"
        ], description=f"Installing Python packages with {pip_cmd}")
        
        if success:
            print(f"✅ Python dependencies installed successfully with {pip_cmd}")
            return True
    
    print("❌ Failed to install Python dependencies")
    return False

def install_node_dependencies(project_root):
    """Install Node.js dependencies for frontend"""
    print("\n📦 Installing Node.js Dependencies...")
    print("=" * 50)
    
    frontend_dir = project_root / "client"
    
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        return False
    
    package_json = frontend_dir / "package.json"
    if not package_json.exists():
        print(f"❌ package.json not found: {package_json}")
        return False
    
    success = run_command([
        "npm", "install"
    ], cwd=frontend_dir, description="Installing Node.js packages")
    
    if success:
        print("✅ Node.js dependencies installed successfully")
        return True
    else:
        print("❌ Failed to install Node.js dependencies")
        return False

def create_virtual_environment(project_root):
    """Create a Python virtual environment (optional)"""
    print("\n🔧 Python Virtual Environment Setup...")
    print("=" * 50)
    
    venv_dir = project_root / "venv"
    
    if venv_dir.exists():
        print("✅ Virtual environment already exists")
        return True
    
    print("🆕 Creating new virtual environment...")
    success = run_command([
        sys.executable, "-m", "venv", str(venv_dir)
    ], description="Creating virtual environment")
    
    if success:
        print("✅ Virtual environment created")
        print(f"💡 To activate it:")
        print(f"   macOS/Linux: source {venv_dir}/bin/activate")
        print(f"   Windows: {venv_dir}\\Scripts\\activate")
        return True
    else:
        print("❌ Failed to create virtual environment")
        return False

def main():
    """Main installation function"""
    print("🚗 Car Rental Service - Dependency Installation")
    print("=" * 60)
    
    # Get project root directory
    project_root = Path(__file__).parent.absolute()
    print(f"📁 Project root: {project_root}")
    
    # Check system requirements
    print("\n🔍 Checking System Requirements...")
    print("=" * 50)
    
    python_ok = check_python()
    node_ok = check_node()
    
    if not python_ok:
        print("\n❌ Python is required but not found. Please install Python 3.7+ first.")
        return False
    
    if not node_ok:
        print("\n❌ Node.js/npm is required but not found. Please install Node.js first.")
        return False
    
    # Offer to create virtual environment
    print("\n🤔 Virtual Environment Setup")
    print("=" * 50)
    print("It's recommended to use a Python virtual environment.")
    create_venv = input("Create virtual environment? (y/n): ").lower().strip()
    
    if create_venv in ['y', 'yes']:
        venv_success = create_virtual_environment(project_root)
        if venv_success:
            print("\n💡 Remember to activate the virtual environment before running the app:")
            print("   source venv/bin/activate  (macOS/Linux)")
            print("   venv\\Scripts\\activate     (Windows)")
    
    # Install dependencies
    python_success = install_python_dependencies(project_root)
    node_success = install_node_dependencies(project_root)
    
    # Summary
    print("\n📋 Installation Summary")
    print("=" * 50)
    print(f"Python dependencies: {'✅ Success' if python_success else '❌ Failed'}")
    print(f"Node.js dependencies: {'✅ Success' if node_success else '❌ Failed'}")
    
    if python_success and node_success:
        print("\n🎉 All dependencies installed successfully!")
        print("\n🚀 Next steps:")
        print("1. Run: ./start.sh (macOS/Linux) or start.bat (Windows)")
        print("2. Or manually start:")
        print("   Backend: cd backend && python src/app.py")
        print("   Frontend: cd client && npm run dev")
        return True
    else:
        print("\n❌ Some dependencies failed to install. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
