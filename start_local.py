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

# Your database connection (from Neon)
DATABASE_URL = "postgresql://neondb_owner:npg_oW9trhQIJ5Zx@ep-super-flower-ahzhdzk8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET = "mysomatra_secret_key_2024"

def main():
    print("=" * 50)
    print("  MySomatra Local Development Starter")
    print("=" * 50)
    print()

    # Set environment variables
    os.environ["DATABASE_URL"] = DATABASE_URL
    os.environ["SESSION_SECRET"] = SESSION_SECRET
    os.environ["NODE_ENV"] = "development"
    
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
