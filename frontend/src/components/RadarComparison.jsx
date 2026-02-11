import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

import { Radar } from 'react-chartjs-2'; // ✅ ESSENCIAL

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarComparison({ labels, players }) {
  if (!players || players.length !== 2) return null;

  const data = {
    labels,
    datasets: [
      {
        label: players[0].nome,
        data: players[0].values,
        backgroundColor: 'rgba(54, 162, 235, 0.25)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2
      },
      {
        label: players[1].nome,
        data: players[1].values,
        backgroundColor: 'rgba(255, 159, 64, 0.25)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 permite controlar tamanho
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div style={{ height: 500 }}>
      <Radar data={data} options={options} />
    </div>
  );
}
