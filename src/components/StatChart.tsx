import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import colors from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH  = SCREEN_WIDTH - 64; // 20px padding × 2 + 24px card padding × 2

const chartConfig = {
  backgroundGradientFrom: colors.card,
  backgroundGradientTo:   colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(123, 94, 167, ${opacity})`,   // violeta primario
  labelColor: () => colors.textMuted,
  propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
  barPercentage: 0.6,
};

// ── Gráfico de barras: puntaje por ronda ────────────────────────────────────
interface BarProps {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
  unit?: string;
}

export function ScoreBarChart({ title, labels, values }: BarProps) {
  if (values.length === 0) return null;

  const data = {
    labels,
    datasets: [{ data: values }],
  };

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      <BarChart
        data={data}
        width={CHART_WIDTH}
        height={180}
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  );
}

// ── Gráfico de líneas: tiempo promedio de respuesta ─────────────────────────
interface LineProps {
  title: string;
  labels: string[];
  values: number[];
}

export function AvgTimeLineChart({ title, labels, values }: LineProps) {
  if (values.length === 0) return null;

  const lineConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(139, 105, 20, ${opacity})`,  // marrón secundario
  };

  const data = {
    labels,
    datasets: [{ data: values, strokeWidth: 2 }],
  };

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={data}
        width={CHART_WIDTH}
        height={180}
        chartConfig={lineConfig}
        bezier
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix="s"
      />
    </View>
  );
}

// ── Barras horizontales: correctas / incorrectas / sin responder ────────────
interface ProportionProps {
  correct: number;
  incorrect: number;
  unanswered: number;
}

export function ProportionChart({ correct, incorrect, unanswered }: ProportionProps) {
  const total = correct + incorrect + unanswered || 1;
  const pCorrect   = Math.round((correct   / total) * 100);
  const pIncorrect = Math.round((incorrect / total) * 100);
  const pUnanswered = 100 - pCorrect - pIncorrect;

  const Row = ({
    label, value, pct, color,
  }: { label: string; value: number; pct: number; color: string }) => (
    <View style={styles.propRow}>
      <Text style={styles.propLabel}>{label}</Text>
      <View style={styles.propTrack}>
        <View style={[styles.propBar, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.propValue}>{value} ({pct}%)</Text>
    </View>
  );

  return (
    <View style={styles.block}>
      <Text style={styles.title}>Respuestas totales</Text>
      <Row label="Correctas"   value={correct}   pct={pCorrect}    color={colors.success} />
      <Row label="Incorrectas" value={incorrect} pct={pIncorrect}  color={colors.error} />
      <Row label="Sin resp."   value={unanswered} pct={pUnanswered} color={colors.textMuted} />
    </View>
  );
}

// Exportación de BarChart original por si algún archivo lo importa con ese nombre
export { ScoreBarChart as BarChart };

const styles = StyleSheet.create({
  block:   { marginBottom: 8 },
  title:   { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  chart:   { borderRadius: 12, marginLeft: -16 },

  propRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  propLabel: { width: 72, fontSize: 12, color: colors.text },
  propTrack: { flex: 1, height: 14, backgroundColor: colors.border, borderRadius: 7, overflow: 'hidden' },
  propBar:   { height: '100%', borderRadius: 7 },
  propValue: { width: 74, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
});
