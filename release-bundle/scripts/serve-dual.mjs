import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let appDir = path.resolve(rootDir, 'dist');
if (!fs.existsSync(appDir) && fs.existsSync(path.resolve(rootDir, 'app'))) {
  appDir = path.resolve(rootDir, 'app');
}

const dataDir = path.resolve(rootDir, 'data-runtime');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const syncFile = path.resolve(dataDir, 'kiosk-sync-state.json');

const KIOSK_PORT = 5000;
const ADMIN_PORT = 5001;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
};

// Ambil seluruh alamat IPv4 lokal jaringan (LAN)
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const localIps = getLocalIpAddresses();

function createServerHandler(portName, portNumber) {
  return (req, res) => {
    // Universal CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname.toLowerCase();

    // 1. API: Synchronization
    if (pathname === '/api/sync') {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            fs.writeFileSync(syncFile, body, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Data synced successfully' }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      } else if (req.method === 'GET') {
        if (fs.existsSync(syncFile)) {
          const content = fs.readFileSync(syncFile, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(content);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ hasState: false }));
        }
        return;
      }
    }

    // 2. API: Server Status & IP info
    if (pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          kioskPort: KIOSK_PORT,
          adminPort: ADMIN_PORT,
          localIps,
          serverTime: new Date().toISOString(),
        })
      );
      return;
    }

    // 3. Static Assets & SPA Fallback
    let safePath = path.normalize(decodeURIComponent(urlObj.pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
      safePath = '/index.html';
    }

    let filePath = path.join(appDir, safePath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(appDir, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  };
}

// Jalankan Listener untuk Kiosk (Port 5000) dan Admin (Port 5001)
const kioskServer = http.createServer(createServerHandler('KIOSK', KIOSK_PORT));
const adminServer = http.createServer(createServerHandler('ADMIN', ADMIN_PORT));

kioskServer.listen(KIOSK_PORT, '0.0.0.0', () => {
  console.log(`[KIOSK] Running at http://localhost:${KIOSK_PORT}/ (0.0.0.0:${KIOSK_PORT})`);
});

adminServer.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`[ADMIN] Running at http://localhost:${ADMIN_PORT}/ (0.0.0.0:${ADMIN_PORT})`);
  for (const ip of localIps) {
    console.log(`  -> Akses LAN Petugas Gudang: http://${ip}:${ADMIN_PORT}/`);
  }
});
