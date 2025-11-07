import styled from "styled-components/native";
import { TextInput, View, Text } from "react-native";

interface InputFieldProps {
  width?: string;
  height?: string;
  disabled?: boolean;
}

const Container = styled(View)<{ flexible?: boolean }>`
  /* flex: 1; */
  width: 100%;
  margin-bottom: 15px;
  position: relative;
`;

const Label = styled(Text)<{ weight?: string }>`
  /* font-size: 14px; */
  color: #333;
  margin-bottom: 5px;
  font-weight: ${({ weight }) => weight || "400"};
`;

const StyledInput = styled(TextInput)<InputFieldProps>`
  width: 100%; /* O input ocupa toda a largura do container */
  height: ${({ height }) => height || "50px"};
  padding: 10px 15px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  /* font-size: 14px; */
  background-color: ${({ disabled }) => (disabled ? "#f0f0f0" : "#fff")};
  margin-right: 20px;

  &:last-child {
    margin-right: 500; /* Remove o espaço extra do último campo */
  }
`;

const LoadingContainer = styled(View)`
  position: absolute;
  right: 15px;
  top: 50%;
  margin-top: -10px;
`;

export { Container, Label, StyledInput, LoadingContainer };
