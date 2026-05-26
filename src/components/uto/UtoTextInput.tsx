import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { UTO } from '../../theme/uto';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

const UtoTextInput = ({ label, style, error, ...rest }: Props) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholderTextColor={UTO.muted}
      style={[styles.input, error ? styles.inputError : null, style]}
      {...rest}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: UTO.textBody,
    marginBottom: 6,
  },
  input: {
    backgroundColor: UTO.inputBg,
    borderWidth: 2,
    borderColor: UTO.border,
    borderRadius: UTO.radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: UTO.text,
  },
  inputError: {
    borderColor: UTO.error,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: UTO.error,
    lineHeight: 18,
  },
});

export default UtoTextInput;
