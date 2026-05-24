import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import colors from '../theme/colors';
import { obtenerHistorial } from '../utils/storage';
import { getBestScorePerPlayer } from '../utils/statistics';
import { RoundResult } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Stats'>;
};

const CHART_WIDTH = Dimensions.get('window').width - 48;

const chartConfig = {
  backgroundGradientFrom: colors.card,
  backgroundGradientTo:   colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(123, 94, 167, ${opacity})`,
  labelColor: () => colors.textMuted,
  propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
  barPercentage: 0.7,
};

export default function StatsScreen({ navigation }: Props) {
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerHistorial().then((h) => { setHistory(h); setLoading(false); });
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
          <Text style={styles.emptyTitle}>Sin datos aún</Text>
          <Text style={styles.emptyHint}>Jugá una ronda para ver estadísticas.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartData = getBestScorePerPlayer(history);

  const data = {
    labels:   chartData.labels,
    datasets: [{ data: chartData.values }],
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Estadísticas</Text>

        <Card style={styles.card}>
          <Text style={styles.chartTitle}>Mejor puntaje por jugador</Text>
          <BarChart
            data={data}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </Card>

        {/* Lista de puntajes bajo el gráfico */}
        <Card style={styles.listCard}>
          {chartData.labels.map((name, i) => (
            <View key={name} style={styles.listRow}>
              <Text style={styles.listRank}>#{i + 1}</Text>
              <Text style={styles.listName}>{name}</Text>
              <Text style={styles.listScore}>{chartData.values[i]} pts</Text>
            </View>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.background },
  container:  { flex: 1, paddingHorizontal: 16, paddingTop: 8, justifyContent: 'center', gap: 12 },
  title:      { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  card:       { alignItems: 'center' },
  chartTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8, alignSelf: 'flex-start' },
  chart:      { borderRadius: 12, marginLeft: -16 },
  listCard:   { paddingVertical: 4 },
  listRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  listRank:   { width: 28, fontSize: 13, fontWeight: '800', color: colors.primaryLight },
  listName:   { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  listScore:  { fontSize: 14, fontWeight: '800', color: colors.primary },
  empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint:  { fontSize: 13, color: colors.textMuted, marginTop: 6 },
});
