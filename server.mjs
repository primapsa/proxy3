
// server.mjs
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const customHeaderMiddleware = createProxyMiddleware({
    target: 'https://api.themoviedb.org', // целевой сервер
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Добавление кастомного заголовка
        proxyReq.setHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMThlZjVjOTFjNDkzNDA5NGY2ZTk3YzUzNDEwYjQ1MyIsInN1YiI6IjY2M2Y5NmVjMTMyNzIxZjUxODIxMGJjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MHRIcWru0tXRfowkGqX1dJnfJoTCMAnKn3WDWY5ilYQ');
    },
});

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);

        if (parsedUrl.pathname.startsWith('/api')) {
            // Проксируем все запросы, начинающиеся с /api
            customHeaderMiddleware(req, res, (err) => {
                if (err) {
                    console.error('Proxy error:', err);
                    res.statusCode = 500;
                    res.end('Proxy error');
                }
            });
        } else {
            handle(req, res, parsedUrl);
        }
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});

