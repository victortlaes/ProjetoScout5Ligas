import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import compareRoutes from './routes/compare.js';
import scoutsRoutes from './routes/scouts.js';
import similarRoutes from './routes/similar.js';
import aiCompareRoutes from './routes/aiCompare.js';
import scoutMarketRoutes from './routes/scout-market.js';


import db from './db.js';
import { buildRawCache } from './services/rawCache.js';
import { buildRadarCache } from './services/rawCache.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*'
}));


app.use('/scouts', scoutsRoutes);
app.use('/compare', compareRoutes);
app.use('/similar', similarRoutes);
app.use('/ai-compare', aiCompareRoutes);
app.use('/scout-market', scoutMarketRoutes);


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

app.listen(PORT, () => {
  console.log(`🚀 rodando na porta ${PORT}`);
});