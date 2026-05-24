import { RoundResult } from '../types';

export interface ChartData {
  labels: string[];
  values: number[];
}

// Mejor puntaje por jugador, ordenado de mayor a menor (máx. 8 jugadores para el gráfico)
export function getBestScorePerPlayer(history: RoundResult[]): ChartData {
  const map: Record<string, number> = {};
  for (const r of history) {
    const name = r.playerName || 'Jugador';
    if (map[name] === undefined || r.score > map[name]) {
      map[name] = r.score;
    }
  }
  const sorted = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return {
    labels: sorted.map(([name]) => name),
    values: sorted.map(([, score]) => score),
  };
}
