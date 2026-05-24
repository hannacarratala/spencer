import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

interface Props {
  maxMs: number;
  onExpire: () => void;
  running: boolean;
  resetKey?: number;
}

export default function Timer({ maxMs, onExpire, running, resetKey }: Props) {
  const [remaining, setRemaining] = useState(maxMs);
  const startRef   = useRef(Date.now());
  const expiredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reinicia cuando cambia la pregunta
  useEffect(() => {
    setRemaining(maxMs);
    expiredRef.current = false;
    startRef.current = Date.now();
  }, [resetKey, maxMs]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running) return;

    expiredRef.current = false;
    startRef.current = Date.now();
    const startRemaining = maxMs; // siempre desde el máximo al iniciar

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const left = Math.max(0, startRemaining - elapsed);
      setRemaining(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(intervalRef.current!);
        onExpire();
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, resetKey]);

  const ratio = remaining / maxMs;
  const barColor = ratio > 0.5 ? colors.success : ratio > 0.25 ? colors.warning : colors.error;
  const seconds = (remaining / 1000).toFixed(1);

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: barColor }]}>{seconds}s</Text>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${ratio * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 8 },
  text: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 4 },
});
