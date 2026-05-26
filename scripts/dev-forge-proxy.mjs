/**
 * Dev-only HTTP proxy: Android emulator -> PC (10.0.2.2) -> https://uto.on-forge.com
 *
 * Some emulators fail React Native fetch() to external HTTPS while Chrome still works.
 * Run alongside Metro: npm run dev:proxy
 */
import http from 'node:http';
import https from 'node:https';

const PORT = Number(process.env.SAMSON_PROXY_PORT || 8787);
const TARGET_HOST = process.env.SAMSON_PROXY_TARGET || 'uto.on-forge.com';

const server = http.createServer((req, res) => {
  const path = req.url || '/';
  const headers = { ...req.headers, host: TARGET_HOST };
  delete headers['accept-encoding'];

  const upstream = https.request(
    {
      hostname: TARGET_HOST,
      port: 443,
      path,
      method: req.method,
      headers,
    },
    upstreamRes => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );

  upstream.on('error', error => {
    console.error('[dev:proxy] upstream error', error.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end(`Proxy error: ${error.message}`);
  });

  req.pipe(upstream);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[SAMSON dev proxy] http://127.0.0.1:${PORT} -> https://${TARGET_HOST}`,
  );
  console.log('[SAMSON dev proxy] Emulator URL: http://10.0.2.2:' + PORT);
});
