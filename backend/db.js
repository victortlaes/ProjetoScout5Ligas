import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./base_scouts_futebol.db', err => {
  if (err) console.error(err);
  else console.log('SQLite conectado');
});

export default db;
