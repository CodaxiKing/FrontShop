import styled from "styled-components/native";
import { TouchableOpacity, Text } from "react-native";

const StyledButton = styled(TouchableOpacity)`
  width: 100px;
  height: 50px;
  padding: 16px;
  background-color: #006ffd;
  border-radius: 12px;
  margin: 10px 0;
  align-items: center;
  justify-content: center;
`;

// Componente estilizado para o texto do botão
const ButtonText = styled(Text)`
  color: #ffffff;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.2px;
  font-family: "MontserratBold";
`;

export { StyledButton, ButtonText };
