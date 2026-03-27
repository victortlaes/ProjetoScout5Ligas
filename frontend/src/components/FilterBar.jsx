import { useState } from 'react';
import { ALL_LEAGUES } from '../utils/leagueMap';
import Flag from 'react-world-flags';
import styles from './FilterBar.module.css';

const POSITIONS = [
  { value: '',  label: 'Todas as posições' },
  { value: 'F', label: 'Atacante' },
  { value: 'M', label: 'Meia' },
  { value: 'D', label: 'Defensor' },
];

const LEAGUE_CODE = {
  'Brasileirão Série A': 'BRA',
  'Liga Profesional Argentina': 'ARG',
  'Dimayor Colombia': 'COL',
  'Liga MX': 'MEX',
  'MLS': 'USA',
};

export default function FilterBar({ filters, setFilters }) {
  const [ageOpen, setAgeOpen] = useState(false);

  function toggleLeague(liga) {
    setFilters(f => {
      const cur = f.leagues;
      const next = cur.includes(liga)
        ? cur.filter(l => l !== liga)
        : [...cur, liga];
      return { ...f, leagues: next };
    });
  }

  function setPos(pos) {
    setFilters(f => ({ ...f, position: pos }));
  }

  function setAge(key, val) {
    setFilters(f => ({ ...f, age: { ...f.age, [key]: Number(val) } }));
  }

  const activeCount =
    filters.leagues.length +
    (filters.position ? 1 : 0) +
    (filters.age.min > 15 || filters.age.max < 44 ? 1 : 0);

  function clearAll() {
    setFilters({ leagues: [], position: '', age: { min: 15, max: 44 } });
  }

  return (
    <div className={styles.bar}>
      {/* Liga */}
      <div className={styles.group}>
        <span className={styles.label}>Liga</span>
        <div className={styles.pills}>
          {ALL_LEAGUES.map(liga => (
            <button
              key={liga}
              className={`${styles.pill} ${filters.leagues.includes(liga) ? styles.active : ''}`}
              onClick={() => toggleLeague(liga)}
            >
              <span className={styles.flag}>
                <Flag
                  code={LEAGUE_CODE[liga]}
                  height="12"
                  style={{ borderRadius: 2 }}
                  fallback={<span className={styles.flagFallback}>{LEAGUE_CODE[liga]}</span>}
                />
              </span>
              {liga}
            </button>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className={styles.divider} />

      {/* Posição */}
      <div className={styles.group}>
        <span className={styles.label}>Posição</span>
        <div className={styles.pills}>
          {POSITIONS.map(p => (
            <button
              key={p.value}
              className={`${styles.pill} ${filters.position === p.value ? styles.active : ''}`}
              onClick={() => setPos(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className={styles.divider} />

      {/* Idade */}
      <div className={styles.group}>
        <span className={styles.label}>Idade</span>
        <div className={styles.ageRow}>
          <div className={styles.ageInput}>
            <input
              type="number"
              min={15}
              max={filters.age.max}
              value={filters.age.min}
              onChange={e => setAge('min', e.target.value)}
            />
            <span>mín</span>
          </div>
          <span className={styles.ageDash}>—</span>
          <div className={styles.ageInput}>
            <input
              type="number"
              min={filters.age.min}
              max={44}
              value={filters.age.max}
              onChange={e => setAge('max', e.target.value)}
            />
            <span>máx</span>
          </div>
        </div>
      </div>

      {/* Limpar */}
      {activeCount > 0 && (
        <>
          <div className={styles.divider} />
          <button className={styles.clear} onClick={clearAll}>
            Limpar filtros
            <span className={styles.badge}>{activeCount}</span>
          </button>
        </>
      )}
    </div>
  );
}