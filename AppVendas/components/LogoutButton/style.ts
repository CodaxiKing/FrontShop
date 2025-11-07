import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Botão principal
export const StyledButton = styled.TouchableOpacity`
  width: ${width * 0.9}px;
  height: 150px;
  margin-top: 80px;
  /* margin: 20px auto; */
  background-color: #ff4f45;
  border-radius: 8px;
  padding: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  elevation: 5;
`;

// Contêiner para o texto e ícone
export const ButtonContainer = styled.View`
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

// Ícone no botão
export const ButtonIcon = styled.View`
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 25px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

// Título do botão
export const ButtonText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
`;

// Subtítulo do botão
export const ButtonSubtitle = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
`;

// Ícone da seta no lado direito do botão
export const ArrowIcon = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;
