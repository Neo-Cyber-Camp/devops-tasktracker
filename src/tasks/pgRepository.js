const { Pool } = require('pg');

const COLUMNS = 'id, title, done';

function createPgRepository(connectionString) {
  const pool = new Pool({ connectionString });

  return {
    async init() {
      await pool.query(
        'CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, done BOOLEAN NOT NULL DEFAULT false)',
      );
    },
    async insert({ title, done }) {
      const { rows } = await pool.query(
        `INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING ${COLUMNS}`,
        [title, done],
      );
      return rows[0];
    },
    async findAll() {
      const { rows } = await pool.query(`SELECT ${COLUMNS} FROM tasks ORDER BY id`);
      return rows;
    },
    async update(id, changes) {
      const current = await pool.query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [id]);
      if (current.rowCount === 0) return null;
      const next = { ...current.rows[0], ...changes };
      const { rows } = await pool.query(
        `UPDATE tasks SET title = $2, done = $3 WHERE id = $1 RETURNING ${COLUMNS}`,
        [id, next.title, next.done],
      );
      return rows[0];
    },
    async remove(id) {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      return result.rowCount > 0;
    },
  };
}

module.exports = { createPgRepository };
