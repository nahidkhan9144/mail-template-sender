const path = require('path');
const db_name = path.join(__dirname, "database.db");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.run(`CREATE TABLE IF NOT EXISTS template (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT,
  cover_letter TEXT,
  file TEXT,
    deleted INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS mails_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER,
  hrs_mail TEXT,
  status INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

module.exports = db;