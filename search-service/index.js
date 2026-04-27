const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Reuse Item model (read-only access to same MongoDB)
const itemSchema = new mongoose.Schema({
  _id: String,
  title: String,
  description: String,
  category: String,
  type: String,
  location: String,
  status: String,
  reportedBy: { id: String, name: String, email: String },
  image: String,
  tags: [String],
  claimCount: Number
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

// Full-text search
app.get('/search', async (req, res) => {
  try {
    const { q, type, category, location, dateFrom, dateTo, sortBy = 'createdAt', order = 'desc' } = req.query;
    const filter = { status: 'active' };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ];
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    const sortOrder = order === 'asc' ? 1 : -1;
    const items = await Item.find(filter).sort({ [sortBy]: sortOrder }).limit(100);
    res.json({ results: items, count: items.length, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Suggestions / autocomplete
app.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const items = await Item.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    }).select('title category type').limit(10);
    const suggestions = [...new Set(items.map(i => i.title))];
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Trending / recent
app.get('/trending', async (req, res) => {
  try {
    const trending = await Item.find({ status: 'active' }).sort({ claimCount: -1, createdAt: -1 }).limit(5);
    res.json(trending);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Locations list
app.get('/locations', async (req, res) => {
  try {
    const locations = await Item.distinct('location');
    res.json(locations.filter(Boolean));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'search' }));

const start = async () => {
  let retries = 10;
  while (retries--) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Search service connected to MongoDB');
      break;
    } catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  }
  app.listen(process.env.PORT || 3005, () => console.log(`🔍 Search service running on port ${process.env.PORT || 3005}`));
};

start();
