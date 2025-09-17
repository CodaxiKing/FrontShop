import styled from "styled-components/native";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface StyledPickerProps {
  width?: string;
  height?: string;
  margin?: string;
}

export const Container = styled(View)`
  margin-bottom: 15px;
`;

export const Label = styled(Text)`
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  font-weight: 400;
`;

export const PickerContainer = styled(View)<StyledPickerProps>`
  width: ${({ width }) => width || "100%"};
  height: ${({ height }) => height || "50px"};

  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  background-color: #fff;
  justify-content: center;
`;

export const StyledPicker = styled(Picker)<StyledPickerProps>`
  flex: 1;
  padding: 0 15px;
  margin: ${({ margin }) => margin || "0"};
  /* font-size: 14px; */
  color: #333;
`;
