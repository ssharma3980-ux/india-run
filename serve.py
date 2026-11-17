#!/usr/bin/env python3
"""Local test server. Run `python serve.py`, then open the printed address
on your PC, or on your phone (same Wi-Fi) using the LAN address."""
import http.server, socket, socketserver, os, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
subprocess.run([sys.executable, str(ROOT / "build.py")], check=True)
os.chdir(ROOT / "dist")
PORT = int(os.environ.get("PORT", 8080))
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(("8.8.8.8", 80)); ip = s.getsockname()[0]; s.close()
except OSError:
    ip = "127.0.0.1"
print(f"\n  PC:    http://localhost:{PORT}/\n  Phone: http://{ip}:{PORT}/\n")
with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
