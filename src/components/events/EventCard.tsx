import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import Badge from '../common/Badge';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  compact?: boolean;
}

export default function EventCard({ event, onPress, compact }: EventCardProps) {
  const statusVariant = event.status === 'live' ? 'red' : event.status === 'upcoming' ? 'emerald' : 'gray';
  const ticketsLeft = event.capacity - event.ticketsSold;
  const soldOut = ticketsLeft <= 0;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {!compact && (
        <View style={styles.coverArea}>
          {event.coverUrl ? (
            <Image source={{ uri: event.coverUrl }} style={styles.cover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="musical-notes" size={32} color="#7c3aed" />
            </View>
          )}
          <View style={styles.statusBadgeWrapper}>
            <Badge label={event.status.toUpperCase()} variant={statusVariant} />
          </View>
          {event.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={compact ? 1 : 2}>
          {event.title}
        </Text>
        <Text style={styles.venue} numberOfLines={1}>
          <Ionicons name="business" size={12} color="#64748b" /> {event.venueName}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Ionicons name="calendar-outline" size={13} color="#64748b" />
            <Text style={styles.detailText}>
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name="time-outline" size={13} color="#64748b" />
            <Text style={styles.detailText}>{event.startTime}</Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name="location-outline" size={13} color="#64748b" />
            <Text style={styles.detailText} numberOfLines={1}>{event.city}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </Text>
          <Text style={[styles.tickets, soldOut && styles.soldOut]}>
            {soldOut ? 'Sold Out' : `${ticketsLeft} left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardCompact: {
    borderRadius: 12,
  },
  coverArea: {
    height: 130,
    position: 'relative',
    backgroundColor: '#1e1e2e',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  statusBadgeWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 14,
  },
  venue: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#a78bfa',
  },
  tickets: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  soldOut: {
    color: '#ef4444',
  },
});
