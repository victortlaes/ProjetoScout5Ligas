import fs from 'fs';
import path from 'path';
import db from '../db.js'; // ajusta se o caminho for diferente

const OUTPUT_DIR = path.resolve('./public/players');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// delay simples
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function downloadImage(p, attempt = 1) {
  try {
    const res = await fetch(p.url_foto, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = path.join(OUTPUT_DIR, `${p.player_id}.png`);

    fs.writeFileSync(filePath, buffer);

    console.log(`✅ ${p.player_id}`);
  } catch (err) {
    if (attempt <= 2) {
      console.log(`🔁 retry ${p.player_id} (${attempt})`);
      await sleep(300);
      return downloadImage(p, attempt + 1);
    }

    console.log(`❌ erro ${p.player_id} - ${err.message}`);
  }
}

function run() {
  db.all(`SELECT player_id, url_foto FROM scouts`, async (err, players) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`🚀 Baixando ${players.length} imagens...`);

    // controla concorrência (IMPORTANTE pra não ser bloqueado)
    const CONCURRENCY = 5;
    let index = 0;

    async function worker() {
      while (index < players.length) {
        const current = players[index++];
        await downloadImage(current);
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, worker);

    await Promise.all(workers);

    console.log('🎉 Finalizado');
  });
}

run();