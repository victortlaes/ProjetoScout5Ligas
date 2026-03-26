import { getLeague, LEAGUE_FLAGS } from '../utils/leagueMap';
import Flag from 'react-world-flags';
import styles from './PlayerCard.module.css';

const POSITION_LABEL = { F: 'Atacante', M: 'Meia', D: 'Defensor', G: 'Goleiro' };
const POSITION_COLOR = { F: '#e53e3e', M: '#1d6ef5', D: '#2f855a', G: '#d69e2e' };
const LEAGUE_CODE    = { 'Brasileirão Série A': 'BRA', 'Liga Profesional Argentina': 'ARG', 'Dimayor Colombia': 'COL', 'Liga MX': 'MEX', 'MLS': 'USA' };

function StatRow({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value ?? '—'}</span>
    </div>
  );
}

export default function PlayerCard({ player, color = '#1d6ef5' }) {
  if (!player) return null;
  const liga = getLeague(player.time);
  const posColor = POSITION_COLOR[player.posicao] || color;

  const valorFormatado = player.valor_mercado
    ? `€ ${(player.valor_mercado / 1_000_000).toFixed(1)}M`
    : '—';

  return (
    <div className={styles.card} style={{ '--player-color': posColor }}>
      {/* Topo neutro — sem cor de fundo */}
      <div className={styles.cardTop}>
        <div className={styles.photoWrap}>
          <img
            src={player.url_foto}
            alt={player.nome}
            className={styles.photo}
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.nome)}&background=e8f0fe&color=1d6ef5&size=120`;
            }}
          />
          <span className={styles.posBadge} style={{ background: posColor }}>
            {player.posicao}
          </span>
        </div>

        <div className={styles.identity}>
          <h3 className={styles.name}>{player.nome}</h3>
          <div className={styles.meta}>
            <span>{player.time}</span>
            <span className={styles.dot}>·</span>
            <Flag code={LEAGUE_CODE[liga]} height="11" style={{ borderRadius: 2 }} fallback={<span className={styles.leagueBadge}>{LEAGUE_FLAGS[liga]}</span>}/>
            <span>{liga}</span>
          </div>
          {player.idade && Number(player.idade) > 0 && (
            <div className={styles.age}>{player.idade} anos · {player.nacionalidade}</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatRow label="Minutos jogados" value={player.minutesPlayed?.toLocaleString('pt-BR')} />
        <StatRow label="Jogos"           value={player.matches} />
        <StatRow label="Gols"            value={player.goals} />
        <StatRow label="Assistências"    value={player.goalAssist} />
        <StatRow label="Valor de mercado" value={valorFormatado} />
        <StatRow label="Altura"          value={player.altura ? `${player.altura} m` : '—'} />
      </div>
    </div>
  );
}