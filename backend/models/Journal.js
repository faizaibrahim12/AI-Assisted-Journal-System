const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'journal.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    ambience TEXT DEFAULT '',
    text TEXT NOT NULL,
    emotion TEXT DEFAULT '',
    keywords TEXT DEFAULT '[]',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_userId ON journals(userId)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_emotion ON journals(emotion)
`);

// Journal model functions
const Journal = {
  create(data) {
    const { userId, ambience, text, emotion, keywords } = data;
    const stmt = db.prepare(`
      INSERT INTO journals (userId, ambience, text, emotion, keywords)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, ambience, text, emotion, JSON.stringify(keywords || []));
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM journals WHERE id = ?');
    const row = stmt.get(id);
    if (row) {
      row._id = row.id.toString();
      row.keywords = JSON.parse(row.keywords);
    }
    return row;
  },

  findByUserId(userId) {
    const stmt = db.prepare('SELECT * FROM journals WHERE userId = ? ORDER BY createdAt DESC');
    const rows = stmt.all(userId);
    return rows.map(row => ({
      ...row,
      _id: row.id.toString(),
      keywords: JSON.parse(row.keywords)
    }));
  },

  async save() {
    // For compatibility with Mongoose save
    return this;
  }
};

module.exports = Journal;
