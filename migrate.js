// migrate.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function migrateDatabase() {
    const db = await open({
        filename: './db.sqlite',
        driver: sqlite3.Database
    });

    try {
        await db.exec('BEGIN TRANSACTION;');

        // 1. Create a new table with the updated schema
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            );
        `);

        // 2. Copy data from the old "users" table to the new table, renaming "name" to "username"
        await db.exec(`
            INSERT INTO users_new (id, username, password, role)
            SELECT id, name AS username, password, role FROM users;
        `);

        // 3. Drop the old "users" table
        await db.exec('DROP TABLE users;');

        // 4. Rename "users_new" to "users"
        await db.exec('ALTER TABLE users_new RENAME TO users;');

        await db.exec('COMMIT;');
        console.log('Database migration completed successfully.');
    } catch (error) {
        console.error('Error during database migration:', error);
        await db.exec('ROLLBACK;');
    } finally {
        await db.close();
    }
}

migrateDatabase().catch(console.error);
