export default function PlayerCard({ player }) {
  if (!player) return null;

  return (
    <div style={{
      width: 220,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <img
        src={player.url_foto}
        alt={player.nome}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: 12
        }}
      />

      <strong>{player.nome}</strong>
      <span>{player.time}</span>
      <span>{player.posicao}</span>

      <div style={{ marginTop: 12, fontSize: 13 }}>
        <Stat label="Minutos Jogados: " value={player.minutesPlayed} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

