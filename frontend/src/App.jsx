import { useEffect, useState, useMemo } from 'react';
import RadarComparison from './components/RadarComparison';
import Select from 'react-select';
import PlayerCard from './components/PlayerCard';
import SimilarPlayerCard from './components/SimilarPlayerCard';
import './styles/aiReport.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [view, setView] = useState('compare');
  const [similarPlayer, setSimilarPlayer] = useState(null);
  const [similarResults, setSimilarResults] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [followUp, setFollowUp] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState(null);


  // ==============================
  // Carregar jogadores
  // ==============================
  useEffect(() => {
    fetch('http://localhost:3001/scouts')
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  // ==============================
  // Comparação normal
  // ==============================
  function comparar() {
    setAiReport(null);

    fetch(`http://localhost:3001/compare?a=${playerA}&b=${playerB}`)
      .then(res => res.json())
      .then(data => setCompareData(data));
  }

  // ==============================
  // Comparação com IA
  // ==============================
  function compararComIA() {
    setLoadingAI(true);

    fetch(`http://localhost:3001/ai-compare?a=${playerA}&b=${playerB}`)
      .then(res => res.json())
      .then(data => {
        setAiReport(data.analysis);
        setLoadingAI(false);
      })
      .catch(() => setLoadingAI(false));
  }

  // ==============================
  // Similaridade
  // ==============================
  function buscarSimilares() {
    fetch(`http://localhost:3001/similar?a=${similarPlayer}`)
      .then(res => res.json())
      .then(data => setSimilarResults(data.similares));
  }

  function enviarPergunta() {
  fetch('http://localhost:3001/ai-compare/followup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      report: aiReport,
      question: followUp
    })
  })
    .then(res => res.json())
    .then(data => {
      setFollowUpAnswer(data.answer);
      setFollowUp('');
    })
    .catch(err => console.error(err));
}


  // ==============================
  // Dropdown options (sem goleiros)
  // ==============================
  const playerOptions = useMemo(() => {
    return players
      .filter(p => p.posicao !== 'G')
      .map(p => ({
        value: p.player_id,
        label: `${p.nome} (${p.time})`
      }));
  }, [players]);

  return (
    <div style={{ padding: 24 }}>

      {/* ==============================
          NAV SUPERIOR
      ============================== */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12
        }}
      >
        <button
          onClick={() => setView('compare')}
          style={{ fontWeight: view === 'compare' ? 'bold' : 'normal' }}
        >
          Comparação de Jogadores
        </button>

        <button
          onClick={() => setView('similar')}
          style={{ fontWeight: view === 'similar' ? 'bold' : 'normal' }}
        >
          Similaridade
        </button>
      </div>

      {/* ==============================
          VIEW: COMPARAÇÃO
      ============================== */}
      {view === 'compare' && (
        <>
          <h1>MVP – Comparação de Jogadores</h1>

          <div style={{ display: 'flex', gap: 12 }}>
            <Select
              placeholder="Jogador A"
              options={playerOptions}
              value={playerOptions.find(o => o.value === playerA) || null}
              onChange={option => setPlayerA(option ? option.value : null)}
              isClearable
            />

            <Select
              placeholder="Jogador B"
              options={playerOptions}
              value={playerOptions.find(o => o.value === playerB) || null}
              onChange={option => setPlayerB(option ? option.value : null)}
              isClearable
            />

            <button
              onClick={comparar}
              disabled={!playerA || !playerB}
            >
              Comparar
            </button>

            <button
              onClick={compararComIA}
              disabled={!playerA || !playerB || loadingAI}
            >
              {loadingAI ? 'Gerando...' : 'Comparar com IA'}
            </button>
          </div>

          <div style={{ marginTop: 40 }}>
            {compareData?.players?.length === 2 && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: 32
                  }}
                >
                  <PlayerCard player={compareData.players[0]} />

                  <div style={{ width: 400 }}>
                    <RadarComparison
                      labels={compareData.labels}
                      players={compareData.players}
                    />
                  </div>

                  <PlayerCard player={compareData.players[1]} />
                </div>

                {/* ===== RELATÓRIO IA ===== */}
                {aiReport && (
                  <div style={{ marginTop: 40 }}>

                    {/* Relatório principal */}
                    <div
                      className="ai-report"
                      dangerouslySetInnerHTML={{
                        __html: aiReport
                          .replace(/```html/g, '')
                          .replace(/```/g, '')
                          .trim()
                      }}
                    />

                    {/* ===== FOLLOW UP ===== */}
                    <div style={{ marginTop: 30 }}>
                      <h3>Fazer pergunta sobre a análise</h3>

                      <textarea
                        maxLength={300}
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        placeholder="Digite sua dúvida (máx 300 caracteres)..."
                        style={{
                          width: '100%',
                          minHeight: 80,
                          padding: 12,
                          marginTop: 10,
                          borderRadius: 8,
                          border: '1px solid #ccc',
                          resize: 'none'
                        }}
                      />

                      <div style={{ fontSize: 12, textAlign: 'right' }}>
                        {followUp.length}/300
                      </div>

                      <button
                        onClick={enviarPergunta}
                        disabled={!followUp.trim()}
                        style={{
                          marginTop: 10,
                          padding: '8px 16px',
                          borderRadius: 6,
                          border: 'none',
                          background: '#111',
                          color: '#fff',
                          cursor: followUp.trim() ? 'pointer' : 'not-allowed',
                          opacity: followUp.trim() ? 1 : 0.6
                        }}
                      >
                        Perguntar
                      </button>
                    </div>

                    {/* ===== RESPOSTA DO FOLLOW UP ===== */}
                    {followUpAnswer && (
                      <div style={{ marginTop: 30 }}>
                        <h4>Resposta:</h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: followUpAnswer
                              .replace(/```html/g, '')
                              .replace(/```/g, '')
                              .trim()
                          }}
                        />
                      </div>
                    )}

                  </div>
                )}


              </>
            )}
          </div>
        </>
      )}

      {/* ==============================
          VIEW: SIMILARIDADE
      ============================== */}
      {view === 'similar' && (
        <>
          <h1>MVP – Similaridade de Jogadores</h1>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Select
              placeholder="Jogador base"
              options={playerOptions}
              value={playerOptions.find(o => o.value === similarPlayer) || null}
              onChange={option => setSimilarPlayer(option ? option.value : null)}
              isClearable
            />

            <button
              onClick={buscarSimilares}
              disabled={!similarPlayer}
            >
              Buscar
            </button>
          </div>

          <div style={{ marginTop: 32 }}>
            {similarResults.map(p => (
              <SimilarPlayerCard key={p.player_id} player={p} />
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default App;
