import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { UTO } from '../../theme/uto';
import { SUGGESTED_TIMES, TIME_SLOTS } from '../../utils/bookingDates';
import {
  allowedTimeSlots,
  clampTimeToAllowed,
  timePickRejectionMessage,
} from '../../utils/rentalSchedule';

type Props = {
  label: string;
  value: string;
  onChange: (time: string) => void;
  /** Shown when the user picks a time the clock/list cannot use (e.g. return before pickup). */
  onRejectedTime?: (message: string) => void;
  error?: string;
  /** When set, only these slots are selectable (past times filtered out). */
  scheduleContext?: {
    dateYmd: string;
    role: 'pickup' | 'return';
    pickupDate?: string;
    pickupTime?: string;
  };
};

function formatTimeFromDate(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
  const adjustedHour = minutes >= 45 ? hours + 1 : hours;
  const h12 = adjustedHour % 12 === 0 ? 12 : adjustedHour % 12;
  const ampm = adjustedHour < 12 || adjustedHour === 24 ? 'AM' : 'PM';
  const mm = roundedMinutes === 0 ? '00' : '30';
  return `${h12}:${mm} ${ampm}`;
}

function parseTimeToDate(time: string): Date {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  const base = new Date();
  base.setSeconds(0, 0);
  if (!match) {
    base.setHours(9, 0, 0, 0);
    return base;
  }
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }
  base.setHours(hour, minute, 0, 0);
  return base;
}

const UtoTimePicker = ({
  label,
  value,
  onChange,
  onRejectedTime,
  error,
  scheduleContext,
}: Props) => {
  const [showList, setShowList] = useState(false);
  const [showClock, setShowClock] = useState(false);

  const slots = scheduleContext
    ? allowedTimeSlots(scheduleContext)
    : [...TIME_SLOTS];
  const quickSlots = SUGGESTED_TIMES.filter(s => slots.includes(s));

  const commitTime = (requested: string) => {
    if (!scheduleContext) {
      onChange(requested);
      return;
    }
    const applied = clampTimeToAllowed(requested, scheduleContext);
    const rejection = timePickRejectionMessage(
      requested,
      applied,
      scheduleContext,
    );
    onChange(applied);
    if (rejection) {
      onRejectedTime?.(rejection);
    }
  };

  const pickSlot = (slot: string) => {
    if (slots.includes(slot)) {
      onChange(slot);
      return;
    }
    if (slots.length > 0) {
      const applied = slots[0];
      onRejectedTime?.(
        timePickRejectionMessage(slot, applied, scheduleContext!) ??
          'That time is not available. Please choose a later slot.',
      );
      onChange(applied);
    }
  };

  const onClockChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowClock(false);
    }
    if (event.type === 'dismissed') {
      setShowClock(false);
      return;
    }
    if (selected) {
      commitTime(formatTimeFromDate(selected));
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => {
          setShowList(!showList);
          setShowClock(false);
        }}
        style={[styles.field, error ? styles.fieldError : null]}
      >
        <Text style={styles.value}>{value || 'Select time'}</Text>
        <Text style={styles.icon}>🕐</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.quickRow}>
        {(quickSlots.length > 0 ? quickSlots : slots.slice(0, 4)).map(slot => (
          <Pressable
            key={slot}
            style={[styles.chip, value === slot && styles.chipActive]}
            onPress={() => pickSlot(slot)}
          >
            <Text
              style={[styles.chipText, value === slot && styles.chipTextActive]}
            >
              {slot}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.chip} onPress={() => setShowClock(true)}>
          <Text style={styles.chipText}>Clock</Text>
        </Pressable>
      </View>

      {showList ? (
        <ScrollView style={styles.list} nestedScrollEnabled>
          {slots.length === 0 ? (
            <Text style={styles.emptySlots}>
              No times left today. Choose a later date.
            </Text>
          ) : null}
          {slots.map(slot => (
            <Pressable
              key={slot}
              style={[styles.listItem, value === slot && styles.listItemActive]}
              onPress={() => {
                pickSlot(slot);
                setShowList(false);
              }}
            >
              <Text
                style={[
                  styles.listItemText,
                  value === slot && styles.listItemTextActive,
                ]}
              >
                {slot}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {showClock ? (
        <>
          <DateTimePicker
            value={parseTimeToDate(value)}
            mode="time"
            minuteInterval={30}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onClockChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setShowClock(false)} style={styles.doneBtn}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: UTO.textBody,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UTO.inputBg,
    borderWidth: 2,
    borderColor: UTO.border,
    borderRadius: UTO.radius,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fieldError: {
    borderColor: UTO.error,
    backgroundColor: '#fef2f2',
  },
  value: {
    fontSize: 16,
    color: UTO.text,
    fontWeight: '500',
  },
  icon: {
    fontSize: 18,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: UTO.error,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: UTO.border,
    backgroundColor: UTO.white,
  },
  chipActive: {
    backgroundColor: UTO.navy,
    borderColor: UTO.navy,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: UTO.textBody,
  },
  chipTextActive: {
    color: UTO.white,
  },
  list: {
    maxHeight: 160,
    marginTop: 8,
    borderWidth: 1,
    borderColor: UTO.border,
    borderRadius: UTO.radius,
    backgroundColor: UTO.white,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: UTO.borderSoft,
  },
  listItemActive: {
    backgroundColor: UTO.inputBg,
  },
  listItemText: {
    fontSize: 15,
    color: UTO.textBody,
  },
  listItemTextActive: {
    fontWeight: '700',
    color: UTO.navy,
  },
  doneBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  doneText: {
    color: UTO.navy,
    fontWeight: '700',
  },
  emptySlots: {
    padding: 14,
    fontSize: 14,
    color: UTO.muted,
  },
});

export default UtoTimePicker;
