import React, { useCallback, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../app/action';
import type { RootState } from '../../app/reducers';
import { ROUTES } from '../../utils';
import CustomerMenu from './CustomerMenu';
import UtoLogo from './UtoLogo';
import UtoIconButton from './UtoIconButton';
import { UTO } from '../../theme/uto';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  showHeader?: boolean;
};

const CustomerShell = ({ children, style, showHeader = true }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const isLoggedIn = useSelector((s: RootState) => !!s.auth.data?.token);
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        dispatch(fetchNotifications());
      }
    }, [dispatch, isLoggedIn]),
  );

  const openNotifications = () => {
    navigation.navigate(ROUTES.NOTIFICATIONS);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {showHeader ? (
        <View style={styles.header}>
          <UtoLogo width={160} height={44} />
          <View style={styles.headerActions}>
            {isLoggedIn ? (
              <UtoIconButton
                icon="bell"
                onPress={openNotifications}
                accessibilityLabel={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                badgeCount={unreadCount}
              />
            ) : null}
            <UtoIconButton
              icon="menu"
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="Open menu"
            />
          </View>
        </View>
      ) : null}
      <View style={[styles.body, style]}>{children}</View>
      <CustomerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UTO.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: UTO.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  body: {
    flex: 1,
  },
});

export default CustomerShell;
