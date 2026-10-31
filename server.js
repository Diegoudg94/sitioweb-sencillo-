const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';
const files = {
  '/': ['Index.html', 'text/html; charset=utf-8'],
  '/index.html': ['Index.html', 'text/html; charset=utf-8'],
  '/images.jpeg': ['images.jpeg', 'image/jpeg'],
  '/fondo.svg': ['fondo.svg', 'image/svg+xml'],
};

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
  } catch {
    response.writeHead(400);
    response.end('Solicitud incorrecta');
    return;
  }

  const file = files[pathname];
  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Página no encontrada');
    return;
  }

  const [filename, contentType] = file;
  const filePath = path.join(__dirname, filename);
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end('Archivo no encontrado');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`Servidor disponible en http://${host}:${port}`);
});
