import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const initDB = async () => {
  const db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    DROP TABLE IF EXISTS users;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);

  return db;
};