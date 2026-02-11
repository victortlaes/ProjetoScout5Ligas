import express from 'express';
import cors from 'cors';

import compareRoutes from './routes/compare.js';
import scoutsRoutes from './routes/scouts.js';
import similarRoutes from './routes/similar.js';


import db from './db.js';
import { buildRawCache } from './services/rawCache.js';
import { buildRadarCache } from './services/rawCache.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/scouts', scoutsRoutes);
app.use('/compare', compareRoutes);
app.use('/similar', similarRoutes);


db.all('SELECT * FROM scouts', [], (err, rows) => {
  if (err) throw err;

  global.UNIVERSO = rows;

  buildRawCache(rows); // 🔥 cache pré-calculado
});


db.all('SELECT * FROM scouts', [], (err, rows) => {
  if (err) throw err;

  global.UNIVERSO = rows;

  buildRadarCache(rows); // 🔥 UMA VEZ
});

app.listen(3001, () => {
  console.log('🚀 Backend rodando na porta 3001');
});
