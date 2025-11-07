import styled from "styled-components/native";
import { TouchableOpacity, Text } from "react-native";

interface MenuButtonProps {
  bgColor?: string;
}

const StyledButton = styled(TouchableOpacity)<MenuButtonProps>`
  width: 325px;
  height: 60px;
  padding: 15px;
  background-color: ${({ bgColor }) => bgColor || "#23a6f0"};
  border-radius: 12px;
  margin: 10px 0;
  align-items: center;
  justify-content: center;
`;

// Componente estilizado para o texto do botão
const ButtonText = styled(Text)`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  font-family: "MontserratBold";
`;

export { StyledButton, ButtonText };
