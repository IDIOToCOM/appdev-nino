import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UTO } from '../../theme/uto';

type Variant = 'success' | 'error' | 'neutral';

type Props = {
  message: string;
  variant?: Variant;
};

const StatusBanner = ({ message, variant = 'neutral' }: Props) => {
  const palette =
    variant === 'success'
      ? { bg: UTO.white, border: UTO.navy, text: UTO.navy }
      : variant === 'error'
        ? { bg: '#fef2f2', border: '#fecaca', text: UTO.error }
        : { bg: UTO.white, border: UTO.border, text: UTO.muted };

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.text, { color: palette.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: UTO.radius,
    borderWidth: 1,
    marginBottom: 16,
  },
  text: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default StatusBanner;
