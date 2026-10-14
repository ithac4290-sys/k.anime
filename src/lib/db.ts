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
  const count = db.prepare('SELECT COUNT(*) as count FROM manga').get() as { count: number };
  if (count.count > 0) return;

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

  const sampleMangas = [
    {
      title: "Yolg'iz Darajalanuvchi (Solo Leveling)",
      original_title: "나 혼자만 레벨업",
      slug: "solo-leveling",
      description: "10 yil avval boshqa o'lchovga olib boruvchi 'Darvoza' ochilib, odamlar orasida maxsus qobiliyat egalari - 'Ovchilar' paydo bo'ldi. Eng kuchsiz, E-darajali ovchi Son Jin-U o'lim bilan yuzma-yuz kelganida sirli vazifalar oynasi uning oldida paydo bo'ladi...",
      cover_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      author: "Chugong",
      artist: "DUBU (REDICE Studio)",
      status: "completed",
      type: "manhwa",
      release_year: 2018,
      rating: 4.9,
      views: 14520,
      genre_slugs: ["action", "fantasy", "magic"]
    },
    {
      title: "Sehrli Jang (Jujutsu Kaisen)",
      original_title: "呪術廻戦",
      slug: "jujutsu-kaisen",
      description: "Yuji Itadori g'ayritabiiy jismoniy kuchga ega oddiy maktab o'quvchisi. Bir kuni u do'stlarini la'natlangan ruhlardan qutqarish uchun afsonaviy la'nat Sukunaning barmog'ini yutib yuboradi va la'natlar dunyosiga qadam qo'yadi.",
      cover_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
      author: "Gege Akutami",
      artist: "Gege Akutami",
      status: "ongoing",
      type: "manga",
      release_year: 2018,
      rating: 4.8,
      views: 9830,
      genre_slugs: ["action", "shounen", "fantasy"]
    },
    {
      title: "Titanlar Hujumi (Attack on Titan)",
      original_title: "進撃の巨人",
      slug: "attack-on-titan",
      description: "Insoniyat qonxo'r bahaybat gigantlardan himoyalanish uchun uch qavatli ulkan devorlar ortida yashashga majbur. Eren Yeger onasining titan tomonidan halok bo'lishiga guvoh bo'lgach, barcha titanlarni yo'q qilishga qasamyod qiladi.",
      cover_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
      author: "Hajime Isayama",
      artist: "Hajime Isayama",
      status: "completed",
      type: "manga",
      release_year: 2009,
      rating: 4.9,
      views: 18200,
      genre_slugs: ["action", "drama", "psychological"]
    },
    {
      title: "Qora Klever (Black Clover)",
      original_title: "ブラッククローバー",
      slug: "black-clover",
      description: "Sehr dunyosida bir tomchi ham sehrli quvvatsiz tug'ilgan Asta va uning iste'dodli do'sti Yuno Sehrgarlar Qiroli bo'lish uchun bellashadilar. Asta anti-sehr qilichlariga ega besh bargli Klever grimuari egasiga aylanadi.",
      cover_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
      author: "Yūki Tabata",
      artist: "Yūki Tabata",
      status: "ongoing",
      type: "manga",
      release_year: 2015,
      rating: 4.7,
      rating_count: 32,
      schedule_day: "Payshanba",
      views: 6410,
      genre_slugs: ["action", "magic", "shounen"]
    },
    {
      title: "Hamma Narsani Biluvchi O'quvchi (Omniscient Reader)",
      original_title: "전지적 독자 시점",
      slug: "omniscient-reader",
      description: "Kim Dokja 10 yil davomida hech kim o'qimagan 'Vayron bo'lgan dunyoda omon qolishning 3 usuli' nomli romanning yagona sadoqatli kitobxoni edi. Epilog chiqqan kuni roman voqealari haqiqiy hayotda sodir bo'la boshlaydi...",
      cover_url: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&auto=format&fit=crop&q=80",
      author: "sing N song",
      artist: "Sleepy-C",
      status: "ongoing",
      type: "manhwa",
      release_year: 2020,
      rating: 4.95,
      rating_count: 84,
      schedule_day: "Juma",
      views: 22400,
      genre_slugs: ["action", "fantasy", "psychological"]
    },
    {
      title: "Iblislar Qotili (Demon Slayer: Kimetsu no Yaiba)",
      original_title: "鬼滅の刃",
      slug: "demon-slayer",
      description: "Tanjiro Kamado mehnatkash bola bo'lib, tog'da ko'mir sotish bilan oilasini boqardi. Bir kuni uyiga qaytib, butun oilasi qotillik qurboni bo'lganini, singlisi Nezuko esa iblisga aylanganini ko'radi.",
      cover_url: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&auto=format&fit=crop&q=80",
      author: "Koyoharu Gotouge",
      artist: "Koyoharu Gotouge",
      status: "completed",
      type: "manga",
      release_year: 2016,
      rating: 4.88,
      rating_count: 110,
      schedule_day: "Shanba",
      views: 28900,
      genre_slugs: ["action", "shounen", "fantasy"]
    },
    {
      title: "Benzopila Odam (Chainsaw Man)",
      original_title: "チェンソーマン",
      slug: "chainsaw-man",
      description: "Dendzi otasining ulkan qarzlarini to'lash uchun iblis iti Pochita bilan birga iblislar ovchisi bo'lib ishlaydi. Xiyonatga uchrab o'ldirilgach, Pochita uning yuragiga aylanadi va Dendzi Benzopila Odamga aylanadi.",
      cover_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      author: "Tatsuki Fujimoto",
      artist: "Tatsuki Fujimoto",
      status: "ongoing",
      type: "manga",
      release_year: 2018,
      rating: 4.85,
      rating_count: 67,
      schedule_day: "Seshanba",
      views: 19500,
      genre_slugs: ["action", "shounen", "drama"]
    },
    {
      title: "Van Pis (One Piece)",
      original_title: "ワンピース",
      slug: "one-piece",
      description: "Qaroqchilar qiroli Gol D. Rodjer o'limidan oldin o'zining afsonaviy boyligi 'One Piece' mavjudligini e'lon qiladi. Monkey D. Luffy Rezina-Rezina mevasini yeb elastik odamga aylanadi va o'z jamoasi bilan Qaroqchilar Qiroli bo'lish uchun Buyuk Yo'l sari suzadi.",
      cover_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
      author: "Eiichiro Oda",
      artist: "Eiichiro Oda",
      status: "ongoing",
      type: "manga",
      release_year: 1997,
      rating: 4.96,
      rating_count: 240,
      schedule_day: "Yakshanba",
      views: 45000,
      genre_slugs: ["action", "adventure", "comedy", "shounen"]
    }
  ];

  const insertManga = db.prepare(`
    INSERT INTO manga (title, original_title, slug, description, cover_url, author, artist, status, type, release_year, rating, rating_count, schedule_day, views)
    VALUES (@title, @original_title, @slug, @description, @cover_url, @author, @artist, @status, @type, @release_year, @rating, @rating_count, @schedule_day, @views)
  `);

  const insertMangaGenre = db.prepare(`
    INSERT INTO manga_genres (manga_id, genre_id)
    VALUES (?, (SELECT id FROM genres WHERE slug = ?))
  `);

  const insertChapter = db.prepare(`
    INSERT INTO chapters (manga_id, chapter_number, title)
    VALUES (?, ?, ?)
  `);

  const insertPage = db.prepare(`
    INSERT INTO chapter_pages (chapter_id, page_number, image_url)
    VALUES (?, ?, ?)
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments (manga_id, author_name, content, rating)
    VALUES (?, ?, ?, ?)
  `);

  // Sample page illustrations for the reader
  const samplePages = [
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80"
  ];

  for (const m of sampleMangas) {
    const info = insertManga.run({
      ...m,
      rating_count: m.rating_count || 45,
      schedule_day: m.schedule_day || "Dushanba"
    });
    const mangaId = info.lastInsertRowid;

    for (const gSlug of m.genre_slugs) {
      insertMangaGenre.run(mangaId, gSlug);
    }

    // Add 3 sample chapters for each manga
    for (let c = 1; c <= 3; c++) {
      const chInfo = insertChapter.run(mangaId, c, `${c}-bob. Boshlanish`);
      const chapterId = chInfo.lastInsertRowid;

      // Add pages for chapter
      for (let p = 1; p <= samplePages.length; p++) {
        insertPage.run(chapterId, p, samplePages[p - 1]);
      }
    }

    // Add sample comment
    insertComment.run(mangaId, "MangaMuxlis", "Tarjima va sifat juda ajoyib! O'zbek tilida o'qish judayam yoqimli bo'ldi.", 5);
  }
}
