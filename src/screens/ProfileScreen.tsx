import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../app/action';
import type { RootState } from '../app/reducers';
import { CustomerShell, PageHeader, UtoButton, UtoCard } from '../components/uto';
import { UTO } from '../theme/uto';

const ProfileScreen = () => {
  const dispatch = useDispatch<any>();
  const auth = useSelector((s: RootState) => s.auth);

  return (
    <CustomerShell>
      <PageHeader
        kicker="Account"
        title="Your profile"
        lead="Your renter account for bookings and saved vehicles."
      />
      <UtoCard style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{auth.data?.username ?? '—'}</Text>
      </UtoCard>
      <UtoButton
        label="Sign out"
        variant="ghost"
        onPress={() => dispatch(authLogout())}
      />
    </CustomerShell>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: UTO.muted,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: UTO.text,
  },
});

export default ProfileScreen;
