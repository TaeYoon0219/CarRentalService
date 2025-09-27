## Changes I made

1. Put dummy data into the database
2. app.py is the application layer file. Also its running on FastAPI, which is a python backend framework
   - Includes routes, which are listening for requests from the frontend, and once it recieves those routes, it runs the function inside. 
4. App.tsx is the main frontend file


## How to run
1. Start a virtual enviorment. I reccomend using uv(python package manager)
   - To download uv: for mac(curl -LsSf https://astral.sh/uv/install.sh | sh), for windows(irm https://astral.sh/uv/install.ps1 | iex)
   - Run in terminal(This creates a virtual enviorment): uv venv
   - Run in terminal(this runs the virtual enviorment): source .venv/bin/activate
2. Download packages: uv pip install -r requirements.txt
3. For mac run: start.sh
4. For windows run: start.bat
5. Then it should be running on local server, should be: http://localhost:5173
