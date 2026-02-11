export default function SimilarPlayerCard({ player }) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        marginBottom: 12,
        display: 'flex',
        overflow: 'hidden', // 🔴 importante para a foto respeitar o retângulo
        alignItems: 'stretch'
      }}
    >
      {/* ===== FOTO ===== */}
      <div
        style={{
          width: 120,
          flexShrink: 0
        }}
      >
        <img
          src={player.url_foto}
          alt={player.nome}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // 🔥 cobre todo o retângulo
            display: 'block'
          }}
        />
      </div>

      {/* ===== INFOS ===== */}
      <div
        style={{
          flex: 1,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <strong>{player.nome}</strong>
        <div style={{ fontSize: 13, color: '#666' }}>
          {player.time} · {player.posicao}
        </div>
      </div>

      {/* ===== SIMILARIDADE ===== */}
      <div
        style={{
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: 18,
          color: '#2e7d32'
        }}
      >
        {player.similaridade}%
      </div>
    </div>
  );
}
