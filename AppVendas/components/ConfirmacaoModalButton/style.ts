import { TouchableOpacity, Text } from "react-native";
import styled from "styled-components/native";

interface ButtonProps {
  variant?: "confirm" | "exit";
  disabled?: boolean;
}

// Componente de botão com variações de estilo
const Button = styled(TouchableOpacity)<ButtonProps>`
  width: 150px;
  /* min-width: 150px; */
  height: 50px;
  background-color: ${({ variant, disabled }: ButtonProps) =>
    disabled ? "#d3d3d3" : variant === "confirm" ? "#007aff" : "transparent"};
  border: 2px solid
    ${({ variant, disabled }: ButtonProps) =>
      disabled ? "#c0c0c0" : variant === "exit" ? "#007aff" : "transparent"};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }: ButtonProps) => (disabled ? 0.6 : 1)};
`;

// Componente de texto para o botão
const ButtonText = styled(Text)<ButtonProps>`
  color: ${({ variant, disabled }: ButtonProps) =>
    disabled ? "#7f7f7f" : variant === "confirm" ? "#ffffff" : "#007aff"};
  font-size: 12px;
  font-weight: bold;
`;

export { Button, ButtonText };
