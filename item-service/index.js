const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ─── MONGOOSE SCHEMA ─────────────────────────────────────────
const itemSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['electronics', 'clothing', 'books', 'accessories', 'documents', 'sports', 'keys', 'bags', 'other'], default: 'other' },
  type: { type: String, enum: ['lost', 'found'], required: true },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'claimed', 'resolved'], default: 'active' },
  reportedBy: {
    id: String,
    name: String,
    email: String
  },
  image: { type: String, default: null },
  tags: [String],
  claimCount: { type: Number, default: 0 }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

// ─── MIDDLEWARE ──────────────────────────────────────────────
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

// ─── ACTIVEMQ PUBLISHER ──────────────────────────────────────
let stompClient = null;
const connectActiveMQ = () => {
  try {
    const stompit = require('stompit');
    const connectOptions = {
      host: 'activemq',
      port: 61613,
      connectHeaders: {
        host: '/',
        login: 'admin',
        passcode: 'admin',
        'heart-beat': '5000,5000'
      }
    };
    stompit.connect(connectOptions, (err, client) => {
      if (err) {
        console.log('ActiveMQ not ready, will retry...');
        setTimeout(connectActiveMQ, 5000);
        return;
      }
      stompClient = client;
      console.log('✅ Item service connected to ActiveMQ');

      // Subscribe to claim.updated
      client.subscribe({ destination: '/queue/claim.updated', ack: 'client-individual' }, async (err, msg) => {
        if (err) return;
        msg.readString('utf-8', async (err, body) => {
          if (err) return;
          try {
            const data = JSON.parse(body);
            if (data.status === 'approved' && data.itemId) {
              await Item.findByIdAndUpdate(data.itemId, { status: 'resolved' });
            }
            client.ack(msg);
          } catch (e) {
            console.error('Error processing claim.updated in item-service:', e);
          }
        });
      });
    });
  } catch (e) {
    console.log('stompit not available, continuing without ActiveMQ');
  }
};

const publishEvent = (queue, data) => {
  if (!stompClient) return;
  try {
    const headers = { destination: `/queue/${queue}`, 'content-type': 'application/json' };
    const frame = stompClient.send(headers);
    frame.write(JSON.stringify(data));
    frame.end();
  } catch (e) {
    console.log('Failed to publish event:', e.message);
  }
};

// ─── ROUTES ──────────────────────────────────────────────────

// Create item
app.post('/items', auth, async (req, res) => {
  try {
    const { title, description, category, type, location, image, tags } = req.body;
    const item = new Item({
      title, description, category, type, location, image,
      tags: tags || [],
      reportedBy: { id: req.user.id, name: req.user.name, email: req.user.email }
    });
    await item.save();
    publishEvent('item.created', { itemId: item._id, type, title, reportedBy: req.user });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all items with filters
app.get('/items', async (req, res) => {
  try {
    const { type, category, status, search, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Item.countDocuments(filter)
    ]);
    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single item
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update item
app.put('/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.reportedBy.id !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    publishEvent('item.updated', { itemId: updated._id, status: updated.status });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete item
app.delete('/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.reportedBy.id !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// My items
app.get('/my-items', auth, async (req, res) => {
  try {
    const items = await Item.find({ 'reportedBy.id': String(req.user.id) }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update claim count (called by claim-service)
app.patch('/items/:id/claim-count', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { claimCount: 1 } }, { new: true });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Stats
app.get('/stats', async (req, res) => {
  try {
    const [total, lost, found, resolved] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost', status: 'active' }),
      Item.countDocuments({ type: 'found', status: 'active' }),
      Item.countDocuments({ status: 'resolved' })
    ]);
    const categories = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ total, lost, found, resolved, categories });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'items' }));

// ─── START ───────────────────────────────────────────────────
const start = async () => {
  let retries = 10;
  while (retries--) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Item service connected to MongoDB');
      break;
    } catch (e) {
      console.log(`MongoDB not ready... (${10 - retries}/10)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  setTimeout(connectActiveMQ, 5000);
  app.listen(process.env.PORT || 3002, () => {
    console.log(`📦 Item service running on port ${process.env.PORT || 3002}`);
  });
};

start();
