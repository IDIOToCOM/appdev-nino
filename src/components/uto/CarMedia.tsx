import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Car } from '../../app/api/cars';
import { UTO } from '../../theme/uto';
import {
  getCarImageCandidates,
  isSvgCarImageUrl,
} from '../../utils/carImage';

type Props = {
  car: Pick<Car, 'id' | 'brand' | 'model' | 'type' | 'status' | 'imageUrl'>;
  aspectRatio?: number;
};

const CarMedia = ({ car, aspectRatio = 16 / 10 }: Props) => {
  const candidates = useMemo(
    () => getCarImageCandidates(car),
    [car.id, car.imageUrl, car.type],
  );
  const [uriIndex, setUriIndex] = useState(0);

  useEffect(() => {
    setUriIndex(0);
  }, [car.id, car.imageUrl]);

  const uri = candidates[uriIndex];
  const showPlaceholder = !uri;

  const placeholderHint = useMemo(() => {
    if (!car.imageUrl) {
      return 'No photo';
    }
    if (isSvgCarImageUrl(car.imageUrl)) {
      return 'Upload a JPG or PNG in admin to show a photo here';
    }
    return 'Image file missing on server — re-upload in admin';
  }, [car.imageUrl]);

  return (
    <View style={[styles.media, { aspectRatio }]}>
      {!showPlaceholder ? (
        <Image
          source={{
            uri,
            cache: 'reload',
          }}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            if (__DEV__ && uriIndex === 0) {
              console.warn('Car image failed to load:', uri);
            }
            if (uriIndex < candidates.length - 1) {
              setUriIndex(prev => prev + 1);
            }
          }}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {car.brand} {car.model}
          </Text>
          <Text style={styles.placeholderHint}>{placeholderHint}</Text>
        </View>
      )}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{car.status}</Text>
      </View>
      {car.type ? (
        <View style={styles.typePill}>
          <Text style={styles.typeText}>{car.type}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  media: {
    width: '100%',
    backgroundColor: UTO.mediaPlaceholder[0],
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UTO.mediaPlaceholder[1],
    padding: 16,
  },
  placeholderText: {
    color: UTO.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderHint: {
    marginTop: 6,
    color: UTO.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: UTO.navy,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    color: UTO.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typePill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: UTO.borderSoft,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: UTO.textBody,
  },
});

export default CarMedia;
