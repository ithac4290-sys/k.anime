import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const IS_SERVERLESS = !!(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL);

function getDatabasePath(): string {
  const defaultDir = path.join(process.cwd(), 'data');
  const defaultPath = path.join(defaultDir, 'mangauz.db');

  if (IS_SERVERLESS) {
    const tmpPath = path.join('/tmp', 'mangauz.db');
    if (!fs.existsSync(tmpPath)) {
      if (fs.existsSync(defaultPath)) {
        try {
          fs.copyFileSync(defaultPath, tmpPath);
        } catch (e) {
          console.error('Failed to copy database to /tmp:', e);
        }
      }
    }
    return tmpPath;
  }

  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return defaultPath;
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDatabasePath();
    dbInstance = new Database(dbPath);
    try {
      dbInstance.pragma('journal_mode = WAL');
    } catch {
      // ignore WAL error on read-only environments
    }
    initTables(dbInstance);
    seedInitialData(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS manga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      original_title TEXT,
      description TEXT,
      cover_url TEXT NOT NULL,
      author TEXT,
      artist TEXT,
      status TEXT DEFAULT 'ongoing',
      type TEXT DEFAULT 'manga',
      release_year INTEGER,
      views INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.8,
      rating_count INTEGER DEFAULT 1,
      schedule_day TEXT DEFAULT 'Dushanba',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manga_genres (
      manga_id INTEGER,
      genre_id INTEGER,
      PRIMARY KEY (manga_id, genre_id),
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manga_id INTEGER NOT NULL,
      chapter_number REAL NOT NULL,
      title TEXT,
      volume INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chapter_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manga_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_manga_slug ON manga(slug);
    CREATE INDEX IF NOT EXISTS idx_chapters_manga ON chapters(manga_id, chapter_number);
    CREATE INDEX IF NOT EXISTS idx_pages_chapter ON chapter_pages(chapter_id, page_number);
    CREATE INDEX IF NOT EXISTS idx_comments_manga ON comments(manga_id, created_at DESC);
  `);
}

function seedInitialData(db: Database.Database) {
  const genres = [
    { name: 'Jangari (Action)', slug: 'action' },
    { name: 'Sarguzasht (Adventure)', slug: 'adventure' },
    { name: 'Fantastika (Fantasy)', slug: 'fantasy' },
    { name: 'Sehr-jodu (Magic)', slug: 'magic' },
    { name: 'Romantika (Romance)', slug: 'romance' },
    { name: 'Komediya (Comedy)', slug: 'comedy' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Shounen', slug: 'shounen' },
    { name: 'Isekai', slug: 'isekai' },
    { name: 'Psixologik (Psychological)', slug: 'psychological' }
  ];

  const insertGenre = db.prepare('INSERT OR IGNORE INTO genres (name, slug) VALUES (?, ?)');
  for (const g of genres) {
    insertGenre.run(g.name, g.slug);
  }
}

