import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';

const Register = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation<any>();

  const handleRegister = () => {
    if (emailAdd === '' || password === '' || confirmPassword === '') {
      Alert.alert('Invalid Credentials', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    Alert.alert('Success', 'Registration successful!', [
      { text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN) },
    ]);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: '100%' }}>
        <CustomTextInput
          label="Email Address"
          placeholder="Enter Email Address"
          value={emailAdd}
          onChangeText={setEmailAdd}
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
          }}
        />

        <CustomTextInput
          label="Confirm Password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          containerStyle={{ padding: 5 }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
          }}
        />
      </View>

      <CustomButton
        label="REGISTER"
        containerStyle={{
          backgroundColor: 'green',
          borderRadius: 10,
          marginVertical: 20,
          width: '80%',
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress={handleRegister}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
          <Text style={{ color: 'blue', marginLeft: 10, fontWeight: 'bold' }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;
