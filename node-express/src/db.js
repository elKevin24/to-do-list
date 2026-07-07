const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error('Unable to open SQLite database', error);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);
});

module.exports = db;
