import { getLeague, LEAGUE_FLAGS } from '../utils/leagueMap';
import Flag from 'react-world-flags';
import styles from './SimilarPlayerCard.module.css';

const POSITION_LABEL = { F: 'Atacante', M: 'Meia', D: 'Defensor', G: 'Goleiro' };
const POSITION_COLOR = { F: '#e53e3e', M: '#1d6ef5', D: '#2f855a', G: '#d69e2e' };
const LEAGUE_CODE    = { 'Brasileirão Série A': 'BRA', 'Liga Profesional Argentina': 'ARG', 'Dimayor Colombia': 'COL', 'Liga MX': 'MEX', 'MLS': 'USA' };

function SimilarityRing({ pct }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = pct >= 80 ? '#2f855a' : pct >= 65 ? '#1d6ef5' : '#c9a84c';

  return (
    <div className={styles.ring}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#dde3ef" strokeWidth="3"/>
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span className={styles.ringValue} style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function SimilarPlayerCard({ player, rank }) {
  const liga = getLeague(player.time);
  const posColor = POSITION_COLOR[player.posicao] || '#1d6ef5';

  return (
    <div className={styles.card}>
      <div className={styles.rank}>#{rank}</div>

      <img
        src={player.url_foto}
        alt={player.nome}
        className={styles.photo}
        onError={e => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.nome)}&background=e8f0fe&color=1d6ef5&size=80`;
        }}
      />

      <div className={styles.info}>
        <div className={styles.name}>{player.nome}</div>
        <div className={styles.meta}>
          <span className={styles.posBadge} style={{ background: posColor + '18', color: posColor }}>
            {POSITION_LABEL[player.posicao]}
          </span>
          <span>{player.time}</span>
          <span className={styles.dot}>·</span>
          <Flag code={LEAGUE_CODE[liga]} height="11" style={{ borderRadius: 2 }} fallback={<span className={styles.leagueBadge}>{LEAGUE_FLAGS[liga]}</span>}/>
          <span>{liga}</span>
        </div>
      </div>

      <SimilarityRing pct={player.similaridade} />
    </div>
  );
}