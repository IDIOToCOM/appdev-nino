import React from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import type { TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
};

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  ...rest
}: Props) => {
  return (
    <View style={containerStyle}>
      {!!label && <Text style={{ fontWeight: 'bold' }}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[
          textStyle,
          {
            width: '100%',
            borderBottomWidth: 1,
          },
        ]}
        {...rest}
      />
    </View>
  );
};

export default CustomTextInput;
