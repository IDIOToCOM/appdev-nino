import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../app/action';
import type { AppNotification } from '../app/api/notifications';
import type { RootState } from '../app/reducers';
import { CustomerShell, PageHeader, UtoButton, UtoCard } from '../components/uto';
import { ROUTES } from '../utils';
import { UTO } from '../theme/uto';
import { useNavigation } from '@react-navigation/native';

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const NotificationsScreen = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { list, unreadCount, apiAvailable, isLoading, error } = useSelector(
    (s: RootState) => s.notifications,
  );

  const refresh = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onPressItem = (item: AppNotification) => {
    if (!item.isRead) {
      dispatch(markNotificationRead(item.id));
    }
    if (item.bookingId) {
      navigation.navigate(ROUTES.MY_BOOKINGS);
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Pressable onPress={() => onPressItem(item)}>
      <UtoCard
        style={!item.isRead ? { ...styles.card, ...styles.cardUnread } : styles.card}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.when}>{formatWhen(item.createdAt)}</Text>
        {item.bookingId ? (
          <Text style={styles.linkHint}>Tap to open My bookings</Text>
        ) : null}
      </UtoCard>
    </Pressable>
  );

  return (
    <CustomerShell>
      <PageHeader
        kicker="Updates"
        title="Notifications"
        lead={
          unreadCount > 0
            ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
            : 'Booking and payment updates from Uto.'
        }
      />
      {unreadCount > 0 && apiAvailable ? (
        <View style={styles.toolbar}>
          <UtoButton
            label="Mark all as read"
            variant="ghost"
            onPress={() => dispatch(markAllNotificationsRead())}
          />
        </View>
      ) : null}
      {!apiAvailable && !isLoading ? (
        <Text style={styles.hint}>
          Notifications API is not available on this server. Restart Symfony after updating
          the backend, then pull to refresh.
        </Text>
      ) : null}
      {isLoading && list.length === 0 ? (
        <ActivityIndicator color={UTO.navy} style={styles.loader} />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoading && list.length === 0 && apiAvailable ? (
        <Text style={styles.empty}>
          No notifications yet. You will see updates when your booking status changes,
          payment is due, or our team sends you a message.
        </Text>
      ) : null}
      <FlatList
        data={list}
        keyExtractor={n => String(n.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      />
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  toolbar: { paddingHorizontal: 16, marginBottom: 8 },
  card: { padding: 14, marginBottom: 10 },
  cardUnread: {
    borderWidth: 2,
    borderColor: UTO.navy,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: UTO.textBody,
    marginBottom: 8,
  },
  when: { fontSize: 12, color: UTO.muted },
  linkHint: { fontSize: 12, color: UTO.navy, marginTop: 8, fontWeight: '600' },
  loader: { marginTop: 24 },
  empty: { color: UTO.muted, padding: 16, lineHeight: 20 },
  hint: { color: UTO.muted, padding: 16, lineHeight: 20 },
  error: { color: UTO.error, padding: 16 },
});

export default NotificationsScreen;
