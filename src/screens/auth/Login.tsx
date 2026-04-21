import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { IMG, ROUTES } from '../../utils';
import { authLogin } from '../../app/action';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const auth = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      navigation.navigate(ROUTES.WRONG);
    }
  }, [auth.isLoading, auth.isError, auth.error, navigation]);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={{ uri: IMG.LOGO }}
        style={{ width: 240, height: 80, marginBottom: 40 }}
        resizeMode="contain"
      />

      <View style={{ width: '100%' }}>
        <CustomTextInput
          label="Username"
          placeholder="Enter Username"
          value={username}
          onChangeText={setUsername}
          containerStyle={{ padding: 5 }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
        <CustomTextInput
          label="Password"
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={{ padding: 5 }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
      </View>

      <CustomButton
        label="LOGIN"
        containerStyle={{
          backgroundColor: '#13ae0e',
          borderRadius: 10,
          marginVertical: 20,
          width: '85%',
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress={() => {
          if (username === '' || password === '') {
            navigation.navigate(ROUTES.WRONG);
            return;
          }

          dispatch(
            authLogin({
              username,
              password,
            }),
          );
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Create an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={{ color: 'green', marginLeft: 5, fontWeight: 'bold' }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
