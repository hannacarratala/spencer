import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { generateOperation } from '../utils/generateOperation';
import { calcularPuntos, tiempoTotalTimeAttack } from '../utils/scoring';
import { Operation, AnswerRecord } from '../types';
import Timer from '../components/Timer';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import colors from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

export default function GameScreen({ navigation, route }: Props) {
  const { config } = route.params;
  const { difficulty, mode, iterations, maxTimeMs } = config;

  const totalTime = tiempoTotalTimeAttack(difficulty);
  const isTimeAttack = mode === 'timeAttack';

  const [questionIndex, setQuestionIndex] = useState(0);
  const [operation,     setOperation]     = useState<Operation>(() => generateOperation(difficulty, mode));
  const [score,         setScore]         = useState(0);
  const [records,       setRecords]       = useState<AnswerRecord[]>([]);
  const [classicInput,  setClassicInput]  = useState('');
  const [timerKey,      setTimerKey]      = useState(0);
  const [timerRunning,  setTimerRunning]  = useState(true);
  const [finished,      setFinished]      = useState(false);
  const [totalRemaining, setTotalRemaining] = useState(totalTime);

  const totalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalStartRef    = useRef(Date.now());
  const questionStartRef = useRef(Date.now());

  useEffect(() => {
    if (!isTimeAttack) return;
    totalStartRef.current = Date.now();
    totalIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - totalStartRef.current;
      const left = Math.max(0, totalTime - elapsed);
      setTotalRemaining(left);
      if (left === 0) { clearInterval(totalIntervalRef.current!); endGame(records); }
    }, 200);
    return () => { if (totalIntervalRef.current) clearInterval(totalIntervalRef.current); };
  }, []);

  function nextQuestion(record: AnswerRecord) {
    const newRecords = [...records, record];
    const newScore   = score + record.points;
    setScore(newScore);
    if (!isTimeAttack && questionIndex + 1 >= iterations) { endGame(newRecords, newScore); return; }
    setRecords(newRecords);
    setQuestionIndex((i) => i + 1);
    setOperation(generateOperation(difficulty, mode));
    setClassicInput('');
    setTimerKey((k) => k + 1);
    setTimerRunning(true);
    questionStartRef.current = Date.now();
  }

  function endGame(finalRecords: AnswerRecord[], finalScore?: number) {
    if (finished) return;
    setFinished(true);
    setTimerRunning(false);
    if (totalIntervalRef.current) clearInterval(totalIntervalRef.current);
    navigation.replace('Results', { config, records: finalRecords, score: finalScore ?? score });
  }

  function handleTimeout() {
    const rt = Date.now() - questionStartRef.current;
    const record: AnswerRecord = { correct: null, responseTime: rt, points: calcularPuntos(null, rt, maxTimeMs) };
    isTimeAttack ? endGame([...records, record]) : nextQuestion(record);
  }

  function handleAnswer(userAnswer: number | boolean) {
    setTimerRunning(false);
    const rt      = Date.now() - questionStartRef.current;
    const correct = mode === 'trueFalse'
      ? (userAnswer as boolean) === operation.isTrue
      : (userAnswer as number) === operation.correctAnswer;
    const points = calcularPuntos(correct, rt, maxTimeMs);
    if (isTimeAttack && !correct) { endGame([...records, { correct, responseTime: rt, points }]); return; }
    nextQuestion({ correct, responseTime: rt, points });
  }

  function handleClassicSubmit() {
    const val = parseInt(classicInput, 10);
    if (isNaN(val)) return;
    handleAnswer(val);
  }

  const displayNum   = isTimeAttack ? records.length + 1 : questionIndex + 1;
  const displayTotal = isTimeAttack ? '∞' : iterations;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{displayNum} / {displayTotal}</Text>
            </View>
            <Text style={styles.scoreText}>{score} pts</Text>
          </View>

          {isTimeAttack && (
            <Text style={styles.totalTimerLabel}>Tiempo: {(totalRemaining / 1000).toFixed(0)}s</Text>
          )}

          <Timer maxMs={maxTimeMs} onExpire={handleTimeout} running={timerRunning} resetKey={timerKey} />

          {/* Operación */}
          <Card style={styles.opCard}>
            <Text style={styles.opText} adjustsFontSizeToFit numberOfLines={1}>
              {mode === 'trueFalse'
                ? `${operation.question} = ${operation.displayAnswer}`
                : `${operation.question} = ?`}
            </Text>
          </Card>

          {/* Controles según modo */}
          {(mode === 'classic' || mode === 'timeAttack') && (
            <View style={styles.classicBlock}>
              <TextInput
                style={styles.input}
                value={classicInput}
                onChangeText={setClassicInput}
                keyboardType="numeric"
                placeholder="Respuesta..."
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleClassicSubmit}
                autoFocus
              />
              <AppButton label="Confirmar" onPress={handleClassicSubmit} disabled={classicInput === ''} />
            </View>
          )}

          {mode === 'trueFalse' && (
            <View style={styles.tfBlock}>
              <AppButton label="Verdadero" onPress={() => handleAnswer(true)}  variant="primary"   style={styles.tfBtn} />
              <AppButton label="Falso"     onPress={() => handleAnswer(false)} variant="secondary" style={styles.tfBtn} />
            </View>
          )}

          {mode === 'multipleChoice' && (
            <View style={styles.mcBlock}>
              {operation.options?.map((opt, i) => (
                <TouchableOpacity key={i} style={styles.mcOption} onPress={() => handleAnswer(opt)} activeOpacity={0.8}>
                  <Text style={styles.mcText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!isTimeAttack && (
            <AppButton
              label="Terminar ronda"
              onPress={() => Alert.alert('Terminar', '¿Querés terminar la ronda?', [
                { text: 'Continuar', style: 'cancel' },
                { text: 'Terminar', onPress: () => endGame(records) },
              ])}
              variant="outline"
              style={styles.endBtn}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pill:      { backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  pillText:  { color: colors.white, fontWeight: '700', fontSize: 13 },
  scoreText: { fontSize: 20, fontWeight: '800', color: colors.secondary },
  totalTimerLabel: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginBottom: 6 },
  opCard:    { alignItems: 'center', marginVertical: 16, paddingVertical: 28 },
  opText:    { fontSize: 36, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  classicBlock: { gap: 8 },
  input: {
    backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border,
    borderRadius: 16, padding: 14, fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center',
  },
  tfBlock:  { flexDirection: 'row', gap: 12 },
  tfBtn:    { flex: 1 },
  mcBlock:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mcOption: {
    flex: 1, minWidth: '45%', backgroundColor: colors.card,
    borderWidth: 2, borderColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  mcText:  { fontSize: 22, fontWeight: '800', color: colors.primary },
  endBtn:  { marginTop: 14 },
});
