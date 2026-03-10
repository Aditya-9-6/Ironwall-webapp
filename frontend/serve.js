/**
 * IronWall+ Cross-Device Web Server
 * ====================================
 * Serves all frontend files on your LAN so phones & tablets can join.
 * - Binds to 0.0.0.0 (all network interfaces)
 * - Proxies WebSocket /ws  →  Rust backend at port 9001
 * - CORS headers for cross-origin requests
 * - Prints LAN IP + join URL at startup
 */

const http = require('http');
const net = require('net');
const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const WS_PORT = 9001;   // Rust backend WebSocket port

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.wasm': 'application/wasm',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
};

// ── Detect LAN IP ─────────────────────────────────────────────────────────
function getLanIP() {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const LAN_IP = getLanIP();

// ── HTTP Static File Server ────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    // CORS headers — allow any device to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    let urlPath = req.url.split('?')[0];
    let targetPath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);

    const sendFile = (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT' && !filePath.endsWith('.html')) {
                    return sendFile(filePath + '.html');
                }
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`[IronWall] 404 - File Not Found: ${urlPath}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    };

    sendFile(targetPath);
});

// ── WebSocket Proxy ────────────────────────────────────────────────────────
// Transparently tunnels WS upgrades from browser → Rust backend
server.on('upgrade', (req, clientSocket, head) => {
    const backendSocket = net.connect(WS_PORT, '127.0.0.1', () => {
        // Forward the original HTTP upgrade request headers to the backend
        backendSocket.write(
            `GET ${req.url} HTTP/1.1\r\n` +
            Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
            '\r\n\r\n'
        );
    });

    backendSocket.on('error', () => {
        clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        clientSocket.destroy();
    });

    if (head && head.length) backendSocket.write(head);
    clientSocket.pipe(backendSocket);
    backendSocket.pipe(clientSocket);

    clientSocket.on('error', () => backendSocket.destroy());
    backendSocket.on('close', () => clientSocket.destroy());
    clientSocket.on('close', () => backendSocket.destroy());
});

// ── Join Code System ───────────────────────────────────────────────────────
// Generates a 4-digit code and saves the LAN IP to ntfy.sh (a free pubsub service)
// so the mobile app can discover the IP automatically without typing.
const crypto = require('crypto');
const https = require('https');

const JOIN_CODE = Math.floor(1000 + Math.random() * 9000).toString(); // e.g. "4921"
const BUCKET_ID = "ironwall-gamethon-2026-" + JOIN_CODE;

function registerJoinCode() {
    const payload = `${LAN_IP}:${PORT}`;

    // Using ntfy.sh for highly reliable temporary pubsub message caching
    const req = https.request({
        hostname: 'ntfy.sh',
        path: `/${BUCKET_ID}`,
        method: 'POST',
        headers: {
            'Title': 'IP',     // Help the frontend parse it easily
            'Cache': 'yes',    // Ask server to hold the IP in cache
            'Content-Type': 'text/plain',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`  \x1b[35m\x1b[1m🔑  Lobby Join Code: \x1b[32m${JOIN_CODE}\x1b[0m\x1b[35m (Synced to Cloud)\x1b[0m`);
            console.log(`      Enter this 4-digit code on the Mobile App to connect.`);
            console.log('');
        }
    });

    req.on('error', () => {
        console.log(`  \x1b[31m[!] Failed to sync Join Code to cloud. Manual IP entry required on phones.\x1b[0m`);
        console.log('');
    });

    req.write(payload);
    req.end();
}


// ── Startup ────────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
    const CYAN = '\x1b[36m';
    const GREEN = '\x1b[32m';
    const YELLOW = '\x1b[33m';
    const BOLD = '\x1b[1m';
    const RESET = '\x1b[0m';
    const RED = '\x1b[31m';
    const MAGENTA = '\x1b[35m';

    console.log('');
    console.log(`${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║       ⚡  IRONWALL+  WEB SERVER  ONLINE  ⚡           ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}`);
    console.log('');
    console.log(`  ${GREEN}${BOLD}🖥  Desktop (this machine):${RESET}`);
    console.log(`      ${BOLD}http://localhost:${PORT}/${RESET}`);
    console.log('');

    // Register IP to cloud for APK discovery
    registerJoinCode();

    console.log(`  ${YELLOW}${BOLD}📱  Phone / Tablet (Direct Local Link):${RESET}`);
    console.log(`      ${BOLD}${YELLOW}http://${LAN_IP}:${PORT}/lobby.html${RESET}`);
    console.log('');
    console.log(`  ${CYAN}🔌  WebSocket proxy: :${PORT}/ws  →  localhost:${WS_PORT}/ws${RESET}`);
    console.log('');
});
