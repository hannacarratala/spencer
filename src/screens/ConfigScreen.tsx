import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import colors from '../theme/colors';
import { Difficulty, GameMode, GameConfig } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Config'>;
};

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'easy',   label: 'Fácil'   },
  { key: 'medium', label: 'Medio'   },
  { key: 'hard',   label: 'Difícil' },
];

const MODES: { key: GameMode; label: string }[] = [
  { key: 'classic',        label: 'Clásico'         },
  { key: 'trueFalse',      label: 'Verdadero/Falso'  },
  { key: 'multipleChoice', label: 'Múltiple choice'  },
  { key: 'timeAttack',     label: 'Contra reloj'     },
];

const TIME_RANGE: Record<Difficulty, { min: number; max: number; default: number }> = {
  easy:   { min: 5,  max: 15, default: 8  },
  medium: { min: 8,  max: 20, default: 12 },
  hard:   { min: 10, max: 30, default: 18 },
};

export default function ConfigScreen({ navigation }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode,       setMode]       = useState<GameMode>('classic');
  const [iterations, setIterations] = useState(10);
  const [timePerOp,  setTimePerOp]  = useState(TIME_RANGE['easy'].default);
  const [playerName, setPlayerName] = useState('');

  function handleDiffChange(d: Difficulty) {
    setDifficulty(d);
    setTimePerOp(TIME_RANGE[d].default);
  }

  function handleStart() {
    if (playerName.trim() === '') {
      Alert.alert('Falta el nombre', 'Ingresá tu nombre para comenzar.');
      return;
    }
    const config: GameConfig = {
      difficulty,
      mode,
      iterations: mode === 'timeAttack' ? 999 : iterations,
      maxTimeMs: timePerOp * 1000,
      playerName: playerName.trim(),
    };
    navigation.navigate('Game', { config });
  }

  const tr = TIME_RANGE[difficulty];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>

          {/* Dificultad */}
          <View style={styles.section}>
            <Text style={styles.label}>Dificultad</Text>
            <View style={styles.row}>
              {DIFFICULTIES.map((d) => (
                <AppButton
                  key={d.key} label={d.label}
                  onPress={() => handleDiffChange(d.key)}
                  variant={difficulty === d.key ? 'primary' : 'outline'}
                  style={styles.groupBtn} textStyle={styles.groupText}
                />
              ))}
            </View>
          </View>

          {/* Modo */}
          <View style={styles.section}>
            <Text style={styles.label}>Modo de juego</Text>
            <View style={styles.row}>
              {MODES.slice(0, 2).map((m) => (
                <AppButton
                  key={m.key} label={m.label}
                  onPress={() => setMode(m.key)}
                  variant={mode === m.key ? 'primary' : 'outline'}
                  style={styles.groupBtn} textStyle={styles.groupText}
                />
              ))}
            </View>
            <View style={styles.row}>
              {MODES.slice(2).map((m) => (
                <AppButton
                  key={m.key} label={m.label}
                  onPress={() => setMode(m.key)}
                  variant={mode === m.key ? 'primary' : 'outline'}
                  style={styles.groupBtn} textStyle={styles.groupText}
                />
              ))}
            </View>
          </View>

          {/* Slider iteraciones (oculto en contra reloj) */}
          {mode !== 'timeAttack' && (
            <View style={styles.section}>
              <Text style={styles.label}>
                Iteraciones: <Text style={styles.val}>{iterations}</Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={5} maximumValue={20} step={1}
                value={iterations}
                onValueChange={(v) => setIterations(Math.round(v))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          )}

          {/* Slider tiempo */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Tiempo por operación: <Text style={styles.val}>{timePerOp}s</Text>
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={tr.min} maximumValue={tr.max} step={1}
              value={timePerOp}
              onValueChange={(v) => setTimePerOp(Math.round(v))}
              minimumTrackTintColor={colors.secondary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.secondary}
            />
          </View>

          {/* Nombre del jugador */}
          <View style={styles.section}>
            <Text style={styles.label}>Nombre del jugador</Text>
            <TextInput
              style={styles.input}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Nombre del jugador"
              placeholderTextColor={colors.textMuted}
              maxLength={20}
              returnKeyType="done"
            />
          </View>

          <AppButton label="Iniciar juego" onPress={handleStart} style={styles.startBtn} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 4, justifyContent: 'center', gap: 8 },

  section:   { gap: 4 },
  label:     { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  val:       { color: colors.primary, fontWeight: '800' },

  row:       { flexDirection: 'row', gap: 6 },
  groupBtn:  { flex: 1, paddingVertical: 9, marginVertical: 0 },
  groupText: { fontSize: 12 },

  slider:    { width: '100%', height: 32 },

  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },

  startBtn: { marginTop: 4, paddingVertical: 15 },
});
