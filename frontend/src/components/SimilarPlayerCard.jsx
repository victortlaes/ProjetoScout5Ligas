import { useState } from 'react';
import { getLeague, LEAGUE_FLAGS } from '../utils/leagueMap';
import Flag from 'react-world-flags';
import styles from './SimilarPlayerCard.module.css';

const POSITION_LABEL = { F: 'Atacante', M: 'Meia', D: 'Defensor', G: 'Goleiro' };
const POSITION_COLOR = { F: '#e53e3e', M: '#1d6ef5', D: '#2f855a', G: '#d69e2e' };
const LEAGUE_CODE    = { 'Brasileirão Série A': 'BRA', 'Liga Profesional Argentina': 'ARG', 'Dimayor Colombia': 'COL', 'Liga MX': 'MEX', 'MLS': 'USA' };

const DIM_LABELS = ['FIN', 'CRI', 'PAS', 'PRO', 'DUE', 'DEF'];
const DIM_FULL   = ['Finalização', 'Criação', 'Passe', 'Progressão', 'Duelo', 'Defesa'];

function SimilarityRing({ pct }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = pct >= 80 ? '#2f855a' : pct >= 65 ? '#1d6ef5' : '#c9a84c';
  return (
    <div className={styles.ring}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#dde3ef" strokeWidth="3"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" transform="rotate(-90 28 28)"/>
      </svg>
      <span className={styles.ringValue} style={{ color }}>{pct}%</span>
    </div>
  );
}

function PercentilChip({ label, fullLabel, similarVal, baseVal }) {
  const diff = similarVal - baseVal;
  const better = diff > 0;
  const equal = diff === 0;
  const tone = equal ? 'equal' : better ? 'up' : 'down';

  return (
    <div className={`${styles.pctChip} ${styles[`pctChip_${tone}`]}`} title={fullLabel}>
      <span className={styles.pctDelta}>
        <span className={styles.pctArrow} aria-hidden="true">
          {equal ? (
            <span className={styles.pctArrowEqual}>—</span>
          ) : better ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 9V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v7M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
        <span>
          {equal ? '0' : diff > 0 ? `+${diff}` : `${diff}`}
        </span>
      </span>
      <span className={styles.pctValue}>{similarVal}</span>
      <span className={styles.pctLabel}>{label}</span>
    </div>
  );
}

export default function SimilarPlayerCard({ player, rank, baseRadar, onCompare }) {
  const [expanded, setExpanded] = useState(false);
  const liga     = getLeague(player.time);
  const posColor = POSITION_COLOR[player.posicao] || '#1d6ef5';
  const hasRadar = player.radar && baseRadar && player.radar.length === 6 && baseRadar.length === 6;

  return (
    <div className={`${styles.card} ${expanded ? styles.expanded : ''}`}>
      <div className={styles.mainRow}>
        <div className={styles.rank}>#{rank}</div>
        <img src={player.url_foto} alt={player.nome} className={styles.photo}
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.nome)}&background=e8f0fe&color=1d6ef5&size=80`; }}/>
        <div className={styles.info}>
          <div className={styles.name}>{player.nome}</div>
          <div className={styles.meta}>
            <span className={styles.posBadge} style={{ background: posColor + '18', color: posColor }}>
              {POSITION_LABEL[player.posicao]}
            </span>
            <span>{player.time}</span>
            <span className={styles.dot}>·</span>
            <Flag code={LEAGUE_CODE[liga]} height="11" style={{ borderRadius: 2 }}
              fallback={<span className={styles.leagueBadge}>{LEAGUE_FLAGS[liga]}</span>}/>
            <span>{liga}</span>
          </div>
        </div>
        <SimilarityRing pct={player.similaridade} />
        {hasRadar && (
          <button
            className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ''}`}
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Fechar' : 'Ver comparação de percentis'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {expanded && hasRadar && (
        <div className={styles.expandPanel}>
          <div className={styles.simpleCompare}>
            <div className={styles.simplePctList} aria-label="Comparação de percentis">
              {DIM_LABELS.map((label, i) => (
                <PercentilChip
                  key={label}
                  label={label}
                  fullLabel={DIM_FULL[i]}
                  baseVal={baseRadar[i]}
                  similarVal={player.radar[i]}
                />
              ))}
            </div>

            <button className={styles.compareBtnRight} onClick={() => onCompare(player.player_id)}>
              Comparar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}