import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { cancelBooking, fetchBookings, payBooking } from '../app/action';
import type { Booking } from '../app/api/bookings';
import {
  canCancelBookingClient,
  canPayBooking,
  paymentStatusLabel,
} from '../app/api/bookings';
import type { RootState } from '../app/reducers';
import { CustomerShell, PageHeader, UtoButton, UtoCard } from '../components/uto';
import { UTO } from '../theme/uto';
import { formatPeso } from '../utils/rentalEstimate';

const statusChipStyle = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') {
    return styles.chipConfirmed;
  }
  if (s === 'cancelled' || s === 'refunded') {
    return styles.chipMuted;
  }
  return styles.chipPending;
};

const MyBookingsScreen = () => {
  const dispatch = useDispatch<any>();
  const {
    list,
    isLoadingList,
    isError,
    error,
    isCancelling,
    cancelError,
    isPaying,
    payError,
    lastPayMessage,
    lastCancelMessage,
  } = useSelector((s: RootState) => s.bookings);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [pendingPay, setPendingPay] = useState<Booking | null>(null);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (cancelError) {
      Alert.alert('Cancel booking', cancelError);
    }
  }, [cancelError]);

  useEffect(() => {
    if (payError) {
      Alert.alert('Payment', payError);
    }
  }, [payError]);

  useEffect(() => {
    if (lastCancelMessage) {
      Alert.alert('Booking cancelled', lastCancelMessage);
    }
  }, [lastCancelMessage]);

  useEffect(() => {
    if (lastPayMessage) {
      Alert.alert('Payment complete', lastPayMessage);
      setPendingPay(null);
    }
  }, [lastPayMessage]);

  const confirmCancel = () => {
    if (pendingCancelId == null) {
      return;
    }
    dispatch(cancelBooking(pendingCancelId));
    setPendingCancelId(null);
  };

  const confirmPay = () => {
    if (!pendingPay) {
      return;
    }
    const amount = pendingPay.amountDue ?? undefined;
    dispatch(payBooking(pendingPay.id, amount));
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const canCancel = canCancelBookingClient(item);
    const showPay = canPayBooking(item);
    const payLabel = paymentStatusLabel(item.paymentStatus);
    const due =
      item.amountDue != null && item.amountDue > 0
        ? formatPeso(item.amountDue)
        : null;

    return (
      <UtoCard style={styles.card}>
        <Text style={styles.title}>
          #{item.id} — {item.car?.brand} {item.car?.model}
        </Text>
        <Text style={styles.meta}>
          {item.pickupDate} {item.pickupTime} → {item.returnDate} {item.returnTime}
        </Text>
        <Text style={styles.meta}>{item.pickupLocation} → {item.dropoffLocation}</Text>
        <View style={styles.chips}>
          {item.status ? (
            <Text style={[styles.chip, statusChipStyle(item.status)]}>
              Booking: {item.status}
            </Text>
          ) : null}
          {payLabel ? (
            <Text style={[styles.chip, styles.chipPayment]}>Payment: {payLabel}</Text>
          ) : null}
        </View>
        {due ? <Text style={styles.meta}>Amount due: {due}</Text> : null}
        {showPay ? (
          <UtoButton
            label={due ? `Pay ${due}` : 'Pay now'}
            onPress={() => setPendingPay(item)}
            style={styles.payBtn}
          />
        ) : null}
        {item.status?.toLowerCase() === 'confirmed' && !showPay && payLabel === 'Unpaid' ? (
          <Text style={styles.policyHint}>
            Payment is not available for this booking right now. Pull to refresh or contact
            support if you expected to pay.
          </Text>
        ) : null}
        {canCancel ? (
          <UtoButton
            label="Cancel booking"
            variant="ghost"
            onPress={() => setPendingCancelId(item.id)}
            style={styles.cancelBtn}
          />
        ) : (
          <Text style={styles.policyHint}>
            Cancel online only for Pending/Confirmed bookings more than 24 hours before
            pickup.
          </Text>
        )}
      </UtoCard>
    );
  };

  return (
    <CustomerShell>
      <PageHeader
        kicker="Reservations"
        title="My bookings"
        lead="View status, pay when due, or cancel eligible trips."
      />
      {isLoadingList ? <ActivityIndicator color={UTO.navy} /> : null}
      {isError ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoadingList && list.length === 0 ? (
        <Text style={styles.empty}>No bookings yet. Browse vehicles to book.</Text>
      ) : null}
      <FlatList
        data={list}
        keyExtractor={b => String(b.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoadingList}
        onRefresh={() => dispatch(fetchBookings())}
      />

      <Modal visible={pendingCancelId != null} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setPendingCancelId(null)}>
          <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Cancel this booking?</Text>
            <Text style={styles.modalBody}>
              Your booking will be marked Cancelled (not deleted). Dates are released for
              other renters. If you already paid, payment may be marked Refunded.
            </Text>
            <UtoButton
              label={isCancelling ? 'Cancelling…' : 'Yes, cancel booking'}
              onPress={confirmCancel}
              disabled={isCancelling}
            />
            <UtoButton
              label="Keep booking"
              variant="ghost"
              onPress={() => setPendingCancelId(null)}
              style={styles.modalSecondary}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={pendingPay != null} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setPendingPay(null)}>
          <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Complete payment</Text>
            <Text style={styles.modalBody}>
              Pay the amount due for booking #{pendingPay?.id} to confirm your rental
              balance. You will receive a confirmation once payment is received.
              {'\n\n'}
              Total due: {formatPeso(pendingPay?.amountDue ?? 0)}
            </Text>
            <UtoButton
              label={
                isPaying
                  ? 'Processing…'
                  : `Pay ${formatPeso(pendingPay?.amountDue ?? 0)}`
              }
              onPress={confirmPay}
              disabled={isPaying || !(pendingPay?.amountDue && pendingPay.amountDue > 0)}
            />
            <UtoButton
              label="Not now"
              variant="ghost"
              onPress={() => setPendingPay(null)}
              style={styles.modalSecondary}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: UTO.textBody,
    marginBottom: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipPending: {
    backgroundColor: UTO.inputBg,
    color: UTO.navy,
  },
  chipConfirmed: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
  },
  chipMuted: {
    backgroundColor: UTO.borderSoft,
    color: UTO.muted,
  },
  chipPayment: {
    backgroundColor: UTO.inputBg,
    color: UTO.textBody,
  },
  payBtn: { marginTop: 10 },
  cancelBtn: { marginTop: 8 },
  policyHint: { fontSize: 12, color: UTO.muted, marginTop: 8, lineHeight: 16 },
  error: {
    color: UTO.error,
    padding: 16,
  },
  empty: {
    color: UTO.muted,
    padding: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: UTO.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    color: UTO.textBody,
    marginBottom: 16,
  },
  modalSecondary: { marginTop: 8 },
});

export default MyBookingsScreen;
