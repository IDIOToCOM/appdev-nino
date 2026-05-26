import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { clearAuthError } from '../app/action';
import { ScreenBackground, UtoButton } from '../components/uto';
import { UTO } from '../theme/uto';
import { ROUTES } from '../utils';

const WrongScreen = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const message =
    route.params?.message || 'Something went wrong. Please try again.';

  return (
    <ScreenBackground centered contentStyle={styles.content}>
      <Text style={styles.title}>Could not continue</Text>
      <Text style={styles.message}>{message}</Text>
      <UtoButton
        label="Back to sign in"
        onPress={() => {
          dispatch(clearAuthError());
          navigation.navigate(ROUTES.LOGIN);
        }}
        style={styles.button}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: UTO.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: UTO.textBody,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  button: {
    maxWidth: 280,
  },
});

export default WrongScreen;
