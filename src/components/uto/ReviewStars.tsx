import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UTO } from '../../theme/uto';
import { starRatingDisplay, starsText } from '../../utils/reviews';

type Props = {
  reviewCount?: number;
  averageRating?: number | null;
  compact?: boolean;
};

const ReviewStars = ({ reviewCount = 0, averageRating, compact }: Props) => {
  const display = starRatingDisplay(averageRating);
  if (!reviewCount || display == null) {
    return (
      <Text style={[styles.none, compact && styles.noneCompact]}>No reviews yet</Text>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.stars, compact && styles.starsCompact]}>
        {starsText(display)}
      </Text>
      <Text style={[styles.meta, compact && styles.metaCompact]}>
        {display.toFixed(1)} ({reviewCount})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  stars: { fontSize: 15, color: UTO.navy },
  starsCompact: { fontSize: 14 },
  meta: { fontSize: 13, color: UTO.muted },
  metaCompact: { fontSize: 12 },
  none: { fontSize: 13, color: UTO.muted },
  noneCompact: { fontSize: 12 },
});

export default ReviewStars;
