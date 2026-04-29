import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type BadgeVariant = 'purple' | 'emerald' | 'red' | 'blue' | 'amber' | 'gold' | 'yellow' | 'green' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  /** Cross-platform tablet alias for `size === 'sm'`. */
  small?: boolean;
  /** Cross-platform tablet API: direct color (overrides variant). */
  color?: string;
  /** Cross-platform tablet API: outlined style. */
  outlined?: boolean;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  purple: { bg: 'rgba(124,58,237,0.15)', text: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
  emerald: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  green: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  red: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  blue: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  amber: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  gold: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  yellow: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  gray: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
};

export default function Badge({ label, variant = 'purple', size = 'sm', small, color, outlined, style }: BadgeProps) {
  const isSmall = small ?? size === 'sm';
  const variantColors = VARIANT_COLORS[variant];
  const bg = color ? `${color}26` : variantColors.bg;
  const border = color ? `${color}55` : variantColors.border;
  const txt = color ? color : variantColors.text;

  return (
    <View
      style={[
        styles.badge,
        outlined
          ? { backgroundColor: 'transparent', borderColor: txt, borderWidth: 1 }
          : { backgroundColor: bg, borderColor: border },
        {
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: txt, fontSize: isSmall ? 11 : 13 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
