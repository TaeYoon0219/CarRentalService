from carrental.db import users
from flask import Flask, request, jsonify

app = Flask(__name__)

def login_logic(email, password):
    if email in users and users[email]["password"] == password:
        return {"status": "success", "message": f"Welcome back, {users[email]['full_name']}!"}
    else:
        return {"status": "error", "message": "Invalid email or password!"}

def register_logic(full_name, email, password):
    if email in users:
        return {"status": "error", "message": "Email already exists!"}
    else:
        users[email] = {"full_name": full_name, "password": password}
        return {"status": "success", "message": f"Account created! Welcome, {full_name}!"}

# --- Flask endpoints for frontend ---
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    return jsonify(login_logic(data.get("email"), data.get("password")))

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    return jsonify(register_logic(data.get("full_name"), data.get("email"), data.get("password")))