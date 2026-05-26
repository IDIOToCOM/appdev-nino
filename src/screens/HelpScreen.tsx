import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { CustomerShell, PageHeader, UtoCard } from '../components/uto';
import { UTO } from '../theme/uto';

const HelpScreen = () => (
  <CustomerShell>
    <ScrollView contentContainerStyle={styles.scroll}>
      <PageHeader
        kicker="Help"
        title="FAQ & guides"
        lead="Pickup, returns, fuel, and answers before you book."
      />

      <UtoCard style={styles.card}>
        <Text style={styles.h2}>Pickup & return</Text>
        <Text style={styles.body}>
          Default meeting point: UTO Car Rentals desk, Ground Floor, NAIA Terminal 3
          Arrivals area (Pasay City). If your booking lists another address, use that
          location once your booking is Confirmed.
        </Text>
        <Text style={styles.body}>
          Arrive 15 minutes before your scheduled pickup time. Return on time so the
          next renter is not delayed.
        </Text>
      </UtoCard>

      <UtoCard style={styles.card}>
        <Text style={styles.h2}>ID & documents</Text>
        <Text style={styles.bullet}>• Valid government-issued ID</Text>
        <Text style={styles.bullet}>• Driver’s license valid for the full rental period</Text>
        <Text style={styles.bullet}>• Booking confirmation (email or My bookings)</Text>
        <Text style={styles.body}>
          The name on your ID should match the name on the booking.
        </Text>
      </UtoCard>

      <UtoCard style={styles.card}>
        <Text style={styles.h2}>Fuel policy</Text>
        <Text style={styles.body}>
          Full-to-full: return the vehicle with the same fuel level noted at pickup to
          avoid a refueling charge.
        </Text>
      </UtoCard>

      <UtoCard style={styles.card}>
        <Text style={styles.h2}>How do I book?</Text>
        <Text style={styles.body}>
          Sign in, browse Vehicles, choose dates and pickup details, and submit. Status
          starts as Pending until our team confirms (usually within 24 hours). Pay from
          My bookings once your reservation is Confirmed.
        </Text>
      </UtoCard>

      <UtoCard style={styles.card}>
        <Text style={styles.h2}>Can I change or cancel?</Text>
        <Text style={styles.body}>
          In My bookings, tap Cancel booking (the record stays; status becomes
          Cancelled and dates are released).
        </Text>
        <Text style={styles.bullet}>
          • You can cancel online when status is Pending or Confirmed and pickup is
          more than 24 hours before scheduled pickup.
        </Text>
        <Text style={styles.bullet}>
          • You cannot cancel online if already Cancelled or Refunded, or inside the
          24-hour window—contact support with your booking number.
        </Text>
        <Text style={styles.bullet}>
          • If you paid: cancelling marks the payment Refunded; our team may follow up.
        </Text>
      </UtoCard>

      <UtoCard style={styles.card}>
        <Text style={styles.h2}>Reviews</Text>
        <Text style={styles.body}>
          After a confirmed booking for a vehicle, open its detail page and submit a
          star rating and optional comment.
        </Text>
      </UtoCard>
    </ScrollView>
  </CustomerShell>
);

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  card: { marginHorizontal: 16, marginBottom: 12, padding: 16 },
  h2: {
    fontSize: 17,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 8,
  },
  body: { fontSize: 15, lineHeight: 22, color: UTO.textBody, marginBottom: 8 },
  bullet: { fontSize: 15, lineHeight: 22, color: UTO.textBody, marginBottom: 4 },
});

export default HelpScreen;
