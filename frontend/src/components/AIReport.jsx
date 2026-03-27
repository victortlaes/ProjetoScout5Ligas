import { useRef } from 'react';
import PlayerCard from './PlayerCard';
import RadarComparison from './RadarComparison';
import styles from './AIReport.module.css';

export default function AIReport({
  report,
  playerA,
  playerB,
  comparePlayers = [],
  compareLabels = [],
  followUp,
  setFollowUp,
  followUpAnswer,
  onAskFollowUp,
  radarCanvasRef
}) {
  const reportRef = useRef(null);

  function fmtMarketValue(value) {
    const n = Number(value) || 0;
    if (!n) return '—';
    if (n >= 1_000_000) return `€ ${(n / 1_000_000).toFixed(1)}M`;
    return `€ ${(n / 1_000).toFixed(0)}k`;
  }

  function exportPDF() {
    // Captura o canvas do radar como imagem base64
    let radarImgTag = '';
    if (radarCanvasRef?.current) {
      try {
        const canvas = radarCanvasRef.current.querySelector('canvas');
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          radarImgTag = `
            <div class="radar-section">
              <h2>Radar de Percentis</h2>
              <div class="radar-wrap">
                <img src="${dataUrl}" alt="Radar de comparação" class="radar-img"/>
              </div>
            </div>
          `;
        }
      } catch (e) {
        console.warn('Não foi possível capturar o radar:', e);
      }
    }

    const playerCardsTag = comparePlayers?.length === 2
      ? `
        <div class="cards-grid">
          ${comparePlayers.map((p, idx) => `
            <div class="player-card">
              <div class="pc-head">
                <img class="pc-photo" src="${p.url_foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome || `Jogador ${idx + 1}`)}&background=e8f0fe&color=1d6ef5&size=120`}" alt="${p.nome || `Jogador ${idx + 1}`}" />
                <div>
                  <div class="pc-name">${p.nome || `Jogador ${idx + 1}`}</div>
                  <div class="pc-meta">${p.time || '—'} · ${p.posicao || '—'}</div>
                </div>
              </div>
              <div class="pc-stats">
                <div><span>Idade:</span> ${p.idade || '—'}</div>
                <div><span>Minutos:</span> ${Number(p.minutesPlayed || 0).toLocaleString('pt-BR') || '—'}</div>
                <div><span>Gols:</span> ${p.goals ?? '—'}</div>
                <div><span>Assistências:</span> ${p.goalAssist ?? '—'}</div>
                <div><span>Valor:</span> ${fmtMarketValue(p.valor_mercado)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const printContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Radar FC — ${playerA} vs ${playerB}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; color: #0d1f3c; background: #fff; padding: 48px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #0d1f3c; }
          .brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #0d1f3c; }
          .brand span { color: #1d6ef5; }
          .date { font-size: 12px; color: #8a9ab8; }
          .matchup { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 32px; color: #0d1f3c; }
          .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0 0 22px; }
          .player-card { border: 1px solid #dde3ef; border-radius: 12px; padding: 14px; background: #f8fafe; }
          .pc-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
          .pc-photo { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 1px solid #d5dfef; }
          .pc-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #0d1f3c; line-height: 1.1; }
          .pc-meta { font-size: 12px; color: #607193; margin-top: 2px; }
          .pc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; font-size: 12px; color: #2d3748; }
          .pc-stats span { color: #607193; font-weight: 500; }
          .radar-section { margin: 28px 0; }
          .radar-section h2 { font-size: 17px; font-weight: 600; color: #1a3560; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px solid #dde3ef; }
          .radar-wrap { display: flex; justify-content: center; background: #f4f6fa; border-radius: 12px; padding: 24px; }
          .radar-img { max-width: 420px; width: 100%; }
          h1 { font-size: 20px; font-weight: 700; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1.5px solid #dde3ef; color: #0d1f3c; }
          h2 { font-size: 17px; font-weight: 600; margin: 22px 0 8px; color: #1a3560; }
          ul { padding-left: 20px; margin: 8px 0; }
          li { margin-bottom: 10px; font-size: 14px; line-height: 1.7; color: #2d3748; }
          p { font-size: 14px; line-height: 1.8; color: #2d3748; padding: 14px 16px; background: #f4f6fa; border-left: 3px solid #1d6ef5; border-radius: 4px; margin: 10px 0; }
          .followup { margin-top: 40px; padding-top: 24px; border-top: 1px dashed #dde3ef; }
          .followup h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #8a9ab8; text-transform: uppercase; letter-spacing: 0.05em; }
          .footer { margin-top: 48px; font-size: 11px; color: #8a9ab8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Radar<span>FC</span></div>
          <div class="date">Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div class="matchup">${playerA} <span style="color:#8a9ab8;font-weight:300">vs</span> ${playerB}</div>
        ${playerCardsTag}
        ${radarImgTag}
        ${report.replace(/```html|```/g, '').trim()}
        ${followUpAnswer ? `
          <div class="followup">
            <h3>Pergunta adicional</h3>
            <p style="background:#fff3cd;border-left-color:#c9a84c"><strong>Pergunta:</strong> ${followUp || '—'}</p>
            ${followUpAnswer.replace(/```html|```/g, '').trim()}
          </div>
        ` : ''}
        <div class="footer">Relatório gerado por Radar FC · Dados: Sofascore · Análise: IA</div>
      </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.aiChip}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#1d6ef5" strokeWidth="1.2"/>
              <path d="M4.5 7l1.8 1.8L9.5 5" stroke="#1d6ef5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Análise gerada por IA
          </div>
          <span className={styles.matchup}>{playerA} vs {playerB}</span>
        </div>
        <button className={styles.exportBtn} onClick={exportPDF}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1v8m0 0L5 6.5m2.5 2.5L10 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 10v2.5A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Visual comparação */}
      {comparePlayers?.length === 2 && compareLabels?.length > 0 && (
        <div className={styles.compareLayout}>
          <PlayerCard player={comparePlayers[0]} color="#1d6ef5" />
          <div className={styles.radarWrap} ref={radarCanvasRef}>
            <RadarComparison labels={compareLabels} players={comparePlayers} compact />
          </div>
          <PlayerCard player={comparePlayers[1]} color="#e85d24" />
        </div>
      )}

      {/* Relatório */}
      <div
        ref={reportRef}
        className={styles.reportBody}
        dangerouslySetInnerHTML={{
          __html: report.replace(/```html/g, '').replace(/```/g, '').trim()
        }}
      />

      {/* Follow-up */}
      <div className={styles.followup}>
        <p className={styles.followupTitle}>Tem alguma dúvida sobre a análise?</p>
        <div className={styles.followupInput}>
          <textarea
            maxLength={300}
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
            placeholder="Ex: O jogador A seria uma boa reposição para o jogador B?"
            rows={2}
          />
          <div className={styles.followupActions}>
            <span className={styles.charCount}>{followUp.length}/300</span>
            <button
              onClick={onAskFollowUp}
              disabled={!followUp.trim()}
              className={styles.askBtn}
            >
              Perguntar
            </button>
          </div>
        </div>

        {followUpAnswer && (
          <div
            className={styles.followupAnswer}
            dangerouslySetInnerHTML={{
              __html: followUpAnswer.replace(/```html|```/g, '').trim()
            }}
          />
        )}
      </div>
    </div>
  );
}