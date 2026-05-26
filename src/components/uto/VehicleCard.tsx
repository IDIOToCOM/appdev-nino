import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Car } from '../../app/api/cars';
import CarMedia from './CarMedia';
import UtoButton from './UtoButton';
import UtoCard from './UtoCard';
import ReviewStars from './ReviewStars';
import { UTO, formatPricePerDay } from '../../theme/uto';
import { isBookableStatus } from '../../utils/carStatus';

type Props = {
  car: Car;
  onDetails: () => void;
  onBook: () => void;
  estimateLine?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

const VehicleCard = ({
  car,
  onDetails,
  onBook,
  estimateLine,
  isFavorite,
  onToggleFavorite,
}: Props) => (
  <UtoCard style={styles.card}>
    <TouchableOpacity activeOpacity={0.92} onPress={onDetails}>
      <CarMedia car={car} />
    </TouchableOpacity>
    <View style={styles.body}>
      <View style={styles.titleRow}>
        <TouchableOpacity onPress={onDetails} style={styles.titleTouch}>
          <Text style={styles.title}>
            {car.brand} {car.model}
          </Text>
          <ReviewStars
            reviewCount={car.reviewCount}
            averageRating={car.averageRating}
            compact
          />
        </TouchableOpacity>
        {onToggleFavorite ? (
          <TouchableOpacity onPress={onToggleFavorite} accessibilityLabel="Toggle favorite">
            <Text style={[styles.heart, isFavorite && styles.heartOn]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.price}>{formatPricePerDay(car.pricePerDay)}</Text>
      {estimateLine ? <Text style={styles.estimate}>{estimateLine}</Text> : null}
      <View style={styles.actions}>
        {isBookableStatus(car.status) ? (
          <UtoButton label="Book now" onPress={onBook} style={styles.book} />
        ) : (
          <Text style={styles.unavailable}>Not available for booking</Text>
        )}
        <UtoButton
          label="Details"
          variant="ghost"
          onPress={onDetails}
          style={styles.details}
        />
      </View>
    </View>
  </UtoCard>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  body: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleTouch: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: UTO.text,
  },
  heart: { fontSize: 22, color: UTO.muted, paddingLeft: 8 },
  heartOn: { color: UTO.navy },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: UTO.borderSoft,
  },
  estimate: {
    fontSize: 13,
    color: UTO.muted,
    marginBottom: 12,
    lineHeight: 18,
  },
  unavailable: {
    fontSize: 14,
    color: UTO.muted,
    marginBottom: 8,
  },
  actions: {
    gap: 8,
  },
  book: {},
  details: {},
});

export default VehicleCard;
