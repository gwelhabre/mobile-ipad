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
/** Tablet API alias variants */
type TabletVariant = 'filled' | 'outlined' | 'text' | 'tonal';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  /** Either `label` or `title` works (cross-platform alias). */
  label?: string;
  title?: string;
  onPress: () => void;
  variant?: Variant | TabletVariant;
  size?: Size;
  /** Either `loading` or `isLoading` works. */
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap | string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  /** Optional override color (cross-platform compat). */
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_ALIASES: Record<TabletVariant, Variant> = {
  filled: 'primary',
  outlined: 'outline',
  text: 'ghost',
  tonal: 'ghost',
};

const normalizeVariant = (v: Variant | TabletVariant): Variant => {
  if (v === 'filled' || v === 'outlined' || v === 'text' || v === 'tonal') return VARIANT_ALIASES[v];
  return v;
};

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
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  isLoading,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  color,
  style,
  textStyle,
}: ButtonProps) {
  const text = label ?? title ?? '';
  const busy = loading ?? isLoading ?? false;
  const v = VARIANT_STYLES[normalizeVariant(variant)];
  const s = SIZE_STYLES[size];
  const bg = color && (variant === 'primary' || variant === 'filled' || variant === 'danger' || variant === 'secondary') ? color : v.bg;
  const border = color ? color : v.border;
  const textColor = color && (variant === 'outline' || variant === 'outlined' || variant === 'ghost' || variant === 'text' || variant === 'tonal') ? color : v.text;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          opacity: disabled || busy ? 0.5 : 1,
        },
        fullWidth && { alignSelf: 'stretch', width: '100%' },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || busy}
      activeOpacity={0.8}
    >
      {busy ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={s.iconSize} color={textColor} style={styles.iconLeft} />
          )}
          <Text style={[styles.label, { fontSize: s.fontSize, color: textColor }, textStyle]}>
            {text}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={s.iconSize} color={textColor} style={styles.iconRight} />
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
