import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { UTO } from '../../theme/uto';
import {
  formatDateDisplay,
  formatDateInput,
  parseDateInput,
} from '../../utils/bookingDates';

type Props = {
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  minimumDate?: Date;
  error?: string;
  showIcon?: boolean;
};

const UtoDatePicker = ({
  label,
  value,
  onChange,
  minimumDate,
  error,
  showIcon = true,
}: Props) => {
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    let d = parseDateInput(value) ?? minimumDate ?? new Date();
    if (minimumDate) {
      const min = new Date(minimumDate);
      min.setHours(0, 0, 0, 0);
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      if (day < min) {
        d = min;
      }
    }
    return d;
  }, [value, minimumDate]);

  useEffect(() => {
    if (!minimumDate) {
      return;
    }
    const minYmd = formatDateInput(minimumDate);
    if (value && value < minYmd) {
      onChange(minYmd);
    }
  }, [value, minimumDate, onChange]);

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (event.type === 'dismissed') {
      setOpen(false);
      return;
    }
    if (selected) {
      let next = selected;
      if (minimumDate) {
        const min = new Date(minimumDate);
        min.setHours(0, 0, 0, 0);
        const day = new Date(selected);
        day.setHours(0, 0, 0, 0);
        if (day < min) {
          next = min;
        }
      }
      onChange(formatDateInput(next));
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, error ? styles.fieldError : null]}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${formatDateDisplay(value)}`}
      >
        <Text style={styles.value}>{formatDateDisplay(value)}</Text>
        {showIcon ? <Text style={styles.icon}>📅</Text> : null}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {open ? (
        <DateTimePicker
          value={parsed}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          onChange={onPickerChange}
        />
      ) : null}
      {Platform.OS === 'ios' && open ? (
        <Pressable onPress={() => setOpen(false)} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
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
  doneBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneText: {
    color: UTO.navy,
    fontWeight: '700',
  },
});

export default UtoDatePicker;
