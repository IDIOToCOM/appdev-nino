import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearCarDetail,
  clearCarReviews,
  fetchCar,
  fetchCarReviews,
} from '../app/action';
import type { RootState } from '../app/reducers';
import {
  CarMedia,
  CarReviewsSection,
  ReviewStars,
  CustomerShell,
  PageHeader,
  UtoButton,
  UtoCard,
} from '../components/uto';
import { UTO, formatPricePerDay } from '../theme/uto';
import { ROUTES } from '../utils';
import { isBookableStatus } from '../utils/carStatus';
import { estimateRentalTotal, formatPeso } from '../utils/rentalEstimate';

const CarDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const carId = route.params?.carId;
  const dispatch = useDispatch<any>();
  const { selected, isLoadingDetail, isError, error } = useSelector(
    (s: RootState) => s.cars,
  );
  const rentalWindow = useSelector((s: RootState) => s.catalog.rentalWindow);
  useEffect(() => {
    if (carId != null) {
      dispatch(fetchCar(carId));
      dispatch(fetchCarReviews(Number(carId)));
    }
    return () => {
      dispatch(clearCarDetail());
      dispatch(clearCarReviews());
    };
  }, [carId, dispatch]);

  if (isLoadingDetail) {
    return (
      <CustomerShell>
        <ActivityIndicator size="large" color={UTO.navy} style={styles.loader} />
      </CustomerShell>
    );
  }

  if (isError || !selected) {
    return (
      <CustomerShell>
        <Text style={styles.error}>{error || 'Vehicle not found'}</Text>
      </CustomerShell>
    );
  }

  let estimateLine: string | null = null;
  if (rentalWindow) {
    const { days, total } = estimateRentalTotal(
      rentalWindow.pickupDate,
      rentalWindow.returnDate,
      selected.pricePerDay,
    );
    estimateLine = `Estimated ${days} day${days === 1 ? '' : 's'} · ${formatPeso(total)} for your rental window`;
  }

  return (
    <CustomerShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PageHeader
          compact
          kicker="Vehicle"
          title={`${selected.brand} ${selected.model}`}
          lead={selected.type ? `${selected.type} · ${selected.status}` : selected.status}
        />
        <UtoCard>
          <CarMedia car={selected} aspectRatio={16 / 9} />
        </UtoCard>
        <ReviewStars
          reviewCount={selected.reviewCount}
          averageRating={selected.averageRating}
        />
        <Text style={styles.price}>{formatPricePerDay(selected.pricePerDay)}</Text>
        {estimateLine ? <Text style={styles.estimate}>{estimateLine}</Text> : null}
        {isBookableStatus(selected.status) ? (
          <UtoButton
            label="Book now"
            onPress={() => navigation.navigate(ROUTES.BOOK, { carId: selected.id })}
          />
        ) : (
          <Text style={styles.unavailable}>This vehicle is not available for booking.</Text>
        )}
        <CarReviewsSection carId={selected.id} />
        <UtoButton
          label="Back to fleet"
          variant="ghost"
          onPress={() => navigation.navigate(ROUTES.CAR_LIST)}
          style={styles.secondary}
        />
      </ScrollView>
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    color: UTO.error,
    padding: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: UTO.text,
    marginVertical: 16,
  },
  estimate: {
    fontSize: 14,
    color: UTO.muted,
    marginBottom: 12,
    marginTop: -8,
  },
  unavailable: {
    color: UTO.muted,
    marginBottom: 12,
  },
  secondary: {
    marginTop: 8,
  },
});

export default CarDetailScreen;
