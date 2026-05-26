import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../../app/action';
import type { RootState } from '../../app/reducers';
import UtoIconButton from './UtoIconButton';
import UtoButton from './UtoButton';
import { UTO } from '../../theme/uto';
import { ROUTES } from '../../utils';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CustomerMenu = ({ visible, onClose }: Props) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const prefs = useSelector((s: RootState) => s.customerPrefs);
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);

  const go = (route: string) => {
    onClose();
    navigation.navigate(route);
  };

  const items: {
    label: string;
    route: string;
    badge?: number;
    section?: boolean;
  }[] = [
    { label: 'Vehicles', route: ROUTES.CAR_LIST, section: true },
    { label: 'Saved', route: ROUTES.SAVED, badge: prefs.favoriteIds.length },
    { label: 'My bookings', route: ROUTES.MY_BOOKINGS },
    {
      label: 'Notifications',
      route: ROUTES.NOTIFICATIONS,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Help', route: ROUTES.HELP },
    { label: 'Account', route: ROUTES.PROFILE },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={e => e.stopPropagation()}>
          <View style={styles.panelHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <UtoIconButton icon="menu" onPress={onClose} accessibilityLabel="Close menu" />
          </View>
          <ScrollView>
            {items.map(item => (
              <TouchableOpacity
                key={item.route}
                style={[styles.row, item.section && styles.rowSection]}
                onPress={() => go(item.route)}
              >
                <Text style={[styles.rowLabel, item.section && styles.rowLabelActive]}>
                  {item.label}
                  {item.badge ? `  ${item.badge}` : ''}
                </Text>
                {item.section ? <Text style={styles.chevron}>▾</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <UtoButton
              label="Sign out"
              variant="ghost"
              onPress={() => {
                onClose();
                dispatch(authLogout());
              }}
              style={styles.signOut}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
  },
  panel: {
    flex: 1,
    backgroundColor: UTO.white,
    marginTop: 0,
    paddingTop: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    color: UTO.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: UTO.border,
  },
  rowSection: {
    backgroundColor: UTO.inputBg,
  },
  rowLabel: {
    fontSize: 20,
    color: UTO.textBody,
    fontWeight: '500',
  },
  rowLabelActive: {
    color: UTO.navy,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 14,
    color: UTO.muted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: UTO.border,
  },
  signOut: {
    flex: 1,
  },
});

export default CustomerMenu;
