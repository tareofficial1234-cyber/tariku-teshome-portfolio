require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { query, pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '30kb' }));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'unavailable', message: err.message });
  }
});

app.get('/api/projects', async (_req, res) => {
  try {
    const result = await query(
      'SELECT id, title, category, description, tech, link, featured FROM projects ORDER BY featured DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Projects API:', err.message);
    res.status(500).json({ error: 'Unable to load projects. Check database configuration.' });
  }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject = '', message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required.' });
  if (String(name).length > 100 || String(email).length > 180 || String(subject).length > 180 || String(message).length > 4000) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(email))) return res.status(400).json({ error: 'Please enter a valid email address.' });
  try {
    await query(
      'INSERT INTO messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [String(name).trim(), String(email).trim(), String(subject).trim(), String(message).trim()]
    );
    res.status(201).json({ message: 'Thanks! Your message has been received.' });
  } catch (err) {
    console.error('Contact API:', err.message);
    res.status(500).json({ error: 'Message could not be saved. Please try again later.' });
  }
});

// Simple private admin API. Keep ADMIN_API_KEY secret; never put it in frontend code.
function requireAdmin(req, res, next) {
  const key = req.get('x-admin-key');
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

app.get('/api/admin/messages', requireAdmin, async (_req, res) => {
  try {
    const result = await query('SELECT id, name, email, subject, message, created_at FROM messages ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load messages.' });
  }
});

app.post('/api/admin/projects', requireAdmin, async (req, res) => {
  const { title, category, description, tech = [], link = '', featured = false } = req.body || {};
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
  try {
    const result = await query(
      `INSERT INTO projects (title, category, description, tech, link, featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, category, description, tech, link, featured`,
      [String(title).slice(0,140), String(category || 'Development').slice(0,80), String(description),
       Array.isArray(tech) ? tech.map(x => String(x).slice(0,40)).slice(0,12) : [],
       String(link).slice(0,500), Boolean(featured)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Admin project API:', err.message);
    res.status(500).json({ error: 'Unable to create project.' });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid project ID.' });
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete project.' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

app.listen(PORT, () => console.log(`Tariku Teshome portfolio running on port ${PORT}`));

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});