import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import colors from '../theme/colors';
import { obtenerHistorial } from '../utils/storage';
import { RoundResult } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

const MODE_LABEL: Record<string, string>  = { classic: 'Clásico', trueFalse: 'V/F', multipleChoice: 'M.Choice', timeAttack: 'Reloj' };
const DIFF_LABEL: Record<string, string>  = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
const DIFF_COLOR: Record<string, string>  = { easy: colors.success, medium: colors.warning, hard: colors.error };

const MAX_ITEMS = 10; // máximo de entradas visibles sin scroll

export default function HistoryScreen({ navigation }: Props) {
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerHistorial().then((h) => {
      // Ordenar de mayor a menor puntaje
      const sorted = [...h].sort((a, b) => b.score - a.score);
      setHistory(sorted.slice(0, MAX_ITEMS));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay rondas jugadas todavía.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Top {history.length}</Text>

        {history.map((item, index) => (
          <View key={item.id} style={styles.row}>

            {/* Posición */}
            <Text style={[styles.rank, index < 3 && styles.rankTop]}>#{index + 1}</Text>

            {/* Nombre + badges */}
            <View style={styles.info}>
              <Text style={styles.playerName} numberOfLines={1}>{item.playerName}</Text>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: DIFF_COLOR[item.difficulty] }]}>
                  <Text style={styles.badgeText}>{DIFF_LABEL[item.difficulty]}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.badgeText}>{MODE_LABEL[item.mode]}</Text>
                </View>
              </View>
            </View>

            {/* Métricas */}
            <View style={styles.metrics}>
              <Text style={styles.scoreVal}>{item.score}</Text>
              <Text style={styles.scoreLabel}>pts</Text>
            </View>

            <View style={styles.metrics}>
              <Text style={styles.metricVal}>{item.accuracy}%</Text>
              <Text style={styles.metricLabel}>precisión</Text>
            </View>

            <View style={styles.metrics}>
              <Text style={styles.metricVal}>{(item.averageResponseTime / 1000).toFixed(1)}s</Text>
              <Text style={styles.metricLabel}>t.prom</Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.background },
  container:  { flex: 1, paddingHorizontal: 14, paddingTop: 8, justifyContent: 'center', gap: 6 },
  title:      { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },

  rank:    { width: 26, fontSize: 14, fontWeight: '800', color: colors.textMuted, textAlign: 'center' },
  rankTop: { color: colors.primary },

  info:       { flex: 1, gap: 3 },
  playerName: { fontSize: 14, fontWeight: '700', color: colors.text },
  badges:     { flexDirection: 'row', gap: 4 },
  badge:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText:  { fontSize: 9, color: colors.white, fontWeight: '700' },

  metrics:    { alignItems: 'center' },
  scoreVal:   { fontSize: 18, fontWeight: '900', color: colors.primary },
  scoreLabel: { fontSize: 9, color: colors.textMuted },
  metricVal:  { fontSize: 13, fontWeight: '700', color: colors.text },
  metricLabel:{ fontSize: 9, color: colors.textMuted },

  empty:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: colors.textMuted },
});
