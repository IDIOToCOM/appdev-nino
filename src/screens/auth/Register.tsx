import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { authLoginGoogle, authRegister } from '../../app/action';
import type { RootState } from '../../app/reducers';
import {
  GoogleSignInButton,
  ScreenBackground,
  UtoButton,
  UtoLogo,
  UtoTextInput,
} from '../../components/uto';
import { SHOW_GOOGLE_SIGN_IN_UI } from '../../config/google';
import { UTO } from '../../theme/uto';
import { ROUTES } from '../../utils';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const register = useSelector((state: RootState) => state.register);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Sign-in failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  useEffect(() => {
    if (!register.isLoading && register.isError && register.error) {
      Alert.alert('Registration failed', register.error);
    }
  }, [register.isLoading, register.isError, register.error]);

  const handleRegister = () => {
    if (username === '' || password === '' || confirmPassword === '') {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    dispatch(
      authRegister({
        username,
        password,
      }),
    );
  };

  return (
    <ScreenBackground scroll contentStyle={styles.content}>
      <UtoLogo width={180} height={50} style={styles.logo} />
      <Text style={styles.subtitle}>Create your Uto Mobility account</Text>

      {SHOW_GOOGLE_SIGN_IN_UI ? (
        <>
          <GoogleSignInButton
            disabled={register.isLoading || auth.isLoading}
            onIdToken={idToken => dispatch(authLoginGoogle(idToken))}
            onError={message => Alert.alert('Google sign-in', message)}
          />
          <Text style={styles.divider}>or register with username</Text>
        </>
      ) : null}

      <UtoTextInput
        label="Username"
        placeholder="Choose a username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <UtoTextInput
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <UtoTextInput
        label="Confirm password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <UtoButton
        label="Create account"
        loading={register.isLoading || auth.isLoading}
        onPress={handleRegister}
        style={styles.button}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    color: UTO.muted,
    fontSize: 15,
    marginBottom: 16,
  },
  divider: {
    textAlign: 'center',
    color: UTO.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: UTO.textBody,
  },
  link: {
    color: UTO.navy,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default Register;
