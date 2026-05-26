import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars, toggleFavorite } from '../app/action';
import type { RootState } from '../app/reducers';
import { CustomerShell, PageHeader, VehicleCard } from '../components/uto';
import { ROUTES } from '../utils';
import { UTO } from '../theme/uto';

const SavedScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { list, isLoadingList } = useSelector((s: RootState) => s.cars);
  const { favoriteIds, favoriteCars } = useSelector(
    (s: RootState) => s.customerPrefs,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCars());
    }, [dispatch]),
  );

  const saved = useMemo(() => {
    const byId = new Map<number, (typeof favoriteCars)[0]>();
    for (const car of favoriteCars) {
      if (favoriteIds.includes(car.id)) {
        byId.set(car.id, car);
      }
    }
    for (const car of list) {
      if (favoriteIds.includes(car.id) && !byId.has(car.id)) {
        byId.set(car.id, car);
      }
    }
    return favoriteIds
      .map(id => byId.get(id))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);
  }, [favoriteIds, favoriteCars, list]);

  return (
    <CustomerShell>
      <PageHeader
        kicker="Saved"
        title="Your favorites"
        lead="Vehicles you marked with ♥ while browsing."
      />
      {saved.length === 0 ? (
        <Text style={styles.empty}>
          {isLoadingList && saved.length === 0 && favoriteIds.length > 0
            ? 'Loading saved vehicles…'
            : 'No saved vehicles. Tap ♥ on a vehicle in the catalog.'}
        </Text>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={c => String(c.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <VehicleCard
              car={item}
              isFavorite
              onToggleFavorite={() => dispatch(toggleFavorite(item.id, item))}
              onDetails={() =>
                navigation.navigate(ROUTES.CAR_DETAIL, { carId: item.id })
              }
              onBook={() => navigation.navigate(ROUTES.BOOK, { carId: item.id })}
            />
          )}
        />
      )}
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
  empty: { color: UTO.muted, padding: 16, lineHeight: 22 },
});

export default SavedScreen;
