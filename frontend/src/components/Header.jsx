import styles from './Header.module.css';

export default function Header({ view, setView }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#1d6ef5" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="8"  stroke="#1d6ef5" strokeWidth="1" strokeDasharray="2 2"/>
            <circle cx="14" cy="14" r="3"  fill="#1d6ef5"/>
            <line x1="14" y1="1"  x2="14" y2="7"  stroke="#1d6ef5" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="21" x2="14" y2="27" stroke="#1d6ef5" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1"  y1="14" x2="7"  y2="14" stroke="#1d6ef5" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="21" y1="14" x2="27" y2="14" stroke="#1d6ef5" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className={styles.brandName}>Radar<strong>FC</strong></span>
      </div>

      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${view === 'compare' ? styles.active : ''}`}
          onClick={() => setView('compare')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="4" width="6" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="9" y="2" width="6" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Comparação
        </button>
        <button
          className={`${styles.navBtn} ${view === 'similar' ? styles.active : ''}`}
          onClick={() => setView('similar')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Similaridade
        </button>
        <button
          className={`${styles.navBtn} ${view === 'scout' ? styles.active : ''}`}
          onClick={() => setView('scout')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          Scout de Mercado
        </button>
      </nav>

      <div className={styles.badge}>
        <span>5 ligas</span>
        <span className={styles.dot}/>
        <span>3.5k+ jogadores</span>
      </div>
    </header>
  );
}