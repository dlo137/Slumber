import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ style, children, ...props }) => {
  return (
    <View style={[styles.default, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 0,
  },
});
