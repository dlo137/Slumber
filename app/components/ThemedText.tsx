import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'title' | 'link' | 'default';
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ type = 'default', style, children, ...props }) => {
  let textStyle = styles.default;
  if (type === 'title') textStyle = styles.title;
  if (type === 'link') textStyle = styles.link;
  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    color: '#222',
    fontSize: 16,
  },
  title: {
    color: '#007AFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
