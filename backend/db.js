import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./base_scouts_futebol.db', err => {
  if (err) console.error(err);
  else console.log('SQLite conectado');
});

db.serialize(() => {
  db.run(`ALTER TABLE scouts ADD COLUMN temporada TEXT`, alterErr => {
    if (alterErr && !String(alterErr.message).includes('duplicate column')) {
      console.error('Migração temporada:', alterErr.message);
    }
    db.run(
      `UPDATE scouts SET temporada = '2025' WHERE temporada IS NULL OR trim(temporada) = ''`
    );
  });
});

export default db;
