import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCatalogRentalWindow,
  setCatalogRentalWindow,
} from '../../app/action';
import type { RootState } from '../../app/reducers';
import { startOfToday, suggestedRentalDates } from '../../utils/bookingDates';
import {
  applyRentalWindowChange,
  minReturnDateYmd,
  scheduleIssuesMessageForChange,
} from '../../utils/rentalSchedule';
import UtoButton from './UtoButton';
import UtoCard from './UtoCard';
import UtoDatePicker from './UtoDatePicker';
import UtoTimePicker from './UtoTimePicker';
import { UTO } from '../../theme/uto';

const DEFAULT_TIMES = {
  pickupTime: '9:00 AM',
  returnTime: '5:00 PM',
} as const;

const CatalogRentalPanel = () => {
  const dispatch = useDispatch<any>();
  const window = useSelector((s: RootState) => s.catalog.rentalWindow);
  const [scheduleWarning, setScheduleWarning] = useState<string | null>(null);

  const minReturnDate = useMemo(
    () => (window ? minReturnDateYmd(window.pickupDate) : startOfToday()),
    [window?.pickupDate],
  );

  const restoreDefaultWindow = () => {
    setScheduleWarning(null);
    const dates = suggestedRentalDates();
    dispatch(
      setCatalogRentalWindow({
        pickupDate: dates.pickupDate,
        returnDate: dates.returnDate,
        ...DEFAULT_TIMES,
      }),
    );
  };

  const clearFilter = () => {
    setScheduleWarning(null);
    dispatch(clearCatalogRentalWindow());
  };

  if (!window) {
    return (
      <UtoCard style={styles.card}>
        <Text style={styles.title}>Rental dates</Text>
        <Text style={styles.lead}>
          No date filter applied. Set pickup and return dates to see price
          estimates on each vehicle.
        </Text>
        <UtoButton label="Set rental dates" onPress={restoreDefaultWindow} />
      </UtoCard>
    );
  }

  const patch = (partial: Partial<typeof window>) => {
    const message = scheduleIssuesMessageForChange(window, partial);
    setScheduleWarning(message);
    dispatch(setCatalogRentalWindow(applyRentalWindowChange(window, partial)));
  };

  return (
    <UtoCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Rental dates</Text>
        <UtoButton
          label="Clear filter"
          variant="ghost"
          fullWidth={false}
          onPress={clearFilter}
          style={styles.clearBtn}
        />
      </View>
      <Text style={styles.lead}>
        Pickup must be today or later. Return must be after pickup (later date or
        later time on the same day).
      </Text>
      {scheduleWarning ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{scheduleWarning}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.col}>
          <UtoDatePicker
            label="Pickup date"
            value={window.pickupDate}
            onChange={v => patch({ pickupDate: v })}
            minimumDate={startOfToday()}
            showIcon={false}
          />
        </View>
        <View style={styles.col}>
          <UtoDatePicker
            label="Return date"
            value={window.returnDate}
            onChange={v => patch({ returnDate: v })}
            minimumDate={minReturnDate}
            showIcon={false}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <UtoTimePicker
            label="Pickup time"
            value={window.pickupTime}
            onChange={v => patch({ pickupTime: v })}
            onRejectedTime={msg => setScheduleWarning(msg)}
            scheduleContext={{
              dateYmd: window.pickupDate,
              role: 'pickup',
            }}
          />
        </View>
        <View style={styles.col}>
          <UtoTimePicker
            label="Return time"
            value={window.returnTime}
            onChange={v => patch({ returnTime: v })}
            onRejectedTime={msg => setScheduleWarning(msg)}
            scheduleContext={{
              dateYmd: window.returnDate,
              role: 'return',
              pickupDate: window.pickupDate,
              pickupTime: window.pickupTime,
            }}
          />
        </View>
      </View>
    </UtoCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: UTO.text,
  },
  clearBtn: {
    marginBottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
  },
  lead: {
    fontSize: 13,
    color: UTO.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: UTO.radius,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
});

export default CatalogRentalPanel;
