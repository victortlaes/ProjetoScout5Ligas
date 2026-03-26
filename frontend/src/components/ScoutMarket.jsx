import { useState, useEffect, useCallback } from 'react';
import { getLeague, LEAGUE_FLAGS, ALL_LEAGUES } from '../utils/leagueMap';
import Flag from 'react-world-flags';
import styles from './ScoutMarket.module.css';

const DIMENSIONS = [
  { key: 'finalizacao', label: 'Finalização' },
  { key: 'criacao',     label: 'Criação'     },
  { key: 'passe',       label: 'Passe'       },
  { key: 'progressao',  label: 'Progressão'  },
  { key: 'duelo',       label: 'Duelo'       },
  { key: 'defesa',      label: 'Defesa'      },
];

const POSITION_OPTIONS = [
  { value: '',  label: 'Todas' },
  { value: 'F', label: 'Atacante' },
  { value: 'M', label: 'Meia'     },
  { value: 'D', label: 'Defensor' },
];

const POSITION_COLOR = { F: '#e53e3e', M: '#1d6ef5', D: '#2f855a' };
const LEAGUE_CODE    = { 'Brasileirão Série A': 'BRA', 'Liga Profesional Argentina': 'ARG', 'Dimayor Colombia': 'COL', 'Liga MX': 'MEX', 'MLS': 'USA' };

const DEFAULT_PERCENTILS = Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));

// ——— PercentilInput ———
function PercentilInput({ label, value, onChange }) {
  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  function handleInput(e) {
    const raw = e.target.value.replace(/\D/g, '');
    onChange(clamp(raw === '' ? 0 : Number(raw)));
  }

  function step(delta) { onChange(clamp(value + delta)); }

  const pct = value;
  const barColor = pct >= 70 ? '#2f855a' : pct >= 40 ? '#1d6ef5' : '#c9a84c';

  return (
    <div className={styles.percentilRow}>
      <span className={styles.dimLabel}>{label}</span>

      <div className={styles.inputWrap}>
        <button className={styles.stepBtn} onClick={() => step(-5)} tabIndex={-1}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 6.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={handleInput}
          className={styles.percentilInputField}
        />
        <button className={styles.stepBtn} onClick={() => step(5)} tabIndex={-1}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <span className={styles.pctSign}>%</span>
      </div>

      <div className={styles.miniBar}>
        <div className={styles.miniBarFill} style={{ width: `${pct}%`, background: barColor }}/>
      </div>
    </div>
  );
}

