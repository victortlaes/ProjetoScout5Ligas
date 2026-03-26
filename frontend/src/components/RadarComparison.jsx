import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COLORS = [
  { border: '#1d6ef5', bg: 'rgba(29,110,245,0.12)' },
  { border: '#e85d24', bg: 'rgba(232,93,36,0.12)'  },
];

export default function RadarComparison({ labels, players }) {
  if (!players || players.length !== 2) return null;

  const data = {
    labels,
    datasets: players.map((p, i) => ({
      label: p.nome,
      data: p.values,
      backgroundColor: COLORS[i].bg,
      borderColor: COLORS[i].border,
      pointBackgroundColor: COLORS[i].border,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      borderWidth: 2.5,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          backdropColor: 'transparent',
          color: '#8a9ab8',
          font: { family: "'DM Sans', sans-serif", size: 10 },
        },
        grid: { color: '#dde3ef' },
        angleLines: { color: '#dde3ef' },
        pointLabels: {
          color: '#1a3560',
          font: { family: "'DM Sans', sans-serif", size: 12, weight: '600' },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: '#0d1f3c',
          font: { family: "'DM Sans', sans-serif", size: 13 },
        },
      },
      tooltip: {
        backgroundColor: '#0d1f3c',
        titleFont: { family: "'DM Sans', sans-serif", size: 12 },
        bodyFont:  { family: "'DM Sans', sans-serif", size: 13, weight: '600' },
        padding: 10,
        callbacks: {
          label: ctx => `  ${ctx.dataset.label}: ${ctx.raw}`,
        },
      },
    },
  };

  return (
    <div style={{ height: 420, width: '100%', padding: '8px 0' }}>
      <Radar data={data} options={options} />
    </div>
  );
}