import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoundResult, BestScores, GlobalStats } from '../types';

const KEYS = {
  HISTORY:     'spencer_history',
  BEST_SCORES: 'spencer_best_scores',
  STATS:       'spencer_stats',
};

export async function guardarResultado(result: RoundResult): Promise<void> {
  const history = await obtenerHistorial();
  history.push(result);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));

  const key = `${result.difficulty}_${result.mode}`;
  const best = await obtenerMejoresPuntajes();
  if (!best[key] || result.score > best[key]) {
    best[key] = result.score;
    await AsyncStorage.setItem(KEYS.BEST_SCORES, JSON.stringify(best));
  }

  const stats = await obtenerEstadisticas();
  stats.totalRoundsPlayed += 1;
  stats.totalCorrect     += result.correctAnswers;
  stats.totalIncorrect   += result.incorrectAnswers;
  stats.totalUnanswered  += result.unanswered;
  stats.totalScore       += result.score;
  await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
}

export async function obtenerHistorial(): Promise<RoundResult[]> {
  const raw = await AsyncStorage.getItem(KEYS.HISTORY);
  if (!raw) return [];
  const parsed: RoundResult[] = JSON.parse(raw);
  // Compatibilidad: registros viejos sin playerName reciben un valor por defecto
  return parsed.map((r) => ({ ...r, playerName: r.playerName ?? 'Jugador' }));
}

export async function obtenerMejoresPuntajes(): Promise<BestScores> {
  const raw = await AsyncStorage.getItem(KEYS.BEST_SCORES);
  return raw ? JSON.parse(raw) : {};
}

export async function obtenerEstadisticas(): Promise<GlobalStats> {
  const raw = await AsyncStorage.getItem(KEYS.STATS);
  return raw
    ? JSON.parse(raw)
    : { totalRoundsPlayed: 0, totalCorrect: 0, totalIncorrect: 0, totalUnanswered: 0, totalScore: 0 };
}

export async function reiniciarDatos(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEYS.HISTORY),
    AsyncStorage.removeItem(KEYS.BEST_SCORES),
    AsyncStorage.removeItem(KEYS.STATS),
  ]);
}
