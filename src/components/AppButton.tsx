import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AppButton({ label, onPress, variant = 'primary', disabled, style, textStyle }: Props) {
  const bgColor =
    variant === 'secondary' ? colors.secondary :
    variant === 'danger'    ? colors.error :
    variant === 'outline'   ? 'transparent' :
    colors.primary;

  const txtColor = variant === 'outline' ? colors.primary : colors.white;
  const borderColor = variant === 'outline' ? colors.primary : bgColor;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor, borderColor, opacity: disabled ? 0.5 : 1 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, { color: txtColor }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
