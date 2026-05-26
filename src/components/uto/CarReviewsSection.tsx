import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { submitCarReview } from '../../app/action';
import type { RootState } from '../../app/reducers';
import UtoButton from './UtoButton';
import UtoCard from './UtoCard';
import { UTO } from '../../theme/uto';
import { starRatingDisplay, starsText } from '../../utils/reviews';

type Props = {
  carId: number;
};

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map(n => (
      <TouchableOpacity key={n} onPress={() => onChange(n)} accessibilityLabel={`${n} stars`}>
        <Text style={[styles.starBtn, n <= value && styles.starBtnOn]}>★</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const CarReviewsSection = ({ carId }: Props) => {
  const dispatch = useDispatch<any>();
  const { data, apiAvailable, isLoading, isSubmitting, error } = useSelector(
    (s: RootState) => s.reviews,
  );
  const isLoggedIn = useSelector((s: RootState) => !!s.auth.data?.token);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (data?.userReview) {
      setRating(data.userReview.rating);
      setComment(data.userReview.comment ?? '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [carId, data?.userReview?.rating, data?.userReview?.comment]);

  if (isLoading) {
    return <ActivityIndicator color={UTO.navy} style={styles.loader} />;
  }

  if (!apiAvailable && data === null) {
    return (
      <UtoCard style={styles.card}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <Text style={styles.muted}>
          Reviews could not be loaded. Check your connection and try opening this
          vehicle again.
        </Text>
      </UtoCard>
    );
  }

  const summary = data?.summary;
  const display = starRatingDisplay(summary?.averageRating ?? null);
  const count = summary?.reviewCount ?? 0;

  return (
    <UtoCard style={styles.card}>
      <Text style={styles.sectionTitle}>Reviews</Text>
      {count > 0 && display != null ? (
        <Text style={styles.summary}>
          {starsText(display)} {display.toFixed(1)} · {count} review{count === 1 ? '' : 's'}
        </Text>
      ) : (
        <Text style={styles.muted}>No reviews yet.</Text>
      )}

      {(data?.reviews ?? []).map((r, i) => (
        <View key={r.id ?? i} style={styles.reviewItem}>
          <Text style={styles.reviewStars}>{starsText(r.rating)}</Text>
          {r.authorDisplayName ? (
            <Text style={styles.reviewAuthor}>{r.authorDisplayName}</Text>
          ) : null}
          {r.comment ? <Text style={styles.reviewBody}>{r.comment}</Text> : null}
        </View>
      ))}

      {data?.canSubmitReview && isLoggedIn ? (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Your review</Text>
          <StarPicker
            value={rating}
            onChange={setRating}
          />
          <TextInput
            style={styles.input}
            placeholder="Optional comment"
            placeholderTextColor={UTO.muted}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <UtoButton
            label={data.userReview ? 'Update review' : 'Submit review'}
            onPress={() =>
              dispatch(
                submitCarReview({
                  carId,
                  rating,
                  comment: comment.trim() || undefined,
                }),
              )
            }
            disabled={isSubmitting}
          />
          <Text style={styles.hint}>
            You can review after a confirmed booking for this vehicle.
          </Text>
        </View>
      ) : null}

      {!data?.canSubmitReview && isLoggedIn ? (
        <Text style={styles.hint}>
          Book and complete a confirmed rental to leave a review.
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </UtoCard>
  );
};

const styles = StyleSheet.create({
  card: { padding: 14, marginTop: 12 },
  loader: { marginVertical: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 8,
  },
  summary: { fontSize: 15, color: UTO.textBody, marginBottom: 12 },
  muted: { fontSize: 14, color: UTO.muted, marginBottom: 8 },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: UTO.borderSoft,
    paddingTop: 10,
    marginTop: 10,
  },
  reviewStars: { fontSize: 16, color: UTO.navy },
  reviewAuthor: { fontSize: 13, fontWeight: '600', color: UTO.text, marginTop: 4 },
  reviewBody: { fontSize: 14, color: UTO.textBody, marginTop: 4, lineHeight: 20 },
  form: { marginTop: 16 },
  formLabel: { fontWeight: '600', marginBottom: 8, color: UTO.text },
  starRow: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  starBtn: { fontSize: 28, color: UTO.border },
  starBtnOn: { color: UTO.navy },
  input: {
    borderWidth: 1,
    borderColor: UTO.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
    marginBottom: 12,
    color: UTO.text,
    textAlignVertical: 'top',
  },
  hint: { fontSize: 13, color: UTO.muted, marginTop: 8, lineHeight: 18 },
  error: { color: UTO.error, marginTop: 8 },
});

export default CarReviewsSection;
