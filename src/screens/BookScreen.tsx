import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearCarDetail,
  createBooking,
  fetchCar,
  resetCreateBooking,
} from '../app/action';
import type { RootState } from '../app/reducers';
import {
  CarMedia,
  CustomerShell,
  PageHeader,
  UtoButton,
  UtoCard,
  UtoDatePicker,
  UtoTextInput,
  UtoTimePicker,
} from '../components/uto';
import { UTO } from '../theme/uto';
import { ROUTES } from '../utils';
import { startOfToday, suggestedRentalDates } from '../utils/bookingDates';
import {
  allFieldErrorMessages,
  resolveFieldError,
} from '../utils/bookingFieldErrors';
import {
  applyRentalWindowChange,
  minReturnDateYmd,
  scheduleIssuesMessage,
  scheduleIssuesMessageForChange,
  validateRentalSchedule,
} from '../utils/rentalSchedule';

const BookScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const carId = route.params?.carId;
  const dispatch = useDispatch<any>();
  const auth = useSelector((s: RootState) => s.auth);
  const { selected, isLoadingDetail } = useSelector((s: RootState) => s.cars);
  const bookings = useSelector((s: RootState) => s.bookings);

  const [name, setName] = useState(auth.data?.username || '');
  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const suggested = suggestedRentalDates();
  const defaults = applyRentalWindowChange(
    {
      pickupDate: suggested.pickupDate,
      returnDate: suggested.returnDate,
      pickupTime: '9:00 AM',
      returnTime: '5:00 PM',
    },
    {},
  );
  const [pickupDate, setPickupDate] = useState(defaults.pickupDate);
  const [returnDate, setReturnDate] = useState(defaults.returnDate);
  const [pickupTime, setPickupTime] = useState(defaults.pickupTime);
  const [returnTime, setReturnTime] = useState(defaults.returnTime);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const serverErrors = bookings.fieldErrors ?? {};

  const mergeErrors = useMemo(
    () => ({ ...serverErrors, ...localErrors }),
    [serverErrors, localErrors],
  );

  const clearErrorKeys = useCallback((keys: string[]) => {
    setLocalErrors(prev => {
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
  }, []);

  const fieldErr = (keys: string[]) => resolveFieldError(mergeErrors, keys);

  const liveScheduleWarning = useMemo(
    () =>
      scheduleIssuesMessage({
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
      }),
    [pickupDate, returnDate, pickupTime, returnTime],
  );

  const scheduleBanner =
    liveScheduleWarning ||
    resolveFieldError(mergeErrors, ['schedule', 'rentalDates']);

  const minReturnDate = useMemo(() => minReturnDateYmd(pickupDate), [pickupDate]);

  const applySchedule = useCallback(
    (partial: {
      pickupDate?: string;
      returnDate?: string;
      pickupTime?: string;
      returnTime?: string;
    }) => {
      const message = scheduleIssuesMessageForChange(
        { pickupDate, returnDate, pickupTime, returnTime },
        partial,
      );
      const next = applyRentalWindowChange(
        { pickupDate, returnDate, pickupTime, returnTime },
        partial,
      );
      setPickupDate(next.pickupDate);
      setReturnDate(next.returnDate);
      setPickupTime(next.pickupTime);
      setReturnTime(next.returnTime);
      setLocalErrors(prev => {
        const nextErrors = { ...prev };
        if (message) {
          nextErrors.schedule = message;
        } else {
          delete nextErrors.schedule;
          delete nextErrors.rentalDates;
        }
        return nextErrors;
      });
    },
    [pickupDate, returnDate, pickupTime, returnTime],
  );

  useEffect(() => {
    if (carId != null) {
      dispatch(fetchCar(carId));
    }
    return () => dispatch(clearCarDetail());
  }, [carId, dispatch]);

  useEffect(() => {
    if (bookings.createSuccess) {
      setLocalErrors({});
      Alert.alert(
        'Booking submitted',
        'Your rental request was received. Status: Pending — pay from My bookings once confirmed.',
        [
          {
            text: 'View bookings',
            onPress: () => {
              dispatch(resetCreateBooking());
              navigation.navigate(ROUTES.MY_BOOKINGS);
            },
          },
        ],
      );
    }
  }, [bookings.createSuccess, dispatch, navigation]);

  useEffect(() => {
    if (!bookings.isCreating && bookings.isError && bookings.error) {
      const hasInline = Object.keys(serverErrors).length > 0;
      if (!hasInline) {
        Alert.alert('Booking failed', bookings.error);
      }
    }
  }, [bookings.isCreating, bookings.isError, bookings.error, serverErrors]);

  const submit = () => {
    if (!selected || !carId) {
      return;
    }

    const missing: Record<string, string> = {};
    if (!name.trim()) {
      missing.name = 'Your name is required.';
    }
    if (!phone.trim()) {
      missing.phone = 'Phone number is required.';
    }
    if (!pickupLocation.trim()) {
      missing.pickupLocation = 'Pickup location is required.';
    }
    if (!dropoffLocation.trim()) {
      missing.dropoffLocation = 'Drop-off location is required.';
    }
    if (!pickupDate || !returnDate) {
      missing.rentalDates = 'Please select pickup and return dates.';
    }

    const scheduleErrors = validateRentalSchedule({
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
    });
    Object.assign(missing, scheduleErrors);

    if (Object.keys(missing).length > 0) {
      setLocalErrors(missing);
      return;
    }

    setLocalErrors({});
    dispatch(
      createBooking({
        carId: Number(carId),
        name: name.trim(),
        phone: phone.trim(),
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
      }),
    );
  };

  return (
    <CustomerShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PageHeader
          compact
          kicker="Booking"
          title="Book your rental"
          lead="Choose dates and times, then confirm your reservation."
        />

        {scheduleBanner ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{scheduleBanner}</Text>
          </View>
        ) : null}

        {bookings.isError && Object.keys(serverErrors).length > 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Please fix these issues:</Text>
            {allFieldErrorMessages(serverErrors).map(msg => (
              <Text key={msg} style={styles.bannerBullet}>
                • {msg}
              </Text>
            ))}
          </View>
        ) : null}

        {isLoadingDetail || !selected ? (
          <Text style={styles.muted}>Loading vehicle…</Text>
        ) : (
          <UtoCard style={styles.carPreview}>
            <CarMedia car={selected} aspectRatio={16 / 9} />
            <Text style={styles.carName}>
              {selected.brand} {selected.model}
            </Text>
          </UtoCard>
        )}

        <UtoTextInput
          label="Full name"
          value={name}
          onChangeText={v => {
            setName(v);
            clearErrorKeys(['name']);
          }}
          error={fieldErr(['name'])}
        />
        <UtoTextInput
          label="Phone"
          value={phone}
          onChangeText={v => {
            setPhone(v);
            clearErrorKeys(['phone']);
          }}
          keyboardType="phone-pad"
          placeholder="09171234567"
          error={fieldErr(['phone'])}
        />
        <UtoTextInput
          label="Pickup location"
          value={pickupLocation}
          onChangeText={v => {
            setPickupLocation(v);
            clearErrorKeys(['pickupLocation']);
          }}
          error={fieldErr(['pickupLocation'])}
        />
        <UtoTextInput
          label="Drop-off location"
          value={dropoffLocation}
          onChangeText={v => {
            setDropoffLocation(v);
            clearErrorKeys(['dropoffLocation']);
          }}
          error={fieldErr(['dropoffLocation'])}
        />

        <UtoDatePicker
          label="Pickup date"
          value={pickupDate}
          minimumDate={startOfToday()}
          onChange={ymd => {
            applySchedule({ pickupDate: ymd });
          }}
          error={fieldErr(['rentalDates', 'schedule'])}
        />
        <UtoDatePicker
          label="Return date"
          value={returnDate}
          minimumDate={minReturnDate}
          onChange={ymd => {
            applySchedule({ returnDate: ymd });
          }}
          error={fieldErr(['rentalDates', 'schedule'])}
        />

        <UtoTimePicker
          label="Pickup time"
          value={pickupTime}
          onChange={t => {
            applySchedule({ pickupTime: t });
          }}
          onRejectedTime={msg =>
            setLocalErrors(prev => ({ ...prev, schedule: msg }))
          }
          scheduleContext={{ dateYmd: pickupDate, role: 'pickup' }}
          error={fieldErr(['pickupTime', 'schedule'])}
        />
        <UtoTimePicker
          label="Return time"
          value={returnTime}
          onChange={t => {
            applySchedule({ returnTime: t });
          }}
          onRejectedTime={msg =>
            setLocalErrors(prev => ({ ...prev, schedule: msg }))
          }
          scheduleContext={{
            dateYmd: returnDate,
            role: 'return',
            pickupDate,
            pickupTime,
          }}
          error={fieldErr(['returnTime', 'schedule'])}
        />

        <UtoButton
          label={bookings.isCreating ? 'Submitting…' : 'Submit booking'}
          loading={bookings.isCreating}
          onPress={submit}
          disabled={!!liveScheduleWarning}
        />
      </ScrollView>
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: UTO.radius,
    padding: 14,
    marginBottom: 16,
  },
  bannerTitle: {
    fontWeight: '700',
    color: UTO.error,
    marginBottom: 8,
  },
  bannerText: {
    color: UTO.error,
    lineHeight: 20,
  },
  bannerBullet: {
    color: UTO.error,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  muted: {
    color: UTO.muted,
    marginBottom: 16,
  },
  carPreview: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    padding: 12,
    color: UTO.text,
  },
});

export default BookScreen;
