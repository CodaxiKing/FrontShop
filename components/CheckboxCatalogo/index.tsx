import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacityProps } from 'react-native';

// Estilos
const CheckboxContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

interface BoxProps {
  checked: boolean;
}

const Box = styled.View<BoxProps>`
  background-color: ${(props) => (props.checked ? '#007aff' : 'transparent')};
  border-radius: 5px;
  border-color: #333;
  border-width: 2px;
  height: 24px;
  justify-content: center;
  align-items: center;
  width: 24px;
`;

const Label = styled.Text`
  margin-left: 10px;
  font-size: 16px;
  color: #333;
`;

// Tipagem das props
interface CheckboxProps extends TouchableOpacityProps {
  label: string;
  checked: boolean; 
  onPress: () => void;
}

/**
 * Componente CheckboxCatalogo 
 * @param {CheckboxProps} props 
 * @returns {JSX.Element} 
 */
const CheckboxCatalogo: React.FC<CheckboxProps> = ({ label, checked, onPress, ...rest }) => {
  return (
    <CheckboxContainer
      onPress={onPress}
      accessible
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      {...rest}
    >
      <Box checked={checked}>
        {checked && <Ionicons name="checkmark" size={18} color="#fff" />}
      </Box>
      <Label>{label}</Label>
    </CheckboxContainer>
  );
};

export default CheckboxCatalogo;