// ——— MarketValueSlider ———
function MarketValueSlider({ maxValue, onChange }) {
  const steps = [0, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 82_000_000];

  function fmt(v) {
    if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
    if (v > 0) return `€${(v / 1000).toFixed(0)}k`;
    return 'Sem limite';
  }

  const idx = steps.indexOf(maxValue) === -1 ? steps.length - 1 : steps.indexOf(maxValue);

  return (
    <div className={styles.sliderWrap}>
      <div className={styles.sliderHeader}>
        <span className={styles.sliderLabel}>Valor máximo de mercado</span>
        <span className={styles.sliderValue}>{fmt(maxValue) === 'Sem limite' ? '—' : fmt(maxValue)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        step={1}
        value={idx}
        onChange={e => onChange(steps[Number(e.target.value)])}
        className={styles.slider}
      />
      <div className={styles.sliderTicks}>
        <span>€0</span>
        <span>€1M</span>
        <span>€5M</span>
        <span>€20M</span>
        <span>€82M</span>
      </div>
    </div>
  );
}

// ——— ResultCard ———
function ResultCard({ player, rank, radarValues, radarLabels }) {
  const liga = getLeague(player.time);
  const posColor = POSITION_COLOR[player.posicao] || '#8a9ab8';
  const valor = player.valor_mercado
    ? player.valor_mercado >= 1_000_000
      ? `€${(player.valor_mercado / 1_000_000).toFixed(1)}M`
      : `€${(player.valor_mercado / 1000).toFixed(0)}k`
    : '—';

  const score = radarValues
    ? Math.round(radarValues.reduce((a, b) => a + b, 0) / radarValues.length)
    : null;

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultRank}>#{rank}</div>

      <img
        src={player.url_foto}
        alt={player.nome}
        className={styles.resultPhoto}
        onError={e => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.nome)}&background=e8f0fe&color=1d6ef5&size=80`;
        }}
      />

      <div className={styles.resultInfo}>
        <div className={styles.resultName}>{player.nome}</div>
        <div className={styles.resultMeta}>
          <span className={styles.posBadge} style={{ background: posColor + '18', color: posColor }}>
            {player.posicao === 'F' ? 'ATA' : player.posicao === 'M' ? 'MEI' : 'DEF'}
          </span>
          <span>{player.time}</span>
          <span className={styles.dot}>·</span>
          <Flag code={LEAGUE_CODE[liga]} height="11" style={{ borderRadius: 2 }} fallback={<span className={styles.flagFallback}>{LEAGUE_CODE[liga]}</span>}/>
          <span>{liga}</span>
        </div>
        {radarValues && (
          <div className={styles.miniRadar}>
            {radarLabels.map((l, i) => (
              <div key={l} className={styles.miniRadarItem}>
                <span className={styles.miniRadarLabel}>{l.slice(0, 3)}</span>
                <div className={styles.miniRadarBar}>
                  <div
                    className={styles.miniRadarFill}
                    style={{
                      width: `${radarValues[i]}%`,
                      background: radarValues[i] >= 70 ? '#2f855a' : radarValues[i] >= 40 ? '#1d6ef5' : '#c9a84c'
                    }}
                  />
                </div>
                <span className={styles.miniRadarVal}>{radarValues[i]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.resultRight}>
        <div className={styles.resultScore} style={{ color: score >= 70 ? '#2f855a' : score >= 40 ? '#1d6ef5' : '#c9a84c' }}>
          {score ?? '—'}
          <span>avg</span>
        </div>
        <div className={styles.resultValue}>{valor}</div>
        <div className={styles.resultMinutes}>{player.minutesPlayed?.toLocaleString('pt-BR')} min</div>
      </div>
    </div>
  );
}

// ——— ScoutMarket principal ———
export default function ScoutMarket({ filters, setFilters }) {
  const [percentils, setPercentils]   = useState(DEFAULT_PERCENTILS);
  const [maxMarket,  setMaxMarket]    = useState(82_000_000);
  const [results,    setResults]      = useState([]);
  const [loading,    setLoading]      = useState(false);
  const [searched,   setSearched]     = useState(false);

  // Filtros de liga/posição/idade herdados do FilterBar global
  const { leagues, position, age } = filters;

  const runSearch = useCallback(() => {
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    DIMENSIONS.forEach(d => { if (percentils[d.key] > 0) params.set(d.key, percentils[d.key]); });
    if (maxMarket < 82_000_000) params.set('maxMarket', maxMarket);
    if (leagues.length > 0)     params.set('leagues',   leagues.join(','));
    if (position)                params.set('position',  position);
    if (age.min > 15)            params.set('ageMin',    age.min);
    if (age.max < 44)            params.set('ageMax',    age.max);

    fetch(`http://localhost:3001/scout-market?${params}`)
      .then(r => r.json())
      .then(data => { setResults(data.results || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [percentils, maxMarket, leagues, position, age]);

  // Re-busca automática quando filtros globais mudam (se já buscou antes)
  useEffect(() => {
    if (searched) runSearch();
  }, [leagues, position, age]);

  function updatePercentil(key, val) {
    setPercentils(p => ({ ...p, [key]: val }));
  }

  function resetPercentils() {
    setPercentils(DEFAULT_PERCENTILS);
    setMaxMarket(82_000_000);
  }

  const hasActivePercentils = Object.values(percentils).some(v => v > 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Scout de Mercado</h1>
          <p className={styles.pageSubtitle}>
            Defina o perfil ideal por percentis e encontre os jogadores que mais se encaixam
          </p>
        </div>
        {hasActivePercentils && (
          <button className={styles.resetBtn} onClick={resetPercentils}>Limpar critérios</button>
        )}
      </div>

      <div className={styles.mainLayout}>
        {/* ——— PAINEL DE CRITÉRIOS ——— */}
        <div className={styles.criteriaPanel}>
          <div className={styles.panelSection}>
            <div className={styles.sectionTitle}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#1d6ef5" strokeWidth="1.2"/>
                <path d="M4 7l2.5 2.5L10 4.5" stroke="#1d6ef5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Perfil mínimo por dimensão
            </div>
            <p className={styles.sectionHint}>Percentil mínimo (0 = sem filtro)</p>

            {DIMENSIONS.map(d => (
              <PercentilInput
                key={d.key}
                label={d.label}
                value={percentils[d.key]}
                onChange={val => updatePercentil(d.key, val)}
              />
            ))}
          </div>

          <div className={styles.panelSection}>
            <div className={styles.sectionTitle}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2v10" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Valor de mercado
            </div>
            <MarketValueSlider maxValue={maxMarket} onChange={setMaxMarket} />
          </div>

          <button
            className={styles.searchBtn}
            onClick={runSearch}
            disabled={loading}
          >
            {loading
              ? <><span className={styles.spinner}/> Buscando...</>
              : <><svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> Buscar jogadores</>
            }
          </button>
        </div>

        {/* ——— RESULTADOS ——— */}
        <div className={styles.resultsPanel}>
          {!searched && (
            <div className={styles.emptyPrompt}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity=".25">
                <circle cx="21" cy="21" r="14" stroke="#0d1f3c" strokeWidth="2"/>
                <path d="M31 31l10 10" stroke="#0d1f3c" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 21h12M21 15v12" stroke="#0d1f3c" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>Defina os critérios ao lado e clique em <strong>Buscar jogadores</strong></p>
              <p className={styles.emptyHint}>Use os filtros de liga, posição e idade na barra superior para refinar</p>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className={styles.emptyPrompt}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity=".25">
                <circle cx="20" cy="20" r="17" stroke="#0d1f3c" strokeWidth="2"/>
                <path d="M13 27s3-4 7-4 7 4 7 4M15 15h.5M25 15h.5" stroke="#0d1f3c" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>Nenhum jogador encontrou todos os critérios.</p>
              <p className={styles.emptyHint}>Tente reduzir os percentis mínimos ou ampliar os filtros de liga/posição.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>
                  Top {results.length} jogadores encontrados
                </span>
                {(leagues.length > 0 || position || age.min > 15 || age.max < 44) && (
                  <span className={styles.filterNote}>· filtros ativos</span>
                )}
              </div>
              <div className={styles.resultsList}>
                {results.map((r, i) => (
                  <ResultCard
                    key={r.player_id}
                    player={r}
                    rank={i + 1}
                    radarValues={r.radarValues}
                    radarLabels={['Fin', 'Cri', 'Pas', 'Pro', 'Due', 'Def']}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}