// Calcula los puntos para una respuesta según las reglas del juego
export function calcularPuntos(
  correct: boolean | null,
  responseTime: number,
  maxTime: number
): number {
  if (correct === null) return -50; // sin respuesta
  if (!correct) return -30;        // incorrecta
  // correcta: rápida o dentro del tiempo
  return responseTime < maxTime * 0.75 ? 100 : 70;
}

// Tiempo máximo en ms por dificultad
export function tiempoMaximoPorDificultad(difficulty: string): number {
  if (difficulty === 'easy') return 8000;
  if (difficulty === 'medium') return 12000;
  return 18000;
}

// Tiempo total del modo contra reloj
export function tiempoTotalTimeAttack(difficulty: string): number {
  if (difficulty === 'easy') return 60000;
  if (difficulty === 'medium') return 90000;
  return 120000;
}
