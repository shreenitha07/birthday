/**
 * Static file server — run: npm start
 * Uses only Node built-ins (no Python).
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const startPort = Number(process.env.PORT) || 8780;
let port = startPort;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".mpeg": "audio/mpeg",
  ".mpg": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
};

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const normalized = path.normalize(path.join(root, decoded));
  if (!normalized.startsWith(root)) return null;
  return normalized;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }

  let urlPath = req.url || "/";
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = safeJoin(ROOT, urlPath);
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT_RANGE = 30;

server.on("error", (err) => {
  if (err.code !== "EADDRINUSE") {
    console.error(err);
    process.exit(1);
  }
  if (port >= startPort + PORT_RANGE) {
    console.error(
      `No free port between ${startPort} and ${startPort + PORT_RANGE - 1}. Stop the other process or set PORT.`
    );
    process.exit(1);
  }
  const busy = port;
  port += 1;
  console.warn(`Port ${busy} in use, trying ${port}…`);
  server.listen(port);
});

server.listen(port, () => {
  const addr = server.address();
  const p = typeof addr === "object" && addr ? addr.port : port;
  console.log(`Birthday site: http://localhost:${p}`);
});
