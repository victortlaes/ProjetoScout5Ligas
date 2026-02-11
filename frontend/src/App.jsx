import { useEffect, useState, useMemo } from 'react';
import RadarComparison from './components/RadarComparison';
import Select from 'react-select';
import PlayerCard from './components/PlayerCard';
import SimilarPlayerCard from './components/SimilarPlayerCard';


function App() {
  const [players, setPlayers] = useState([]);
  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [view, setView] = useState('compare'); // 'compare' | 'similar'
  const [similarPlayer, setSimilarPlayer] = useState(null);
  const [similarResults, setSimilarResults] = useState([]);

  // carregar todos os jogadores
  useEffect(() => {
    fetch('http://localhost:3001/scouts')
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  function comparar() {
    fetch(`http://localhost:3001/compare?a=${playerA}&b=${playerB}`)
      .then(res => res.json())
      .then(data => setCompareData(data));
  }

  function buscarSimilares() {
  fetch(`http://localhost:3001/similar?a=${similarPlayer}`)
    .then(res => res.json())
    .then(data => setSimilarResults(data.similares));
}


  const playerOptions = useMemo(() => {
    return players
      .filter(p => p.posicao !== 'G') // 🚫 filtra goleiros do dropdown
      .map(p => ({
      value: p.player_id,
      label: `${p.nome} (${p.time})`
    }));
  }, [players]);

  return (
    <div style={{ padding: 24 }}>
      {/* ===== NAV SUPERIOR ===== */}
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

      {/* ===== VIEW: COMPARAÇÃO ===== */}
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
              disabled={playerA === null || playerB === null}
            >
              Comparar
            </button>
          </div>

          <div style={{ marginTop: 40 }}>
            {compareData?.players?.length === 2 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  gap: 32
                }}
              >
                {/* JOGADOR A */}
                <PlayerCard player={compareData.players[0]} />

                {/* RADAR */}
                <div style={{ width: 400 }}>
                  <RadarComparison
                    labels={compareData.labels}
                    players={compareData.players}
                  />
                </div>

                {/* JOGADOR B */}
                <PlayerCard player={compareData.players[1]} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== VIEW: SIMILARIDADE (placeholder simples) ===== */}
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
