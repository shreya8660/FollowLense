import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'followlens-super-secret-jwt-key-2026';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-file database helper
interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    instagramHandle?: string;
    createdAt: string;
  }>;
  snapshots: Array<{
    id: string;
    userId: string;
    label: string;
    timestamp: number;
    followers: Array<any>;
    following: Array<any>;
    stats: any;
  }>;
  whitelists: Record<string, Array<{ username: string; notes?: string; addedAt: number }>>;
}

function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: [
        {
          id: 'demo-user-1',
          email: 'demo@followlens.io',
          passwordHash: bcrypt.hashSync('demo1234', 10),
          name: 'Alex Vance',
          instagramHandle: 'alex.creator',
          createdAt: new Date().toISOString(),
        },
      ],
      snapshots: [],
      whitelists: {
        'demo-user-1': [
          { username: 'natgeo', notes: 'Verified Brand', addedAt: Date.now() },
          { username: 'mkbhd', notes: 'Tech Creator', addedAt: Date.now() },
          { username: 'austin_kleon', notes: 'Author Inspiration', addedAt: Date.now() },
          { username: 'archdigest', notes: 'Design publication', addedAt: Date.now() },
          { username: 'theverge', notes: 'Tech Media', addedAt: Date.now() },
        ],
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, returning default fallback', err);
    return { users: [], snapshots: [], whitelists: {} };
  }
}

function saveDatabase(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth Middleware
interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token, allow as guest or reject depending on route
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ----------------- API ROUTES ----------------- //

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, instagramHandle } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const db = getDatabase();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase().trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    name: name.trim(),
    instagramHandle: (instagramHandle || '').replace(/^@/, '').trim(),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.whitelists[newUser.id] = [];
  saveDatabase(db);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      instagramHandle: newUser.instagramHandle,
      createdAt: newUser.createdAt,
    },
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      instagramHandle: user.instagramHandle,
      createdAt: user.createdAt,
    },
  });
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      instagramHandle: user.instagramHandle,
      createdAt: user.createdAt,
    },
  });
});

// Get User's Snapshots
app.get('/api/snapshots', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let userId = 'guest';
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {
      // Ignore token error, treat as guest
    }
  }

  const db = getDatabase();
  const snapshots = db.snapshots.filter((s) => s.userId === userId);
  res.json({ snapshots });
});

// Create New Snapshot
app.post('/api/snapshots', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let userId = 'guest';
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {
      // guest fallback
    }
  }

  const { label, followers, following, stats, timestamp } = req.body;

  if (!followers || !following) {
    return res.status(400).json({ error: 'Followers and following data are required' });
  }

  const db = getDatabase();
  const newSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    label: label || `Snapshot ${new Date().toLocaleDateString()}`,
    timestamp: timestamp || Date.now(),
    followers,
    following,
    stats,
  };

  db.snapshots.unshift(newSnapshot);
  saveDatabase(db);

  res.status(201).json({ snapshot: newSnapshot });
});

// Delete Snapshot
app.delete('/api/snapshots/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const initialCount = db.snapshots.length;
  db.snapshots = db.snapshots.filter((s) => s.id !== id);

  if (db.snapshots.length !== initialCount) {
    saveDatabase(db);
    return res.json({ success: true });
  }

  res.status(404).json({ error: 'Snapshot not found' });
});

// Get Whitelist for current user
app.get('/api/whitelist', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let userId = 'guest';
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {
      // guest
    }
  }

  const db = getDatabase();
  const list = db.whitelists[userId] || db.whitelists['demo-user-1'] || [];
  res.json({ whitelist: list });
});

// Toggle Whitelist item
app.post('/api/whitelist/toggle', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let userId = 'guest';
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {
      // guest
    }
  }

  const { username, notes } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const clean = username.toLowerCase().replace(/^@/, '').trim();
  const db = getDatabase();
  if (!db.whitelists[userId]) {
    db.whitelists[userId] = [];
  }

  const idx = db.whitelists[userId].findIndex((item) => item.username === clean);
  let isWhitelisted = false;

  if (idx >= 0) {
    db.whitelists[userId].splice(idx, 1);
    isWhitelisted = false;
  } else {
    db.whitelists[userId].push({
      username: clean,
      notes: notes || 'Protected account',
      addedAt: Date.now(),
    });
    isWhitelisted = true;
  }

  saveDatabase(db);
  res.json({ success: true, isWhitelisted, username: clean, whitelist: db.whitelists[userId] });
});

// ----------------- VITE INTEGRATION ----------------- //
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Dynamic import vite for development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FollowLens] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FollowLens] Fatal error starting server:', err);
  process.exit(1);
});
