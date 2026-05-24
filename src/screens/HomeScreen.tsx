import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import colors from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const MODOS = [
  { nombre: 'Clásico',          desc: 'Escribís el resultado de la operación.' },
  { nombre: 'Verdadero / Falso', desc: 'Indicás si la operación con su resultado es correcta o no.' },
  { nombre: 'Múltiple choice',   desc: 'Elegís la respuesta correcta entre cuatro opciones.' },
  { nombre: 'Contra reloj',      desc: 'Respondés hasta que se acabe el tiempo o cometas un error.' },
];

export default function HomeScreen({ navigation }: Props) {
  const [modal, setModal] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo + título */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo-spencer.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Spencer</Text>
        </View>

        {/* Botones */}
        <View style={styles.buttons}>
          <AppButton label="Jugar"        onPress={() => navigation.navigate('Config')} />
          <AppButton label="Estadísticas" onPress={() => navigation.navigate('Stats')}   variant="secondary" />
          <AppButton label="Historial"    onPress={() => navigation.navigate('History')} variant="outline" />
        </View>

        {/* Botón ayuda */}
        <TouchableOpacity style={styles.helpBtn} onPress={() => setModal(true)}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>

        {/* Modal modos de juego */}
        <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal(false)}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Modos de juego</Text>
              {MODOS.map((m) => (
                <View key={m.nombre} style={styles.modoRow}>
                  <Text style={styles.modoNombre}>{m.nombre}</Text>
                  <Text style={styles.modoDesc}>{m.desc}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModal(false)}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: 36 },
  logo:   { width: 130, height: 130, backgroundColor: 'transparent' },
  title:  { fontSize: 48, fontWeight: '900', color: colors.primary, letterSpacing: -1, marginTop: 4 },

  buttons: { gap: 0 },

  helpBtn: {
    alignSelf: 'center',
    marginTop: 24,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { color: colors.white, fontWeight: '900', fontSize: 18 },

  overlay:    { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal:      { backgroundColor: colors.card, borderRadius: 20, padding: 24, width: '100%', gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  modoRow:    { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  modoNombre: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  modoDesc:   { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  closeBtn:   { marginTop: 4, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  closeBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
