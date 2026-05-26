import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UTO } from '../../theme/uto';

type Props = {
  kicker?: string;
  title: string;
  lead?: string;
  /** Less padding — booking, vehicle detail */
  compact?: boolean;
};

const PageHeader = ({ kicker, title, lead, compact = false }: Props) => (
  <View style={[styles.card, compact && styles.cardCompact]}>
    <View style={styles.topRow}>
      {kicker ? (
        <View style={styles.kickerPill}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>{kicker}</Text>
        </View>
      ) : (
        <View />
      )}
    </View>

    <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>

    {lead ? (
      <View style={styles.leadBox}>
        <Text style={[styles.lead, compact && styles.leadCompact]}>{lead}</Text>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    backgroundColor: UTO.white,
    borderRadius: UTO.radiusLg,
    borderWidth: 1,
    borderColor: UTO.border,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 20,
    ...UTO.shadow,
  },
  cardCompact: {
    marginBottom: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UTO.navy,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: UTO.muted2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: UTO.text,
    lineHeight: 32,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  leadBox: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: UTO.navy,
  },
  lead: {
    fontSize: 14,
    lineHeight: 21,
    color: UTO.muted,
  },
  leadCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
});

export default PageHeader;
