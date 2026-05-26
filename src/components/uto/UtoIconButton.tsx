import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UTO } from '../../theme/uto';

type Icon = 'menu' | 'bell';

type Props = {
  icon: Icon;
  onPress?: () => void;
  accessibilityLabel?: string;
  badgeCount?: number;
};

const ICONS: Record<Icon, string> = {
  menu: '☰',
  bell: '🔔',
};

const UtoIconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  badgeCount = 0,
}: Props) => (
  <TouchableOpacity
    style={styles.btn}
    onPress={onPress}
    disabled={!onPress}
    accessibilityLabel={accessibilityLabel}
    activeOpacity={0.8}
  >
    <Text style={styles.glyph}>{ICONS[icon]}</Text>
    {badgeCount > 0 ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {badgeCount > 99 ? '99+' : String(badgeCount)}
        </Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    width: 48,
    height: 48,
    borderRadius: UTO.radius,
    borderWidth: 2,
    borderColor: UTO.border,
    backgroundColor: UTO.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 20,
    color: UTO.navy,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: UTO.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: UTO.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default UtoIconButton;
