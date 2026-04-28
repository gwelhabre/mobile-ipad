import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftFlex?: number;
  rightFlex?: number;
  style?: ViewStyle;
}

export default function SplitView({
  left,
  right,
  leftFlex = 4,
  rightFlex = 6,
  style,
}: SplitViewProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.leftPane, { flex: leftFlex }]}>
        {left}
      </View>
      <View style={styles.separator} />
      <View style={[styles.rightPane, { flex: rightFlex }]}>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    overflow: 'hidden',
  },
  separator: {
    width: 1,
    backgroundColor: '#1e1e2e',
  },
  rightPane: {
    overflow: 'hidden',
  },
});
