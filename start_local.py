"""
MySomatra Local Development Starter
===================================
Double-click this file or run: python start_local.py
It will set up everything and open the website in Chrome!
"""

import os
import subprocess
import time
import webbrowser

def main():
    print("=" * 50)
    print("  MySomatra Local Development Starter")
    print("=" * 50)
    print()

    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        print("[0/4] Loading environment from .env...")
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    elif value.startswith("'") and value.endswith("'"):
                        value = value[1:-1]
                    os.environ[key] = value
    
    # Check for required environment variables
    if "DATABASE_URL" not in os.environ:
        print("WARNING: DATABASE_URL not found in environment or .env file!")
        print("Please create a .env file with DATABASE_URL and SESSION_SECRET")
        return

    print("[1/4] Environment variables set")
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"[2/4] Working directory: {script_dir}")
    
    # Check if node_modules exists, if not run npm install
    if not os.path.exists("node_modules"):
        print("[3/4] Installing dependencies (this may take a minute)...")
        subprocess.run(["npm", "install"], shell=True)
    else:
        print("[3/4] Dependencies already installed")
    
    # Push database schema
    print("[4/4] Syncing database schema...")
    subprocess.run(["npm", "run", "db:push"], shell=True, env=os.environ)
    
    print()
    print("=" * 50)
    print("  Starting server...")
    print("  Opening http://localhost:5000 in 3 seconds...")
    print("=" * 50)
    print()
    print("Press Ctrl+C to stop the server")
    print()
    
    # Open browser after a short delay
    def open_browser():
        time.sleep(3)
        webbrowser.open("http://localhost:5000")
    
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.start()
    
    # Start the development server
    subprocess.run(["npx", "tsx", "server/index-dev.ts"], shell=True, env=os.environ)

if __name__ == "__main__":
    main()
