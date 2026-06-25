require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id               TEXT PRIMARY KEY,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      submitter_name   TEXT NOT NULL,
      department       TEXT NOT NULL,
      cafe             TEXT NOT NULL,
      region           TEXT NOT NULL,
      escalation_label TEXT NOT NULL,
      escalation_hours INTEGER NOT NULL,
      comments         TEXT,
      completed        BOOLEAN NOT NULL DEFAULT FALSE,
      completed_by     TEXT,
      completed_at     TIMESTAMPTZ
    );
  `);
  console.log('Database ready');
}

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows.map(mapRow));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { id, createdAt, submitterName, department, cafe, region, escalationLabel, escalationHours, comments } = req.body;
  if (!id || !submitterName || !department || !cafe || !escalationHours) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO tasks (id, created_at, submitter_name, department, cafe, region, escalation_label, escalation_hours, comments)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, createdAt || new Date(), submitterName, department, cafe, region, escalationLabel, escalationHours, comments || '']
    );
    res.status(201).json(mapRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id/complete', async (req, res) => {
  const { completedBy } = req.body;
  const { id } = req.params;
  if (!completedBy) return res.status(400).json({ error: 'completedBy is required' });
  try {
    const result = await pool.query(
      `UPDATE tasks SET completed = TRUE, completed_by = $1, completed_at = NOW() WHERE id = $2 RETURNING *`,
      [completedBy, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

function mapRow(row) {
  return {
    id: row.id, createdAt: row.created_at, submitterName: row.submitter_name,
    department: row.department, cafe: row.cafe, region: row.region,
    escalationLabel: row.escalation_label, escalationHours: row.escalation_hours,
    comments: row.comments || '', completed: row.completed,
    completedBy: row.completed_by || '', completedAt: row.completed_at || '',
  };
}

initDB().then(() => {
  app.listen(PORT, () => console.log(`Bootlegger Task Tracker running on port ${PORT}`));
}).catch(err => { console.error('Database init failed:', err); process.exit(1); });
