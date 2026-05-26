import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { fetchCars, fetchHealth, syncFavorites, toggleFavorite } from '../app/action';
import type { RootState } from '../app/reducers';
import {
  CatalogRentalPanel,
  CustomerShell,
  PageHeader,
  UtoButton,
  VehicleCard,
} from '../components/uto';
import { UTO } from '../theme/uto';
import { ROUTES } from '../utils';
import { matchesCarSearch } from '../utils/carSearch';
import { estimateRentalTotal, formatPeso } from '../utils/rentalEstimate';
import { pickPopularCars } from '../utils/popularCars';

const CarListScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { list, popular, isLoadingList, isError, error } = useSelector(
    (s: RootState) => s.cars,
  );
  const prefs = useSelector((s: RootState) => s.customerPrefs);
  const rentalWindow = useSelector((s: RootState) => s.catalog.rentalWindow);
  const isLoggedIn = useSelector((s: RootState) => !!s.auth.data?.token);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchHealth());
    dispatch(fetchCars());
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(syncFavorites());
    }
  }, [dispatch, isLoggedIn]);

  const estimateForCar = (pricePerDay: number) => {
    if (!rentalWindow) {
      return null;
    }
    const { days, total } = estimateRentalTotal(
      rentalWindow.pickupDate,
      rentalWindow.returnDate,
      pricePerDay,
    );
    return `Est. ${days} day${days === 1 ? '' : 's'} · ${formatPeso(total)} for your dates`;
  };

  const types = useMemo(() => {
    const set = new Set<string>();
    list.forEach(c => {
      if (c.type) {
        set.add(c.type);
      }
    });
    return Array.from(set).sort();
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter(c => {
      if (activeType && c.type !== activeType) {
        return false;
      }
      return matchesCarSearch(searchQuery, c);
    });
  }, [list, activeType, searchQuery]);

  const popularCars = useMemo(() => {
    if (searchQuery.trim()) {
      return [];
    }
    let pool = list.filter(c => matchesCarSearch(searchQuery, c));
    if (activeType) {
      pool = pool.filter(c => c.type === activeType);
    }
    if (activeType || popular.length === 0) {
      return pickPopularCars(pool, 8);
    }
    return popular
      .filter(c => matchesCarSearch(searchQuery, c))
      .filter(c => !activeType || c.type === activeType)
      .slice(0, 8);
  }, [popular, list, activeType, searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;

  const renderPopular = () =>
    popularCars.length > 1 ? (
      <View style={styles.featuredBlock}>
        <Text style={styles.featuredTitle}>Popular cars</Text>
        <Text style={styles.featuredLead}>
          Highly rated by renters (4★ and up). Swipe to browse, then tap for
          full details and reviews.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {popularCars.map(car => (
            <TouchableOpacity
              key={car.id}
              style={styles.featuredCard}
              onPress={() =>
                navigation.navigate(ROUTES.CAR_DETAIL, { carId: car.id })
              }
            >
              <VehicleCard
                car={car}
                estimateLine={estimateForCar(car.pricePerDay)}
                isFavorite={prefs.favoriteIds.includes(car.id)}
                onToggleFavorite={() => dispatch(toggleFavorite(car.id, car))}
                onDetails={() =>
                  navigation.navigate(ROUTES.CAR_DETAIL, { carId: car.id })
                }
                onBook={() =>
                  navigation.navigate(ROUTES.BOOK, { carId: car.id })
                }
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ) : null;

  return (
    <CustomerShell>
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <PageHeader
              kicker="Our fleet"
              title="Find your rental"
              lead="Search by brand or model, filter by type, and set dates for estimates."
            />
            <View style={styles.heroActions}>
              <UtoButton
                label={`Saved${prefs.favoriteIds.length ? ` (${prefs.favoriteIds.length})` : ''}`}
                variant="ghost"
                onPress={() => navigation.navigate(ROUTES.SAVED)}
                style={styles.heroBtn}
              />
              <UtoButton
                label="Help"
                variant="ghost"
                onPress={() => navigation.navigate(ROUTES.HELP)}
                style={styles.heroBtn}
              />
            </View>

            <View style={styles.searchWrap}>
              <Text style={styles.searchLabel}>Search vehicles</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Brand or model (e.g. Toyota, Innova)"
                placeholderTextColor={UTO.muted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
                accessibilityLabel="Search by brand or model"
              />
              {hasSearch ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.searchClear}
                  accessibilityLabel="Clear search"
                >
                  <Text style={styles.searchClearText}>Clear search</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <CatalogRentalPanel />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filters}
            >
              <TouchableOpacity
                style={[styles.chip, !activeType && styles.chipActive]}
                onPress={() => setActiveType(null)}
              >
                <Text style={[styles.chipText, !activeType && styles.chipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {types.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, activeType === type && styles.chipActive]}
                  onPress={() => setActiveType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeType === type && styles.chipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.count}>
              <Text style={styles.countBold}>{filtered.length}</Text> vehicle
              {filtered.length === 1 ? '' : 's'}
              {hasSearch ? ` matching “${searchQuery.trim()}”` : ''}
            </Text>

            {isLoadingList ? (
              <ActivityIndicator color={UTO.navy} style={styles.loader} />
            ) : null}
            {isError ? <Text style={styles.error}>{error}</Text> : null}
            {renderPopular()}
          </>
        }
        ListEmptyComponent={
          !isLoadingList && !isError ? (
            <Text style={styles.empty}>
              {hasSearch || activeType
                ? 'No vehicles match your search or filter. Try another brand, model, or type.'
                : 'No vehicles available right now.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <VehicleCard
            car={item}
            estimateLine={estimateForCar(item.pricePerDay)}
            isFavorite={prefs.favoriteIds.includes(item.id)}
            onToggleFavorite={() => dispatch(toggleFavorite(item.id, item))}
            onDetails={() =>
              navigation.navigate(ROUTES.CAR_DETAIL, { carId: item.id })
            }
            onBook={() => navigation.navigate(ROUTES.BOOK, { carId: item.id })}
          />
        )}
      />
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  heroBtn: {
    flexGrow: 1,
    minWidth: '30%',
  },
  searchWrap: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: UTO.textBody,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: UTO.white,
    borderWidth: 2,
    borderColor: UTO.border,
    borderRadius: UTO.radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: UTO.text,
    ...UTO.shadow,
  },
  searchClear: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  searchClearText: {
    fontSize: 14,
    fontWeight: '600',
    color: UTO.navy,
  },
  filters: {
    marginBottom: 12,
  },
  empty: {
    color: UTO.muted,
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 22,
    fontSize: 15,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: UTO.border,
    backgroundColor: UTO.white,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: UTO.navy,
    borderColor: UTO.navy,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: UTO.textBody,
  },
  chipTextActive: {
    color: UTO.white,
  },
  count: {
    color: UTO.muted,
    marginBottom: 12,
    fontSize: 14,
  },
  countBold: {
    fontWeight: '700',
    color: UTO.text,
  },
  loader: {
    marginVertical: 16,
  },
  error: {
    color: UTO.error,
    marginBottom: 12,
  },
  featuredBlock: {
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 4,
  },
  featuredLead: {
    fontSize: 14,
    color: UTO.muted,
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredScroll: {
    paddingRight: 16,
  },
  featuredCard: {
    width: 300,
    marginRight: 12,
  },
});

export default CarListScreen;
