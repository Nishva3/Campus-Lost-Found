const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

// Wait for DB
const waitForDB = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Auth service connected to PostgreSQL');
      return;
    } catch (e) {
      console.log(`Waiting for DB... (${i + 1}/10)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FECA57','#FF9FF3','#54A0FF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const result = await pool.query(
      'INSERT INTO users (name, email, password, department, phone, avatar_color) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, department, phone, avatar_color, role',
      [name, email, hashed, department || '', phone || '', color]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, department: user.department, avatar_color: user.avatar_color, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// VERIFY TOKEN
app.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (e) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// GET ALL USERS (Admin only)
app.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    const result = await pool.query('SELECT id, name, email, department, phone, avatar_color, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET PROFILE
app.get('/profile/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, department, phone, avatar_color, created_at FROM users WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// HEALTH
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'auth' }));

waitForDB().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`🔐 Auth service running on port ${process.env.PORT || 3001}`);
  });
});
