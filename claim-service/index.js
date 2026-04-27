const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Publish to ActiveMQ
let stompClient = null;
const connectActiveMQ = () => {
  try {
    const stompit = require('stompit');
    stompit.connect({
      host: 'activemq', port: 61613,
      connectHeaders: { host: '/', login: 'admin', passcode: 'admin' }
    }, (err, client) => {
      if (err) { setTimeout(connectActiveMQ, 5000); return; }
      stompClient = client;
      console.log('✅ Claim service connected to ActiveMQ');
    });
  } catch (e) {}
};

const publishEvent = (queue, data) => {
  if (!stompClient) return;
  try {
    const frame = stompClient.send({ destination: `/queue/${queue}`, 'content-type': 'application/json' });
    frame.write(JSON.stringify(data));
    frame.end();
  } catch (e) {}
};

// Submit a claim
app.post('/claims', auth, async (req, res) => {
  try {
    const { item_id, description } = req.body;
    if (!item_id || !description) return res.status(400).json({ error: 'Missing fields' });

    // Check for duplicate
    const dup = await pool.query('SELECT id FROM claims WHERE item_id=$1 AND claimant_id=$2', [item_id, req.user.id]);
    if (dup.rows.length) return res.status(409).json({ error: 'You already claimed this item' });

    const result = await pool.query(
      'INSERT INTO claims (item_id, claimant_id, claimant_name, claimant_email, description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [item_id, req.user.id, req.user.name, req.user.email, description]
    );
    const claim = result.rows[0];

    // Fetch item details
    let itemData = null;
    try {
      const itemRes = await axios.get(`http://item-service:3002/items/${item_id}`);
      itemData = itemRes.data;
    } catch (e) {
      console.error('Failed to fetch item details:', e.message);
    }

    // Notify item service to update claim count
    try {
      await axios.patch(`http://item-service:3002/items/${item_id}/claim-count`);
    } catch (e) {}

    // Notify notification service
    publishEvent('claim.submitted', {
      claimId: claim.id,
      itemId: item_id,
      itemType: itemData?.type,
      itemTitle: itemData?.title,
      ownerId: itemData?.reportedBy?.id,
      claimant: { id: req.user.id, name: req.user.name, email: req.user.email },
      description
    });

    res.status(201).json(claim);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get claims for an item
app.get('/claims/item/:itemId', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM claims WHERE item_id=$1 ORDER BY created_at DESC', [req.params.itemId]);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: Get all claims
app.get('/claims', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const result = await pool.query('SELECT * FROM claims ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get my claims
app.get('/claims/my', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM claims WHERE claimant_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update claim status (owner approves/rejects)
app.patch('/claims/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const result = await pool.query(
      'UPDATE claims SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Claim not found' });
    publishEvent('claim.updated', { claimId: req.params.id, itemId: result.rows[0].item_id, status, updatedBy: req.user.id });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Stats
app.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected
      FROM claims
    `);
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'claims' }));

const waitForDB = async () => {
  for (let i = 0; i < 10; i++) {
    try { await pool.query('SELECT 1'); console.log('✅ Claim service connected to PostgreSQL'); return; }
    catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  }
};

waitForDB().then(() => {
  setTimeout(connectActiveMQ, 5000);
  app.listen(process.env.PORT || 3003, () => console.log(`📋 Claim service running on port ${process.env.PORT || 3003}`));
});
