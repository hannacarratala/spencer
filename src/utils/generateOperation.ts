import { Difficulty, GameMode, Operation } from '../types';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Genera una operación base según dificultad
function buildOperation(difficulty: Difficulty): { question: string; answer: number } {
  let a: number, b: number, op: string, answer: number;

  if (difficulty === 'easy') {
    a = rand(1, 20);
    b = rand(1, 20);
    op = Math.random() < 0.5 ? '+' : '-';
    answer = op === '+' ? a + b : a - b;
  } else if (difficulty === 'medium') {
    const ops = ['+', '-', '*'];
    op = ops[rand(0, 2)];
    a = rand(1, 50);
    b = rand(1, op === '*' ? 12 : 50);
    answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  } else {
    const ops = ['+', '-', '*', '/'];
    op = ops[rand(0, 3)];
    if (op === '/') {
      b = rand(2, 10);
      answer = rand(1, 10);
      a = b * answer; // división exacta
    } else {
      a = rand(1, 100);
      b = rand(1, op === '*' ? 12 : 100);
      answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    }
  }

  const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op;
  return { question: `${a} ${opSymbol} ${b}`, answer };
}

// Genera distractores para múltiple choice
function buildDistractors(correct: number, count: number): number[] {
  const distractors = new Set<number>();
  const offsets = [-3, -2, -1, 1, 2, 3, -5, 5, -10, 10];
  const shuffled = shuffle(offsets);

  for (const d of shuffled) {
    const val = correct + d;
    if (val !== correct && !distractors.has(val)) {
      distractors.add(val);
      if (distractors.size === count) break;
    }
  }

  // Completar con aleatorios si faltan
  while (distractors.size < count) {
    const val = correct + rand(-15, 15);
    if (val !== correct) distractors.add(val);
  }

  return Array.from(distractors).slice(0, count);
}

export function generateOperation(difficulty: Difficulty, mode: GameMode): Operation {
  const { question, answer } = buildOperation(difficulty);

  if (mode === 'classic' || mode === 'timeAttack') {
    return { question, correctAnswer: answer };
  }

  if (mode === 'trueFalse') {
    const showCorrect = Math.random() < 0.5;
    const displayAnswer = showCorrect ? answer : answer + (Math.random() < 0.5 ? rand(1, 5) : -rand(1, 5));
    return {
      question,
      correctAnswer: answer,
      displayAnswer,
      isTrue: showCorrect,
    };
  }

  if (mode === 'multipleChoice') {
    const distractors = buildDistractors(answer, 3);
    const allOptions = shuffle([answer, ...distractors]);
    return {
      question,
      correctAnswer: answer,
      options: allOptions,
      correctIndex: allOptions.indexOf(answer),
    };
  }

  return { question, correctAnswer: answer };
}
