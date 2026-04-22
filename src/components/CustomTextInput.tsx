import React from 'react';
import { Text, View, ViewStyle, TextStyle, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

interface CustomTextInputProps {
  placeholder?: string;
  label?: string;
  labelStyle?: TextStyle;
  value: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url' | 'number-pad' | 'decimal-pad';
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder,
  label,
  labelStyle,
  value,
  containerStyle,
  textStyle,
  onChangeText,
  secureTextEntry,
  keyboardType,
  onFocus,
  onBlur,
}) => {
  return (
    <View style={containerStyle}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[textStyle]}
        placeholderTextColor="#999"
      />
    </View>
  );
};

export default CustomTextInput;
