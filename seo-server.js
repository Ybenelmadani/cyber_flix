// seo-server.js — Standalone Express Server for SEO / Local development / Render / Railway
const express = require('express');
const path = require('path');
const seoHandler = require('./api/seo');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'build');

// Serve static assets first
app.use('/static', express.static(path.join(DIST, 'static'), { maxAge: '1y', immutable: true }));
app.use(express.static(DIST, { index: false }));

// Route SEO endpoints through handler
app.get(['/robots.txt', '/sitemap.xml', '/film/:id', '/serie/:id', '/movie/:id', '/tv/:id'], async (req, res) => {
  return seoHandler(req, res);
});

// Any other route serves index.html for client-side routing
app.get('*', (req, res) => {
  return seoHandler(req, res);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CYBERFLIX SEO server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
