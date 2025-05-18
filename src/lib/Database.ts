import Database from "better-sqlite3";

const db = new Database("leaderboard.db");

// Create the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    player_name TEXT,
    score INTEGER,
    kills INTEGER,
    success INTEGER,
    time_alive INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export function savePlayerStats(sessionId: string, playerName: string, score: number, kills: number, success: number, time_alive: number) {
  const stmt = db.prepare(`
    INSERT INTO player_stats (session_id, player_name, score, kills, success, time_alive)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(sessionId, playerName, score, kills, success, time_alive);
}

export function getAllSuccessfulPlayers() {
  const stmt = db.prepare(`
    SELECT player_name, score, kills, time_alive, timestamp
    FROM player_stats
    WHERE success = 1
    ORDER BY score DESC
  `);
  return stmt.all();
}

export function getAllPlayers() {
  const stmt = db.prepare(`
    SELECT player_name, score, kills, success, time_alive, timestamp
    FROM player_stats
    ORDER BY score DESC
  `);
  return stmt.all();
}
