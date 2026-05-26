import React from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { IMG } from '../../utils';

type Props = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

const UtoLogo = ({ width = 200, height = 56, style }: Props) => (
  <Image
    source={IMG.LOGO}
    style={[styles.logo, { width, height }, style]}
    resizeMode="contain"
    accessibilityLabel="UTO Car Rentals"
  />
);

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});

export default UtoLogo;
