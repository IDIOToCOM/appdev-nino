import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { UTO } from '../../theme/uto';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

const UtoCard = ({ children, style }: Props) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: UTO.white,
    borderRadius: UTO.radiusLg,
    borderWidth: 1,
    borderColor: UTO.borderSoft,
    ...UTO.shadow,
    overflow: 'hidden',
  },
});

export default UtoCard;
