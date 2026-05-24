import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import colors from '../theme/colors';
import { guardarResultado, obtenerMejoresPuntajes } from '../utils/storage';
import { RoundResult } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

const MODE_LABEL: Record<string, string> = {
  classic: 'Clásico', trueFalse: 'V/F', multipleChoice: 'M. Choice', timeAttack: 'Contra reloj',
};
const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };

export default function ResultsScreen({ navigation, route }: Props) {
  const { config, records, score } = route.params;
  const [bestScore, setBestScore] = useState<number | null>(null);
  const saved = React.useRef(false);

  const correct    = records.filter((r) => r.correct === true).length;
  const incorrect  = records.filter((r) => r.correct === false).length;
  const unanswered = records.filter((r) => r.correct === null).length;
  const total      = records.length;
  const accuracy   = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgTime    = total > 0 ? Math.round(records.reduce((s, r) => s + r.responseTime, 0) / total) : 0;

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    (async () => {
      const result: RoundResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        playerName: config.playerName,
        difficulty: config.difficulty,
        mode: config.mode,
        score, correctAnswers: correct, incorrectAnswers: incorrect,
        unanswered, averageResponseTime: avgTime, accuracy, totalQuestions: total,
      };
      await guardarResultado(result);
      const best = await obtenerMejoresPuntajes();
      setBestScore(best[`${config.difficulty}_${config.mode}`] ?? score);
    })();
  }, []);

  function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, accent && styles.accent]}>{value}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>

        <Text style={styles.title}>Resultados</Text>
        <Text style={styles.player}>{config.playerName}</Text>
        <Text style={styles.badge}>{DIFF_LABEL[config.difficulty]}  ·  {MODE_LABEL[config.mode]}</Text>

        <Card style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Puntaje final</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          {bestScore !== null && (
            <Text style={styles.bestLabel}>
              {score >= bestScore ? 'Nuevo récord!' : `Mejor: ${bestScore} pts`}
            </Text>
          )}
        </Card>

        <Card style={styles.detailCard}>
          <Row label="Correctas"       value={`${correct}`} />
          <Row label="Incorrectas"     value={`${incorrect}`} />
          <Row label="Sin responder"   value={`${unanswered}`} />
          <Row label="Precisión"       value={`${accuracy}%`} accent />
          <Row label="Tiempo promedio" value={`${(avgTime / 1000).toFixed(1)}s`} />
        </Card>

        <View style={styles.btnRow}>
          <AppButton label="Inicio"         onPress={() => navigation.navigate('Home')}   variant="outline" style={styles.halfBtn} />
          <AppButton label="Jugar de nuevo" onPress={() => navigation.navigate('Config')} style={styles.halfBtn} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.background },
  container:  { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 8 },
  title:      { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center' },
  player:     { textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.primary },
  badge:      { textAlign: 'center', color: colors.textMuted, fontSize: 12 },
  scoreCard:  { alignItems: 'center', paddingVertical: 18 },
  scoreLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  scoreValue: { fontSize: 54, fontWeight: '900', color: colors.primary, lineHeight: 60 },
  bestLabel:  { fontSize: 13, color: colors.secondary, fontWeight: '700', marginTop: 2 },
  detailCard: {},
  row:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel:   { fontSize: 13, color: colors.text },
  rowValue:   { fontSize: 13, fontWeight: '700', color: colors.text },
  accent:     { color: colors.primary, fontSize: 15 },
  btnRow:     { flexDirection: 'row', gap: 10 },
  halfBtn:    { flex: 1, marginVertical: 0 },
});
