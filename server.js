const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.resolve(root, `.${pathname}`);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Task-calendar running at http://localhost:${port}`);
  });
