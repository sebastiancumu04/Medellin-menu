#!/usr/bin/env node
/* Servidor estático para previsualizar las cartas.
   Sin dependencias. Soporta Range (206), que es lo que necesita el scrub
   de video.currentTime y lo que Safari iOS exige para reproducir.

   Uso:  node serve.js [puerto]        (por defecto 4321)
*/
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 4321);

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',   '.json':'application/json; charset=utf-8',
  '.mp4':'video/mp4', '.webm':'video/webm',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp',
  '.svg':'image/svg+xml','.ico':'image/x-icon',
  '.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'
};

const CARTAS = ['boro','chagra','egeo','cannario','ocio'];

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); }
  catch { res.writeHead(400); return res.end('URL invalida'); }

  /* índice de la raíz: si existe index.html propio se sirve ese */
  if ((p === '/' || p === '/index.html') && !fs.existsSync(path.join(ROOT,'index.html'))) {
    const html = '<!doctype html><meta charset="utf-8"><title>Cartas SYNCRA</title>' +
      '<style>body{font:16px/1.7 -apple-system,sans-serif;background:#111;color:#eee;' +
      'display:grid;place-content:center;min-height:100vh;gap:.4rem}' +
      'a{color:#eee}h1{font-size:1rem;letter-spacing:.3em;text-transform:uppercase;opacity:.5;margin:0 0 1rem}</style>' +
      '<h1>Cartas SYNCRA</h1>' +
      CARTAS.map(c => `<a href="/${c}/">/${c}/</a>`).join('');
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    return res.end(html);
  }

  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('403'); }

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('404 ' + p); }

    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const cache = /\.(woff2?|ttf|png|jpe?g|webp|svg|mp4|webm)$/i.test(file)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache';
    const range = req.headers.range;

    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        let start = m[1] ? parseInt(m[1], 10) : 0;
        let end   = m[2] ? parseInt(m[2], 10) : st.size - 1;
        if (isNaN(start) || start < 0) start = 0;
        if (isNaN(end) || end >= st.size) end = st.size - 1;
        if (start > end) {
          res.writeHead(416, {'Content-Range': `bytes */${st.size}`});
          return res.end();
        }
        res.writeHead(206, {
          'Content-Type': type,
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${st.size}`,
          'Content-Length': end - start + 1,
          'Cache-Control': cache
        });
        return fs.createReadStream(file, {start, end}).pipe(res);
      }
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': st.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': cache
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`\n  Cartas SYNCRA en  http://localhost:${PORT}\n`);
  CARTAS.forEach(c => console.log(`    http://localhost:${PORT}/${c}/`));
  console.log('');
});
