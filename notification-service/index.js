const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sendSMS } = require('./smsService');
const { sendEmail, templates } = require('./emailService');

const app = express();
app.use(express.json());
app.use(cors());

// Internal Admin Token for service-to-service calls
const JWT_SECRET = process.env.JWT_SECRET || 'campus_lf_secret_2024';
const adminToken = jwt.sign({ id: 'system', role: 'admin' }, JWT_SECRET);
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

// ─── NOTIFICATION SCHEMA ─────────────────────────────────────
const notifSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  type: { type: String, enum: ['claim_received', 'claim_approved', 'claim_rejected', 'item_matched', 'system'] },
  title: String,
  message: String,
  itemId: String,
  claimId: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notifSchema);

// ─── ACTIVEMQ CONSUMER ───────────────────────────────────────
const connectAndConsume = () => {
  try {
    const stompit = require('stompit');
    stompit.connect({
      host: 'activemq', port: 61613,
      connectHeaders: { host: '/', login: 'admin', passcode: 'admin' }
    }, (err, client) => {
      if (err) { console.log('ActiveMQ not ready, retrying...'); setTimeout(connectAndConsume, 5000); return; }
      console.log('✅ Notification service connected to ActiveMQ');

      // Subscribe to item.created
      client.subscribe({ destination: '/queue/item.created', ack: 'client-individual' }, async (err, msg) => {
        if (err) return;
        msg.readString('utf-8', async (err, body) => {
          if (err) return;
          try {
            const data = JSON.parse(body);
            await new Notification({
              userId: data.reportedBy?.id,
              userEmail: data.reportedBy?.email,
              type: 'system',
              title: '✅ Item Reported',
              message: `Your ${data.type} item "${data.title}" has been successfully posted.`,
              itemId: data.itemId
            }).save();
            
            // Case 2: If FOUND, notify all users via SMS
            if (data.type === 'found') {
              try {
                const usersRes = await axios.get('http://auth-service:3001/users', authHeaders);
                const users = usersRes.data || [];
                const msg = `Campus L&F Alert: New FOUND item reported - "${data.title}". Check the app if it's yours!`;
                
                // Process in chunks or asynchronously
                for (const u of users) {
                  if (String(u.id) !== String(data.reportedBy?.id)) {
                    if (u.phone) {
                      sendSMS(u.phone, msg);
                    }
                    if (u.email) {
                      sendEmail(u.email, 'Campus L&F Alert: New Item Found', templates.generalAlert('New Item Found', msg));
                    }
                  }
                }
              } catch (err) {
                console.error('Failed to send mass notifications:', err.message);
              }
            }

            client.ack(msg);
          } catch (e) { console.error('Error processing item.created', e); }
        });
      });

      // Subscribe to claim.submitted
      client.subscribe({ destination: '/queue/claim.submitted', ack: 'client-individual' }, async (err, msg) => {
        if (err) return;
        msg.readString('utf-8', async (err, body) => {
          if (err) return;
          try {
            const data = JSON.parse(body);
            // Notify the claimant they submitted a claim
            await new Notification({
              userId: data.claimant?.id,
              userEmail: data.claimant?.email,
              type: 'claim_received',
              title: '📋 Claim Submitted',
              message: `Your claim for item has been submitted and is pending review.`,
              itemId: data.itemId,
              claimId: data.claimId
            }).save();

            // Notify the item owner about the claim
            if (data.ownerId) {
              await new Notification({
                userId: data.ownerId,
                type: 'claim_received',
                title: '🔔 New Claim Received',
                message: `Someone has submitted a claim for your item: ${data.itemTitle}.`,
                itemId: data.itemId,
                claimId: data.claimId
              }).save();
            }

            // Case 1: If it's a claim on a LOST item, text/email the original reporter
            if (data.itemType === 'lost' && data.ownerId) {
              try {
                const profileRes = await axios.get(`http://auth-service:3001/profile/${data.ownerId}`, authHeaders);
                if (profileRes.data) {
                  const msg = `Campus L&F Alert: Good news! Someone has found your lost item "${data.itemTitle}". Please check your dashboard to review their claim.`;
                  if (profileRes.data.phone) {
                    sendSMS(profileRes.data.phone, msg);
                  }
                  if (profileRes.data.email) {
                    sendEmail(profileRes.data.email, 'Campus L&F Alert: Item Found!', templates.itemFound(data.itemTitle));
                  }
                }
              } catch (err) {
                console.error('Failed to send claim notifications:', err.message);
              }
            }

            client.ack(msg);
          } catch (e) { console.error('Error processing claim.submitted', e); }
        });
      });

      // Subscribe to claim.updated
      client.subscribe({ destination: '/queue/claim.updated', ack: 'client-individual' }, async (err, msg) => {
        if (err) return;
        msg.readString('utf-8', async (err, body) => {
          if (err) return;
          try {
            const data = JSON.parse(body);
            const type = data.status === 'approved' ? 'claim_approved' : 'claim_rejected';
            const emoji = data.status === 'approved' ? '🎉' : '❌';
            await new Notification({
              type,
              title: `${emoji} Claim ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
              message: `A claim has been ${data.status}.`,
              claimId: data.claimId
            }).save();
            client.ack(msg);
          } catch (e) {}
        });
      });
    });
  } catch (e) { console.log('stompit error, retrying...'); setTimeout(connectAndConsume, 5000); }
};

// ─── REST API ─────────────────────────────────────────────────

// Create notification (direct)
app.post('/notifications', async (req, res) => {
  try {
    const notif = new Notification(req.body);
    await notif.save();
    res.status(201).json(notif);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get notifications for user
app.get('/notifications/:userId', async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(notifs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all notifications (for demo/admin)
app.get('/notifications', async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(notifs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Mark as read
app.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notif);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Unread count
app.get('/notifications/:userId/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'notifications' }));

// ─── START ───────────────────────────────────────────────────
const start = async () => {
  let retries = 10;
  while (retries--) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Notification service connected to MongoDB');
      break;
    } catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  }
  setTimeout(connectAndConsume, 8000);
  app.listen(process.env.PORT || 3004, () => console.log(`🔔 Notification service running on port ${process.env.PORT || 3004}`));
};

start();
