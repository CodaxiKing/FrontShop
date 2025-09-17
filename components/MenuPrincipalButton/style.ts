import styled from "styled-components/native";
import { Dimensions, useWindowDimensions } from "react-native";
import { classifyDevice } from "@/helpers";

export const StyledButton = styled.TouchableOpacity<{
  bgColor: string;
  isModoPaisagem: boolean;
  deviceType: string;
  width: number;
  height: number;
}>`
  width: ${({ width }) => `${width * 0.96}px`};
  height: ${({ deviceType }) => {
    if (deviceType === "largeTablet") return "180px";
    if (deviceType === "mediumTablet") return "160px";
    return "150px";
  }};
  margin: ${({ deviceType }) => {
    if (deviceType === "largeTablet") return "10px auto";
    if (deviceType === "mediumTablet") return "8px auto";
    return "5px auto";
  }};
  background-color: ${(props) => props.bgColor};
  border-radius: 10px;
  padding: 15px 20px;
  flex-direction: column;
  justify-content: space-between;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 5;
`;

// Conteúdo do botão
export const ButtonContent = styled.View`
  flex: 1;
  justify-content: flex-start;
`;

// Ícone no botão
export const ButtonIcon = styled.View`
  position: absolute;
  top: 15px;
  right: 15px;
  opacity: 0.5;
`;

// Título do botão
export const ButtonText = styled.Text`
  font-size: ${(props) => {
    const deviceType = classifyDevice();
    if (deviceType === "largeTablet") return "48px";
    if (deviceType === "mediumTablet") return "40px";
    return "30px";
  }};
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

// Subtítulo do botão
export const ButtonSubtitle = styled.Text`
  font-size: ${(props) => {
    const deviceType = classifyDevice();
    if (deviceType === "largeTablet") return "24px";
    if (deviceType === "mediumTablet") return "20px";
    return "14px";
  }};
  color: rgba(255, 255, 255, 0.9);
`;

// Barra inferior com a seta
export const BottomBar = styled.View`
  width: 106%;
  height: 30px;
  margin-bottom: -15px;
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  align-items: center;
  align-self: center;
  justify-content: center;
`;

// Bola para o ícone na BottomBar
export const BottomBarIcon = styled.View`
  width: 25px;
  height: 25px;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 12.5px;
  align-items: center;
  justify-content: center;
`;
