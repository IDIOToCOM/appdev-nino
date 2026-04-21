import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { IMG, ROUTES } from '../utils';
import { authLogout } from '../app/action';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'red',
      }}
    >
      <Image source={{ uri: IMG.LOGO1 }} style={{ width: 200, height: 200 }} />

      <Text style={{ fontSize: 20, marginTop: 20 }}>HomeScreen</Text>

      <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PROFILE)}>
        <View
          style={{
            backgroundColor: 'blue',
            padding: 5,
            borderRadius: 5,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 24, color: 'white' }}>VISIT PROFILE</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(authLogout())}>
        <View
          style={{
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 20,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 24, color: 'black' }}>LOG OUT</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
