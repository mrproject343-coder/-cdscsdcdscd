#!/usr/bin/env python3
"""
Simple HTTP server for Ask-Me Platform
Run this to serve the frontend locally
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000
DIRECTORY = "frontend"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    # Check if frontend directory exists
    if not os.path.exists(DIRECTORY):
        print(f"❌ Error: '{DIRECTORY}' directory not found!")
        return
    
    # Start server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🚀 Ask-Me Platform - Frontend Server")
        print("=" * 60)
        print(f"📁 Serving directory: {DIRECTORY}")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📝 Open in browser: http://localhost:{PORT}/index.html")
        print("=" * 60)
        print("Press Ctrl+C to stop the server")
        print()
        
        # Open browser
        try:
            webbrowser.open(f"http://localhost:{PORT}/index.html")
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")

if __name__ == "__main__":
    main()
