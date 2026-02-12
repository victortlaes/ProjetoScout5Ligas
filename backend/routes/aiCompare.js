import express from 'express';
import db from '../db.js';
import radarConfig from '../services/radarMetrics.js';
import calcularRadar from '../services/radarCalculator.js';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.get('/', async (req, res) => {
  const { a, b } = req.query;

  if (!a || !b) {
    return res.status(400).json({ error: 'IDs obrigatórios' });
  }

  db.all(`SELECT * FROM scouts WHERE posicao != 'G'`, [], async (err, base) => {
    if (err) return res.status(500).json(err);

    const pA = base.find(p => p.player_id == a);
    const pB = base.find(p => p.player_id == b);

    if (!pA || !pB) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    const radarA = calcularRadar(pA, base, radarConfig.metrics);
    const radarB = calcularRadar(pB, base, radarConfig.metrics);

    const prompt = `Compare os dois jogadores abaixo de forma técnica e estratégica.

Jogador 1:
Nome: ${pA.nome}
Posição: ${pA.posicao}
Time: ${pA.time}
Radar Percentis:
${radarConfig.labels.map((l, i) => `${l}: ${radarA[i]}`).join('\n')}

Jogador 2:
Nome: ${pB.nome}
Posição: ${pB.posicao}
Time: ${pB.time}
Radar Percentis:
${radarConfig.labels.map((l, i) => `${l}: ${radarB[i]}`).join('\n')}

Gere:
- Análise comparativa técnica
- Pontos fortes e fracos de cada um
- Perfil tático
- Em que tipo de equipe cada um renderia melhor
- Conclusão final objetiva
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um analista tático de futebol." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      res.json({
        analysis: completion.choices[0].message.content
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao gerar análise IA' });
    }
  });
});

export default router;
