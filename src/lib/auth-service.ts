import crypto from 'crypto';
import { getDb } from './db';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  role: 'user' | 'translator' | 'admin';
  coins?: number;
  subscription_status?: string;
  created_at: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, originalHash] = combined.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const origBuf = Buffer.from(originalHash, 'hex');
    if (hashBuf.length !== origBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, origBuf);
  } catch {
    return false;
  }
}

export function ensureAuthTables(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT '/animeko-logo.jpg',
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  // Check if google_id, coins, subscription_status columns exist
  try {
    const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    if (!cols.some((c) => c.name === 'google_id')) {
      db.exec("ALTER TABLE users ADD COLUMN google_id TEXT;");
    }
    if (!cols.some((c) => c.name === 'coins')) {
      db.exec("ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0;");
    }
    if (!cols.some((c) => c.name === 'subscription_status')) {
      db.exec("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';");
    }
  } catch {
    // ignore
  }

  // Create default admin user if not exists
  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
  if (!adminExists) {
    const defaultHash = hashPassword('admin123');
    db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', 'admin@animeko.uz', defaultHash, 'admin');
  }
}

export function registerUser(username: string, email: string, password: string): { user?: User; error?: string } {
  ensureAuthTables();
  const db = getDb();

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  // Validate username
  if (cleanUsername.length < 3) {
    return { error: "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { error: "Foydalanuvchi nomi faqat harflar, raqamlar va pastki chiziqdan iborat bo'lishi mumkin" };
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: "Yaroqli email manzilini kiriting" };
  }

  // Validate password
  if (password.length < 6) {
    return { error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" };
  }

  // Check if exists
  const existingUser = db.prepare("SELECT username, email FROM users WHERE username = ? OR email = ?").get(cleanUsername, cleanEmail) as { username: string; email: string } | undefined;
  if (existingUser) {
    if (existingUser.username === cleanUsername) {
      return { error: "Ushbu foydalanuvchi nomi allaqachon band" };
    }
    return { error: "Ushbu email manzil allaqachon ro'yxatdan o'tgan" };
  }

  const password_hash = hashPassword(password);
  const info = db.prepare(`
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, 'user')
  `).run(cleanUsername, cleanEmail, password_hash);

  const newUser = db.prepare(`
    SELECT id, username, email, avatar_url, role, created_at 
    FROM users 
    WHERE id = ?
  `).get(info.lastInsertRowid) as User;

  return { user: newUser };
}

export function authenticateUser(login: string, password: string): { user?: User; error?: string } {
  ensureAuthTables();
  const db = getDb();

  const cleanLogin = login.trim().toLowerCase();
  const row = db.prepare(`
    SELECT id, username, email, password_hash, avatar_url, role, coins, subscription_status, created_at 
    FROM users 
    WHERE username = ? OR email = ?
  `).get(cleanLogin, cleanLogin) as (User & { password_hash: string }) | undefined;

  if (!row) {
    return { error: "Foydalanuvchi nomi yoki parol noto'g'ri" };
  }

  const isValid = verifyPassword(password, row.password_hash);
  if (!isValid) {
    return { error: "Foydalanuvchi nomi yoki parol noto'g'ri" };
  }

  const user: User = {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar_url: row.avatar_url,
    role: row.role,
    coins: row.coins || 0,
    subscription_status: row.subscription_status || 'free',
    created_at: row.created_at
  };

  return { user };
}

export function createSession(userId: number): string {
  ensureAuthTables();
  const db = getDb();
  const sessionId = crypto.randomUUID();
  // 30 days session
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(sessionId, userId, expiresAt);

  return sessionId;
}

export function validateSession(sessionId: string): User | null {
  if (!sessionId) return null;
  ensureAuthTables();
  const db = getDb();

  const row = db.prepare(`
    SELECT u.id, u.username, u.email, u.avatar_url, u.role, u.coins, u.subscription_status, u.created_at, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(sessionId) as (User & { expires_at: string }) | undefined;

  if (!row) return null;

  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar_url: row.avatar_url,
    role: row.role,
    coins: row.coins || 0,
    subscription_status: row.subscription_status || 'free',
    created_at: row.created_at
  };
}

export function deleteSession(sessionId: string): void {
  ensureAuthTables();
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function loginOrRegisterGoogleUser(data: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}): { user: User; sessionId: string } {
  ensureAuthTables();
  const db = getDb();

  const cleanEmail = data.email.trim().toLowerCase();

  // 1. Check if user with this email or google_id exists
  let row = db.prepare("SELECT id, username, email, avatar_url, role, created_at FROM users WHERE google_id = ? OR email = ?").get(data.googleId, cleanEmail) as User | undefined;

  if (row) {
    db.prepare("UPDATE users SET google_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?").run(data.googleId, data.avatarUrl || null, row.id);
    row = db.prepare("SELECT id, username, email, avatar_url, role, created_at FROM users WHERE id = ?").get(row.id) as User;
  } else {
    // 2. Generate a unique username based on name or email
    let baseUsername = (data.name || cleanEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 15);

    if (baseUsername.length < 3) baseUsername = 'google_user';

    let uniqueUsername = baseUsername;
    let counter = 1;
    while (db.prepare("SELECT id FROM users WHERE username = ?").get(uniqueUsername)) {
      uniqueUsername = `${baseUsername}_${counter++}`;
    }

    const randomPasswordHash = hashPassword(crypto.randomUUID());
    const info = db.prepare(`
      INSERT INTO users (username, email, password_hash, avatar_url, role, google_id)
      VALUES (?, ?, ?, ?, 'user', ?)
    `).run(uniqueUsername, cleanEmail, randomPasswordHash, data.avatarUrl || '/animeko-logo.jpg', data.googleId);

    row = db.prepare("SELECT id, username, email, avatar_url, role, created_at FROM users WHERE id = ?").get(info.lastInsertRowid) as User;
  }

  const sessionId = createSession(row.id);
  return { user: row, sessionId };
}

export function addCoinsToUser(userId: number, amount: number): { success: boolean; coins?: number; error?: string } {
  ensureAuthTables();
  const db = getDb();
  db.prepare("UPDATE users SET coins = COALESCE(coins, 0) + ? WHERE id = ?").run(amount, userId);
  const row = db.prepare("SELECT coins FROM users WHERE id = ?").get(userId) as { coins: number } | undefined;
  return { success: true, coins: row?.coins || 0 };
}

export function updateUserSubscription(userId: number, plan: string): { success: boolean; subscription?: string } {
  ensureAuthTables();
  const db = getDb();
  db.prepare("UPDATE users SET subscription_status = ? WHERE id = ?").run(plan, userId);
  return { success: true, subscription: plan };
}

export function updateUserPassword(userId: number, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
  ensureAuthTables();
  const db = getDb();

  const user = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as { password_hash: string } | undefined;
  if (!user) return { success: false, error: "Foydalanuvchi topilmadi" };

  if (!verifyPassword(oldPassword, user.password_hash)) {
    return { success: false, error: "Joriy parol noto'g'ri" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" };
  }

  const newHash = hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, userId);
  return { success: true };
}
