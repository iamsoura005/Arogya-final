#!/usr/bin/env python3
"""
Arogya Medical Platform - Complete Application Launcher
Handles automatic port resolution and service initialization
"""

import subprocess
import time
import socket
import webbrowser
import sys
import os
import signal
from pathlib import Path

def check_port_available(port, host='localhost'):
    """Check if a port is available"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return True
        except socket.error:
            return False

def start_backend(port=8001):
    """Start the FastAPI backend server"""
    print(f"[1/2] Starting backend on port {port}...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # Check if port is available
    if not check_port_available(port):
        print(f"⚠️  Port {port} is in use, trying {port + 1}")
        port += 1
        if not check_port_available(port):
            print(f"❌ Cannot find available port in range {port-1}-{port}")
            return None
    
    # Set environment variable for port
    env = os.environ.copy()
    env['API_PORT'] = str(port)
    
    try:
        # Start backend server
        process = subprocess.Popen(
            [sys.executable, "main.py"],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for startup
        time.sleep(3)
        
        # Health check
        try:
            import requests
            response = requests.get(f"http://localhost:{port}/api/benchmarks/runs", timeout=5)
            if response.status_code == 200:
                print(f"✅ Backend running on http://localhost:{port}")
                return process
        except:
            print("⚠️  Backend health check failed, but server may still be starting")
            return process
            
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the React frontend server"""
    print("[2/2] Starting React frontend...")
    
    # Change to project root
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    try:
        # Start frontend server
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for startup and check if Vite starts
        print("⏳ Waiting for frontend to initialize...")
        time.sleep(5)
        
        # Check if port 5173 is responding
        try:
            import requests
            response = requests.get("http://localhost:5173", timeout=5)
            if response.status_code == 200:
                print("✅ Frontend running on http://localhost:5173")
                return process
        except:
            # Try alternative port
            try:
                response = requests.get("http://localhost:3000", timeout=5)
                if response.status_code == 200:
                    print("✅ Frontend running on http://localhost:3000")
                    return process
            except:
                pass
        
        print("✅ Frontend server started (may still be initializing)")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def open_browser():
    """Open the application in default browser"""
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:5173")
        print("🌐 Opened application in browser")
    except Exception as e:
        print(f"⚠️  Could not open browser: {e}")

def main():
    """Main launcher function"""
    print("="*60)
    print("🏥 Arogya Medical Platform - Complete Application Suite")
    print("="*60)
    print()
    
    # Store processes for cleanup
    processes = []
    
    try:
        # Start backend
        backend_process = start_backend(8001)
        if backend_process:
            processes.append(backend_process)
        
        # Start frontend  
        frontend_process = start_frontend()
        if frontend_process:
            processes.append(frontend_process)
        
        # Open browser
        open_browser()
        
        print()
        print("="*60)
        print("🚀 Platform Status:")
        print("  Frontend: http://localhost:5173")
        print("  Backend:  http://localhost:8001")
        print("  Model Comparison: Available in dashboard")
        print("="*60)
        print()
        print("Press Ctrl+C to stop all services")
        print()
        
        # Keep running and monitor processes
        try:
            while True:
                # Check if processes are still running
                for i, process in enumerate(processes):
                    if process.poll() is not None:
                        print(f"⚠️  Process {i+1} stopped unexpectedly")
                        processes[i] = None
                
                # Remove None entries
                processes = [p for p in processes if p is not None]
                
                if not processes:
                    print("❌ All processes stopped")
                    break
                    
                time.sleep(5)
                
        except KeyboardInterrupt:
            print("\n🛑 Shutting down services...")
            
    finally:
        # Cleanup: terminate all processes
        for process in processes:
            if process and process.poll() is None:
                try:
                    process.terminate()
                    process.wait(timeout=5)
                except:
                    process.kill()
        
        print("✅ All services stopped")
        print("Platform shutdown complete")

if __name__ == "__main__":
    main()