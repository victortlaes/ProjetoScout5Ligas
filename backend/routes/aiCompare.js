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

    function montarMetrics(player) {
      return Object.entries(radarConfig.metrics)
        .map(([categoria, keys]) => {
          const stats = keys
            .map(k => `${k}: ${player[k] ?? 0}`)
            .join(', ');
          return `${categoria.toUpperCase()} → ${stats}`;
        })
        .join('\n');
    }

    const metricsA = montarMetrics(pA);
    const metricsB = montarMetrics(pB);



    
const prompt = `
Vamos comparar dois jogadores de futebol: ${pA.nome} e ${pB.nome}.

Analise os dados fornecidos (percentis do radar, métricas brutas e minutos jogados).

IMPORTANTE:
- Não liste todas as estatísticas como tabela; cite números quando forem relevantes para justificar um argumento.
- Considere a minutagem antes de mencionar volume de ações.
- Não utilize percentis para destacar diferenças.
- Ao comparar eficiência em métricas de alto volume, utilize porcentagens em vez de volume absoluto.
- Antes de afirmar que um número é maior que outro, verifique matematicamente qual é superior.


Dados do jogador 1:

Jogador: ${pA.nome}
Posição: ${pA.posicao}
Idade: ${pA.idade}
Time: ${pA.time}
Minutos: ${pA.minutesPlayed}

Radar Percentil:
${radarConfig.labels.map((l, i) => `${l}: ${radarA[i]}`).join('\n')}
Métricas Brutas:
${metricsA}

Dados do jogador 2:

Jogador: ${pB.nome}
Posição: ${pB.posicao}
Idade: ${pB.idade}
Time: ${pB.time}
Minutos: ${pB.minutesPlayed}

Radar Percentil:
${radarConfig.labels.map((l, i) => `${l}: ${radarB[i]}`).join('\n')}

Métricas Brutas:
${metricsB}

Retorne o relatório EXATAMENTE no seguinte formato HTML:

<h1>Relatório comparativo entre ${pA.nome} e ${pB.nome}</h1>

<h2>${pA.nome}</h2>
<ul class="font">
<li>3 pontos fortes em que ${pA.nome} supera ${pB.nome} e discorra</li>
<li>1 fraqueza notável em comparação ao outro</li>
</ul>

<h2>${pB.nome}</h2>
<ul class="font">
<li>3 pontos fortes em que ${pB.nome} supera ${pA.nome} e discorra</li>
<li>1 fraqueza notável em comparação ao outro</li>
</ul>

<h2>Conclusão</h2>
<p class="font">
Breve análise comparativa estratégica destacando:
- Qual perfil é mais completo
- Qual é mais específico
- Em que contexto tático cada um renderia melhor
- Se ${pB.nome} poderia substituir ${pA.nome} em caso de venda ou lesão
</p>

Seja técnico, objetivo e estratégico.
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

      const output = completion.choices[0].message.content;

      console.log("===== IA OUTPUT =====");
      console.log(output);
      console.log("=====================");


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
