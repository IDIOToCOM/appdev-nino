import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { authLogin, authLoginGoogle, clearAuthError } from '../../app/action';
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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const auth = useSelector((state: RootState) => state.auth);
  const loginAttempted = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clearAuthError());
      loginAttempted.current = false;
    }, [dispatch]),
  );

  useEffect(() => {
    if (auth.isLoading) {
      loginAttempted.current = true;
    }
  }, [auth.isLoading]);

  useEffect(() => {
    if (
      loginAttempted.current &&
      !auth.isLoading &&
      auth.isError &&
      auth.error
    ) {
      loginAttempted.current = false;
      navigation.navigate(ROUTES.WRONG, { message: auth.error });
    }
  }, [auth.isLoading, auth.isError, auth.error, navigation]);

  return (
    <ScreenBackground scroll centered contentStyle={styles.content}>
      <UtoLogo width={200} height={56} style={styles.logo} />

      <Text style={styles.subtitle}>Sign in to browse and book vehicles</Text>

      {SHOW_GOOGLE_SIGN_IN_UI ? (
        <>
          <GoogleSignInButton
            disabled={auth.isLoading}
            onIdToken={idToken => dispatch(authLoginGoogle(idToken))}
            onError={message => Alert.alert('Google sign-in', message)}
          />
          <Text style={styles.divider}>or sign in with username</Text>
        </>
      ) : null}

      <View style={styles.form}>
        <UtoTextInput
          label="Username or email"
          placeholder="Username or email"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <UtoTextInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <UtoButton
        label="Sign in"
        loading={auth.isLoading}
        onPress={() => {
          if (username === '' || password === '') {
            navigation.navigate(ROUTES.WRONG, {
              message: 'Please enter your username or email and password.',
            });
            return;
          }
          dispatch(authLogin({ username, password }));
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Create an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={styles.link}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
    color: UTO.muted,
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  divider: {
    textAlign: 'center',
    color: UTO.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  form: {
    width: '100%',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: UTO.textBody,
    fontSize: 15,
  },
  link: {
    color: UTO.navy,
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 15,
  },
});

export default Login;
