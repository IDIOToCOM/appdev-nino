import React, { type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UTO } from '../../theme/uto';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  centered?: boolean;
};

const ScreenBackground = ({
  children,
  scroll = false,
  contentStyle,
  centered = false,
}: Props) => {
  const contentStyles: StyleProp<ViewStyle> = [
    scroll ? styles.scrollContent : styles.inner,
    centered && styles.centered,
    contentStyle,
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={contentStyles}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, contentStyles]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UTO.background,
  },
  root: {
    flex: 1,
    backgroundColor: UTO.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  centered: {
    justifyContent: 'center',
  },
});

export default ScreenBackground;
