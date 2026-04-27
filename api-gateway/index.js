const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const ITEM_URL = process.env.ITEM_SERVICE_URL || 'http://item-service:3002';
const CLAIM_URL = process.env.CLAIM_SERVICE_URL || 'http://claim-service:3003';
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';
const SEARCH_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:3005';

const authProxy = createProxyMiddleware({ target: AUTH_URL, changeOrigin: true, pathRewrite: { '^/api/auth': '' }, on: { error: (e,q,r) => r.status(502).json({ error: 'Auth unavailable' }) } });
const itemProxy = createProxyMiddleware({ target: ITEM_URL, changeOrigin: true, pathRewrite: { '^/api/items': '' }, on: { error: (e,q,r) => r.status(502).json({ error: 'Items unavailable' }) } });
const claimProxy = createProxyMiddleware({ target: CLAIM_URL, changeOrigin: true, pathRewrite: { '^/api/claims': '' }, on: { error: (e,q,r) => r.status(502).json({ error: 'Claims unavailable' }) } });
const notifProxy = createProxyMiddleware({ target: NOTIF_URL, changeOrigin: true, pathRewrite: { '^/api/notifications': '' }, on: { error: (e,q,r) => r.status(502).json({ error: 'Notif unavailable' }) } });
const searchProxy = createProxyMiddleware({ target: SEARCH_URL, changeOrigin: true, pathRewrite: { '^/api/search': '' }, on: { error: (e,q,r) => r.status(502).json({ error: 'Search unavailable' }) } });

app.use('/api/auth', authProxy);
app.use('/api/items', itemProxy);
app.use('/api/claims', claimProxy);
app.use('/api/notifications', notifProxy);
app.use('/api/search', searchProxy);

app.get('/health', (req, res) => res.json({ gateway: 'ok' }));
app.listen(process.env.PORT || 4000, () => console.log(`🚀 API Gateway running on port ${process.env.PORT || 4000}`));