import { useEffect, useState, useMemo, useRef } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import PlayerSelect from './components/PlayerSelect';
import PlayerCard from './components/PlayerCard';
import RadarComparison from './components/RadarComparison';
import AIReport from './components/AIReport';
import SimilarPlayerCard from './components/SimilarPlayerCard';
import ScoutMarket from './components/ScoutMarket';
import { getLeague } from './utils/leagueMap';
import { resolveBirthCountryCode } from './utils/countryFlag';
import styles from './App.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';


const DEFAULT_FILTERS = {
  leagues:  [],
  position: '',
  age:      { min: 15, max: 44 },
};

export default function App() {
  const [players, setPlayers]           = useState([]);
  const [view, setView]                 = useState('compare');

  // Filtros
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);

  // Compare
  const [playerA, setPlayerA]           = useState(null);
  const [playerB, setPlayerB]           = useState(null);
  const [compareData, setCompareData]   = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [autoCompare, setAutoCompare]   = useState(false);

  // IA
  const [aiReport, setAiReport]         = useState(null);
  const [loadingAI, setLoadingAI]       = useState(false);
  const [followUp, setFollowUp]         = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState(null);

  // Similar
  const [similarPlayer, setSimilarPlayer]   = useState(null);
  const [similarResults, setSimilarResults] = useState([]);
  const [baseRadar,      setBaseRadar]      = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const similarRequestSeq = useRef(0);

  // Carregar jogadores
  useEffect(() => {
    fetch(`${API}/scouts`)
      .then(r => r.json())
      .then(setPlayers)
      .catch(console.error);
  }, []);

  // Opções filtradas para os dropdowns (sem goleiros)
  const filteredOptions = useMemo(() => {
    return players
      .filter(p => {
        if (p.posicao === 'G') return false;
        if (filters.position && p.posicao !== filters.position) return false;
        if (filters.leagues.length > 0 && !filters.leagues.includes(getLeague(p.time))) return false;
        const age = Number(p.idade) || 0;
        if (age > 0 && (age < filters.age.min || age > filters.age.max)) return false;
        return true;
      })
      .map(p => ({
        value: p.player_id,
        label: p.nome,
        time:  p.time,
        posicao: p.posicao,
        foto:  p.url_foto,
        idade: p.idade,
        birthCountryCode: resolveBirthCountryCode(p),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [players, filters]);

  // Opções similares (inclui todas as posições mas não G)
  const allOptions = useMemo(() => {
    return players
      .filter(p => p.posicao !== 'G')
      .map(p => ({
        value:   p.player_id,
        label:   p.nome,
        time:    p.time,
        posicao: p.posicao,
        foto:    p.url_foto,
        idade:   p.idade,
        birthCountryCode: resolveBirthCountryCode(p),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [players]);

  // Jogador completo para o card
  function getPlayer(id) {
    return players.find(p => p.player_id == id) || null;
  }

  // Compare
  function comparar() {
    if (!playerA || !playerB) return;
    setLoadingCompare(true);
    setAiReport(null);
    setFollowUp('');
    setFollowUpAnswer(null);

    fetch(`${API}/compare?a=${playerA}&b=${playerB}`)
      .then(r => r.json())
      .then(data => { setCompareData(data); setLoadingCompare(false); })
      .catch(() => setLoadingCompare(false));
  }

  // Se veio do "Comparar" na lista de similares, roda automaticamente
  useEffect(() => {
    if (!autoCompare) return;
    if (view !== 'compare') return;
    if (!playerA || !playerB) return;
    comparar();
    setAutoCompare(false);
  }, [autoCompare, view, playerA, playerB]);

  function compararComIA() {
    if (!playerA || !playerB) return;
    setLoadingAI(true);
    setFollowUpAnswer(null);

    fetch(`${API}/ai-compare?a=${playerA}&b=${playerB}`)
      .then(async r => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data?.error || 'Falha ao gerar analise IA');
        }
        return data;
      })
      .then(data => {
        if (typeof data?.analysis === 'string' && data.analysis.trim()) {
          setAiReport(data.analysis);
        } else {
          setAiReport(null);
        }
        setLoadingAI(false);
      })
      .catch(() => {
        setAiReport(null);
        setLoadingAI(false);
      });
  }

  function enviarFollowUp() {
    fetch(`${API}/ai-compare/followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report: aiReport, question: followUp }),
    })
      .then(r => r.json())
      .then(data => { setFollowUpAnswer(data.answer); setFollowUp(''); })
      .catch(console.error);
  }

  // Similar — busca reativa
  const radarCanvasRef = useRef(null);
  useEffect(() => {
    if (!similarPlayer) {
      setSimilarResults([]);
      setBaseRadar([]);
      setLoadingSimilar(false);
      return;
    }

    const requestId = ++similarRequestSeq.current;
    const controller = new AbortController();
    setLoadingSimilar(true);

    // Monta query com filtros ativos
    const params = new URLSearchParams({ a: similarPlayer });
    if (filters.leagues.length > 0)  params.set('leagues', filters.leagues.join(','));
    if (filters.position)             params.set('position', filters.position);
    if (filters.age.min > 15)         params.set('ageMin', filters.age.min);
    if (filters.age.max < 44)         params.set('ageMax', filters.age.max);

    fetch(`${API}/similar?${params.toString()}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        // Ignora resposta antiga (evita "reset" visual dos filtros)
        if (requestId !== similarRequestSeq.current) return;
        setSimilarResults(data.similares || []);
        setBaseRadar(data.baseRadar || []);
        setLoadingSimilar(false);
      })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        if (requestId !== similarRequestSeq.current) return;
        setLoadingSimilar(false);
      });

    return () => controller.abort();
  }, [similarPlayer, filters]);

  // Navega para comparação pré-selecionando jogador base + similar
  function handleCompareFromSimilar(similarId) {
    setPlayerA(similarPlayer);
    setPlayerB(similarId);
    setCompareData(null);
    setAiReport(null);
    setFollowUp('');
    setFollowUpAnswer(null);
    setView('compare');
    setAutoCompare(true);
  }

  const pA = getPlayer(playerA);
  const pB = getPlayer(playerB);

  return (
    <div className={styles.layout}>
      <Header view={view} setView={setView} />
      <FilterBar filters={filters} setFilters={setFilters} />

      <main className={styles.main}>

        {/* ============================
            VIEW: COMPARAÇÃO
        ============================ */}
        {view === 'compare' && (
          <div className={styles.page}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Comparação de Jogadores</h1>
                <p className={styles.pageSubtitle}>
                  Selecione dois jogadores para comparar via radar de percentis e análise IA
                </p>
              </div>
              <div className={styles.resultCount}>
                {filteredOptions.length.toLocaleString('pt-BR')} jogadores
              </div>
            </div>

            {/* Seleção */}
            <div className={styles.selectionRow}>
              <div className={styles.selectWrap}>
                <span className={styles.selectLabel} style={{ color: '#1d6ef5' }}>Jogador A</span>
                <PlayerSelect
                  options={filteredOptions}
                  value={playerA}
                  onChange={setPlayerA}
                  placeholder="Buscar jogador A..."
                />
              </div>

              <div className={styles.vsChip}>VS</div>

              <div className={styles.selectWrap}>
                <span className={styles.selectLabel} style={{ color: '#e85d24' }}>Jogador B</span>
                <PlayerSelect
                  options={filteredOptions}
                  value={playerB}
                  onChange={setPlayerB}
                  placeholder="Buscar jogador B..."
                />
              </div>
            </div>

            {/* Ações */}
            <div className={styles.actions}>
              <button
                className={styles.btnPrimary}
                onClick={comparar}
                disabled={!playerA || !playerB || loadingCompare}
              >
                {loadingCompare ? (
                  <><span className={styles.spinner}/> Calculando...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Comparar</>
                )}
              </button>

              <button
                className={styles.btnSecondary}
                onClick={compararComIA}
                disabled={!playerA || !playerB || loadingAI}
              >
                {loadingAI ? (
                  <><span className={styles.spinner}/> Gerando análise...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 8l1.8 1.8L10.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> Análise com IA</>
                )}
              </button>
            </div>

            {/* Resultado */}
            {compareData?.players?.length === 2 && (
              <div className={styles.compareResult}>
                {!aiReport && (
                  <div className={styles.compareLayout}>
                    <PlayerCard player={compareData.players[0]} color="#1d6ef5" />

                    <div className={styles.radarWrap} ref={radarCanvasRef}>
                      <RadarComparison
                        labels={compareData.labels}
                        players={compareData.players}
                      />
                    </div>

                    <PlayerCard player={compareData.players[1]} color="#e85d24" />
                  </div>
                )}

                {aiReport && (
                  <AIReport
                    report={aiReport}
                    playerA={pA?.nome || 'Jogador A'}
                    playerB={pB?.nome || 'Jogador B'}
                    comparePlayers={compareData.players}
                    compareLabels={compareData.labels}
                    followUp={followUp}
                    setFollowUp={setFollowUp}
                    followUpAnswer={followUpAnswer}
                    onAskFollowUp={enviarFollowUp}
                    radarCanvasRef={radarCanvasRef}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================
            VIEW: SIMILARIDADE
        ============================ */}
        {view === 'similar' && (
          <div className={styles.page}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Buscar Jogadores Similares</h1>
                <p className={styles.pageSubtitle}>
                  Selecione um jogador — os resultados atualizam automaticamente conforme os filtros
                </p>
              </div>
            </div>

            <div className={styles.similarSearch}>
              <div style={{ flex: 1 }}>
                <PlayerSelect
                  options={allOptions}
                  value={similarPlayer}
                  onChange={setSimilarPlayer}
                  placeholder="Selecionar jogador base..."
                />
              </div>
              {loadingSimilar && (
                <div className={styles.loadingChip}>
                  <span className={styles.spinner} style={{ borderTopColor: '#1d6ef5', borderColor: '#dde3ef' }}/>
                  Buscando...
                </div>
              )}
            </div>

            {similarResults.length > 0 && (
              <div className={styles.similarResults}>
                <div className={styles.similarHeader}>
                  <span className={styles.similarTarget}>
                    Similares a <strong>{getPlayer(similarPlayer)?.nome}</strong>
                    {(filters.leagues.length > 0 || filters.position || filters.age.min > 15 || filters.age.max < 44) && (
                      <span className={styles.filterNote}> · filtros ativos</span>
                    )}
                  </span>
                  <span className={styles.resultCount}>{similarResults.length} encontrados</span>
                </div>

                <div className={styles.similarList}>
                  {similarResults.map((p, i) => (
                    <SimilarPlayerCard
                      key={p.player_id}
                      player={p}
                      rank={i + 1}
                      baseRadar={baseRadar}
                      onCompare={handleCompareFromSimilar}
                    />
                  ))}
                </div>
              </div>
            )}

            {!loadingSimilar && similarPlayer && similarResults.length === 0 && (
              <div className={styles.emptyState}>
                Nenhum jogador encontrado com os filtros atuais. Tente ampliar os critérios.
              </div>
            )}
          </div>
        )}
        {view === 'scout' && (
          <ScoutMarket filters={filters} setFilters={setFilters} />
        )}

      </main>
    </div>
  );
}