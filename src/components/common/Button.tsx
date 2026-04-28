import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: '#7c3aed', border: '#7c3aed', text: '#ffffff' },
  secondary: { bg: '#10b981', border: '#10b981', text: '#ffffff' },
  outline: { bg: 'transparent', border: '#7c3aed', text: '#a78bfa' },
  ghost: { bg: 'rgba(124,58,237,0.1)', border: 'transparent', text: '#a78bfa' },
  danger: { bg: '#ef4444', border: '#ef4444', text: '#ffffff' },
};

const SIZE_STYLES: Record<Size, { paddingH: number; paddingV: number; fontSize: number; iconSize: number }> = {
  sm: { paddingH: 14, paddingV: 8, fontSize: 13, iconSize: 14 },
  md: { paddingH: 20, paddingV: 12, fontSize: 15, iconSize: 16 },
  lg: { paddingH: 28, paddingV: 16, fontSize: 17, iconSize: 20 },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          opacity: disabled || loading ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={s.iconSize} color={v.text} style={styles.iconLeft} />
          )}
          <Text style={[styles.label, { fontSize: s.fontSize, color: v.text }, textStyle]}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={s.iconSize} color={v.text} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
