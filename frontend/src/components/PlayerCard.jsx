import { resolveBirthCountryCode, resolveBirthCountryName } from '../utils/countryFlag';
import Flag from 'react-world-flags';
import styles from './PlayerCard.module.css';

const POSITION_COLOR = { F: '#e53e3e', M: '#1d6ef5', D: '#2f855a', G: '#d69e2e' };

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
  const posColor = POSITION_COLOR[player.posicao] || color;
  const birthCountryCode = resolveBirthCountryCode(player);
  const birthCountryName = resolveBirthCountryName(player);

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

          {/* Linha 1: Time */}
          <div className={styles.meta}>
            <span>{player.time}</span>
          </div>

          {/* Linha 2: País */}
          <div className={styles.country}>
            {birthCountryCode ? (
              <Flag code={birthCountryCode} height="11" style={{ borderRadius: 2 }} />
            ) : (
              <span className={styles.country}>{birthCountryName || '—'}</span>
            )}
            <span>{birthCountryName || player.nacionalidade || 'Sem país informado'}</span>
          </div>

          {player.idade && Number(player.idade) > 0 && (
            <div className={styles.age}>{player.idade} anos</div>
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