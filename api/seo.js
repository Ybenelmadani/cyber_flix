// api/seo.js — Vercel Serverless Function / Express Handler for Server-Side SEO
const fs = require('fs');
const path = require('path');

const SITE_DEFAULT = 'https://cyber-flix-mu.vercel.app';
const TMDB_DEFAULT_KEY = 'f30db81270f4acbc6afa82d019c7406b';

const esc = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

let cachedTemplate = null;
function getTemplate() {
  if (cachedTemplate) return cachedTemplate;

  // In Vercel deployment, static build files are in current dir or __dirname
  const possiblePaths = [
    path.join(process.cwd(), 'build', 'index.html'),
    path.join(__dirname, '..', 'build', 'index.html'),
    path.join(__dirname, '..', 'public', 'index.html'),
    path.join(process.cwd(), 'public', 'index.html'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      cachedTemplate = fs.readFileSync(p, 'utf8');
      return cachedTemplate;
    }
  }

  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>CYBERFLIX</title></head><body><div id="root"></div></body></html>`;
}

async function fetchTmdb(endpoint, key) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `https://api.themoviedb.org/3${endpoint}${sep}api_key=${key}&language=ar`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CyberFlix-SEO/1.0' } });
  if (!res.ok) {
    const err = new Error(`TMDB HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function renderHtml({ title, description, image, url, jsonLd, notFound = false }) {
  const template = getTemplate();
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(name|property)="(description|keywords|og:[^"]*|twitter:[^"]*)"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '');

  const metaTags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(url)}">
    <meta property="og:site_name" content="CYBERFLIX">
    <meta property="og:type" content="video.movie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${esc(url)}">
    ${image ? `<meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="${esc(title)}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    ${image ? `<meta name="twitter:image" content="${esc(image)}">` : ''}
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}`;

  return html.replace('</head>', `${metaTags}\n</head>`);
}

let sitemapCache = { xml: '', at: 0 };

module.exports = async function handler(req, res) {
  const siteUrl = (process.env.SITE_URL || SITE_DEFAULT).replace(/\/+$/, '');
  const tmdbKey = process.env.TMDB_KEY || process.env.TMDB_API_KEY || TMDB_DEFAULT_KEY;

  // Resolve path from req.url or req.query
  const fullUrl = req.url || '';
  const pathname = fullUrl.split('?')[0];

  // 1. Robots.txt
  if (pathname === '/robots.txt') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
  }

  // 2. Sitemap.xml (cached 6 hours)
  if (pathname === '/sitemap.xml') {
    try {
      const now = Date.now();
      const SIX_HOURS = 6 * 3600 * 1000;

      if (!sitemapCache.xml || now - sitemapCache.at > SIX_HOURS) {
        const urls = [
          { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
        ];

        // Fetch first 4 pages of popular movies & series (approx 160 top titles)
        for (let p = 1; p <= 4; p++) {
          try {
            const [m, t] = await Promise.all([
              fetchTmdb(`/movie/popular?page=${p}`, tmdbKey),
              fetchTmdb(`/tv/popular?page=${p}`, tmdbKey),
            ]);
            (m.results || []).forEach((item) => {
              urls.push({
                loc: `${siteUrl}/film/${item.id}`,
                changefreq: 'weekly',
                priority: '0.8',
              });
            });
            (t.results || []).forEach((item) => {
              urls.push({
                loc: `${siteUrl}/serie/${item.id}`,
                changefreq: 'weekly',
                priority: '0.8',
              });
            });
          } catch (pageErr) {
            console.error(`Sitemap page ${p} error:`, pageErr.message);
          }
        }

        sitemapCache = {
          at: now,
          xml:
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            urls
              .map(
                (u) =>
                  `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
              )
              .join('\n') +
            `\n</urlset>`,
        };
      }

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).send(sitemapCache.xml);
    } catch (sitemapErr) {
      console.error('Sitemap fatal error:', sitemapErr);
      return res.status(500).send('Error generating sitemap');
    }
  }

  // 3. Movie or Series details route (/film/:id or /serie/:id or legacy /movie/:id or /tv/:id)
  const detailMatch = pathname.match(/^\/(film|serie|movie|tv)\/(\d+)/i);
  if (detailMatch) {
    const rawType = detailMatch[1].toLowerCase();
    const id = detailMatch[2];
    const isMovie = rawType === 'film' || rawType === 'movie';
    const canonicalPath = isMovie ? `/film/${id}` : `/serie/${id}`;

    try {
      const data = await fetchTmdb(`/${isMovie ? 'movie' : 'tv'}/${id}`, tmdbKey);
      const name = data.title || data.name || data.original_title || data.original_name || 'CYBERFLIX';
      const year = (data.release_date || data.first_air_date || '').slice(0, 4);
      const overview = (data.overview || `اكتشف تفاصيل وتقييم ${name} على CYBERFLIX`).trim();
      const shortDesc = overview.length > 155 ? `${overview.slice(0, 152)}...` : overview;
      const posterPath = data.poster_path || data.backdrop_path;
      const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w780${posterPath}` : '';
      const rating = data.vote_average ? Number(data.vote_average).toFixed(1) : null;
      const ratingCount = data.vote_count || null;

      const typePrefix = isMovie ? 'فيلم' : 'مسلسل';
      const title = `${typePrefix} ${name} ${year ? `(${year})` : ''} | CYBERFLIX`;

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': isMovie ? 'Movie' : 'TVSeries',
        name,
        description: overview,
        image: imageUrl || undefined,
        datePublished: data.release_date || data.first_air_date || undefined,
        genre: Array.isArray(data.genres) ? data.genres.map((g) => g.name) : undefined,
      };

      if (rating) {
        jsonLd.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: rating,
          bestRating: '10',
          ratingCount: ratingCount || 1,
        };
      }

      const html = renderHtml({
        title,
        description: shortDesc,
        image: imageUrl,
        url: `${siteUrl}${canonicalPath}`,
        jsonLd,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400');
      return res.status(200).send(html);
    } catch (err) {
      if (err.status === 404) {
        const notFoundHtml = renderHtml({
          title: '404 - المحتوى غير متوفر | CYBERFLIX',
          description: 'عذراً، هذا العنوان غير موجود أو تم حذفه من قاعدة البيانات.',
          image: '',
          url: `${siteUrl}${canonicalPath}`,
          notFound: true,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(notFoundHtml);
      }

      console.error('Error fetching TMDB detail:', err.message);
      // Fallback: send standard template with 200 so SPA can try client-side
      const fallbackHtml = getTemplate();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(fallbackHtml);
    }
  }

  // 4. Default fallback: serve base template
  const defaultHtml = getTemplate();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(defaultHtml);
};
