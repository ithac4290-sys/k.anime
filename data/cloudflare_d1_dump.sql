PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE manga (
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
CREATE TABLE genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );
INSERT INTO genres VALUES(1,'Jangari (Action)','action');
INSERT INTO genres VALUES(2,'Sarguzasht (Adventure)','adventure');
INSERT INTO genres VALUES(3,'Fantastika (Fantasy)','fantasy');
INSERT INTO genres VALUES(4,'Sehr-jodu (Magic)','magic');
INSERT INTO genres VALUES(5,'Romantika (Romance)','romance');
INSERT INTO genres VALUES(6,'Komediya (Comedy)','comedy');
INSERT INTO genres VALUES(7,'Drama','drama');
INSERT INTO genres VALUES(8,'Shounen','shounen');
INSERT INTO genres VALUES(9,'Isekai','isekai');
INSERT INTO genres VALUES(10,'Psixologik (Psychological)','psychological');
INSERT INTO genres VALUES(15,'Fojia','tragedy');
CREATE TABLE manga_genres (
      manga_id INTEGER,
      genre_id INTEGER,
      PRIMARY KEY (manga_id, genre_id),
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    );
CREATE TABLE chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manga_id INTEGER NOT NULL,
      chapter_number REAL NOT NULL,
      title TEXT,
      volume INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
    );
CREATE TABLE chapter_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );
CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manga_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
    );
CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT '/animeko-logo.jpg',
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    , google_id TEXT, coins INTEGER DEFAULT 0, subscription_status TEXT DEFAULT 'free');
INSERT INTO users VALUES(1,'admin','admin@animeko.uz','337036d6f2832f88715e5f4f50b7b317:65b31cfcd40adc31977d99c183a55d11ebdaf3602c25fbedfba9ef7d35a062187e166b8d1b96c610162195252bbca1359df125b8999bf1b32fc92316e0e1a8a7','/animeko-logo.jpg','admin','2026-10-14 15:54:45',NULL,0,'free');
INSERT INTO users VALUES(2,'salom','ithac4290@gmail.com','5ec14eee47f4b5e1c85439bcf41f4051:6a94bb6e6ad4a719da2f432fd1f7c6d66598bdb8201906a4b134d4f90a019ef673164fcce73f465a06f7841792c9ffa9145feb2965242d6d822a34e2cb92c20a','/animeko-logo.jpg','user','2026-10-14 15:54:45',NULL,0,'free');
INSERT INTO users VALUES(3,'googlefoydalanu','google_user_3767@gmail.com','2923d88fe4239c07d062f9ffc5797da9:1bb11e91f6abe27cec64b17ada7c2e16a6f784ea3fe9ad11eeb3d6d244d22740b1dfc6114881febd2ac581a6e344607bebf35f41aadfefb0b2c4a4ab4b169ccc','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80','user','2026-10-14 16:07:19','google_1791994039143',0,'free');
INSERT INTO users VALUES(4,'telegramfoydala','tg_user_1145@t.me','f8402764b5af2735f5759720cdab21d5:063be082e2c66780c1bedf4fd805f253639f8620a080bb7fff5ca0b055139aded532f107db76d22137094daad2e221b17b22ca115a096197ba89406474f3affa','/animeko-logo.jpg','user','2026-10-14 16:49:29','tg_1791996569641',0,'free');
CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('genres',15);
INSERT INTO sqlite_sequence VALUES('users',4);
CREATE INDEX idx_manga_slug ON manga(slug);
CREATE INDEX idx_chapters_manga ON chapters(manga_id, chapter_number);
CREATE INDEX idx_pages_chapter ON chapter_pages(chapter_id, page_number);
CREATE INDEX idx_comments_manga ON comments(manga_id, created_at DESC);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user ON sessions(user_id);
PRAGMA writable_schema=OFF;
COMMIT;
