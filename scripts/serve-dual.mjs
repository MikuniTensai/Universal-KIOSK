import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createSyncStateReader, matchesEtag } from './sync-state.mjs';

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
const syncStateReader = createSyncStateReader(syncFile);

// Simpan PID untuk shutdown instan
const pidFile = path.resolve(__dirname, 'server.pid');
fs.writeFileSync(pidFile, String(process.pid), 'utf8');
process.on('exit', () => {
  try { if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile); } catch {}
});

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

// Ambil seluruh detail adapter jaringan secara live (dinamis saat IP WiFi berubah)
function getNetworkDetails(req) {
  const interfaces = os.networkInterfaces();
  const interfaceList = [];
  const allIps = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        const lowerName = name.toLowerCase();
        let type = 'other';
        let priority = 3;

        if (lowerName.includes('wl') || lowerName.includes('wifi') || lowerName.includes('wi-fi')) {
          type = 'wifi';
          priority = 1;
        } else if (lowerName.includes('eth') || lowerName.includes('en') || lowerName.includes('lan')) {
          type = 'ethernet';
          priority = 2;
        } else if (lowerName.startsWith('br-') || lowerName.startsWith('docker') || lowerName.startsWith('veth')) {
          type = 'virtual';
          priority = 4;
        }

        allIps.push(net.address);
        interfaceList.push({
          name,
          type,
          priority,
          address: net.address,
          netmask: net.netmask,
          mac: net.mac,
          adminUrl: `http://${net.address}:${ADMIN_PORT}`,
          kioskUrl: `http://${net.address}:${KIOSK_PORT}`,
        });
      }
    }
  }

  // Urutkan prioritas: WiFi -> Ethernet -> Other -> Virtual
  interfaceList.sort((a, b) => a.priority - b.priority);

  // Tentukan primaryIp
  let primaryIp = 'localhost';

  // Jika client mengakses menggunakan IP pada header host, utamakan IP tersebut
  if (req && req.headers && req.headers.host) {
    const hostPart = req.headers.host.split(':')[0];
    if (hostPart && hostPart !== 'localhost' && hostPart !== '127.0.0.1' && !hostPart.includes('::')) {
      primaryIp = hostPart;
    }
  }

  if (primaryIp === 'localhost' && interfaceList.length > 0) {
    // Pilih interface fisik non-virtual pertama jika tersedia
    const physical = interfaceList.find((i) => i.type === 'wifi' || i.type === 'ethernet');
    primaryIp = physical ? physical.address : interfaceList[0].address;
  }

  return {
    success: true,
    primaryIp,
    isDynamic: true,
    hostname: os.hostname(),
    kioskPort: KIOSK_PORT,
    adminPort: ADMIN_PORT,
    adminUrl: `http://${primaryIp}:${ADMIN_PORT}`,
    kioskUrl: `http://${primaryIp}:${KIOSK_PORT}`,
    interfaces: interfaceList.map((i) => ({
      name: i.name,
      type: i.type,
      address: i.address,
      adminUrl: i.adminUrl,
      kioskUrl: i.kioskUrl,
      isPrimary: i.address === primaryIp,
    })),
    allIps,
    serverTime: new Date().toISOString(),
  };
}

function createServerHandler(portName, portNumber) {
  return (req, res) => {
    // Universal CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, If-None-Match');
    res.setHeader('Access-Control-Expose-Headers', 'ETag');

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
            syncStateReader.invalidate();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Data synced successfully' }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      } else if (req.method === 'GET') {
        try {
          const { content, etag } = syncStateReader.read();
          res.setHeader('Cache-Control', 'no-cache');
          if (etag) res.setHeader('ETag', etag);
          if (matchesEtag(req.headers['if-none-match'], etag)) {
            res.writeHead(304);
            res.end();
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }
    }

    // 2. API: Server Status & Dynamic Network IP Info (Real-Time Live Detection)
    if (pathname === '/api/status' || pathname === '/api/network-info') {
      const netInfo = getNetworkDetails(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ...netInfo,
          localIps: netInfo.allIps,
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
  const initialNet = getNetworkDetails();
  for (const ip of initialNet.allIps) {
    console.log(`  -> Akses LAN Petugas Gudang: http://${ip}:${ADMIN_PORT}/`);
  }
});
