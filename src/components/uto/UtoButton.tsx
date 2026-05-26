import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { UTO } from '../../theme/uto';

type Variant = 'primary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

const UtoButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
}: Props) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <View
        style={[
          styles.base,
          isPrimary ? styles.primary : styles.ghost,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? UTO.white : UTO.navy} />
        ) : (
          <Text
            style={[
              styles.label,
              isPrimary ? styles.labelPrimary : styles.labelGhost,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: UTO.radius,
    minHeight: 48,
  },
  primary: {
    backgroundColor: UTO.primaryButton,
    ...UTO.shadow,
  },
  ghost: {
    backgroundColor: UTO.white,
    borderWidth: 2,
    borderColor: UTO.border,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelPrimary: {
    color: UTO.white,
  },
  labelGhost: {
    color: UTO.textBody,
  },
});

export default UtoButton;
