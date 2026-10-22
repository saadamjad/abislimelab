"""Local preview server for Abi's Slime Lab with caching turned off,
so the browser always loads the latest files. Used by the start scripts."""
import http.server, socketserver, sys, webbrowser, threading

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, *args):
        pass

port = 5500
while True:
    try:
        httpd = socketserver.TCPServer(("", port), NoCache)
        break
    except OSError:
        port += 1
url = f"http://localhost:{port}/index.html"
print(f"Abi's Slime Lab is running at {url}\nKeep this window open. Close it (or press Ctrl+C) to stop.")
if "--no-open" not in sys.argv:
    threading.Timer(1, lambda: webbrowser.open(url)).start()
httpd.serve_forever()
