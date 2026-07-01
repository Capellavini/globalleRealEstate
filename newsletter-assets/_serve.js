const http = require('http')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MIME = { '.html': 'text/html', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.js': 'text/javascript' }

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  const filePath = path.join(ROOT, urlPath === '/' ? '/newsletter-assets/index.html' : urlPath)
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
}).listen(4173, () => console.log('newsletter-assets server on http://localhost:4173'))
