import { TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

// Estilização do Modal
export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
  align-items: center;
`;

export const CloseButton = styled(TouchableOpacity)`
  position: absolute;
  top: 60px;
  right: 40px;
  z-index: 20;
  padding: 2px;
  background-color: white;
  border-radius: 50%;
  padding: 2px;
`;

export const ArrowButton = styled(TouchableOpacity)`
  position: absolute;
  top: 50%;
  z-index: 20;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 30px;
`;

export const GalleryContainer = styled.View`
  position: absolute;
  left: 10px;
  top: 20%;
  z-index: 10;
`;

export const GalleryImage = styled.Image`
  width: 600px;
  height: 600px;
  margin-left: 10px;
  margin-right: 10px;
  border-radius: 10px;
`;

export const ZoomedImage = styled(Animated.Image)`
  width: 80%;
  height: 80%;
  resize-mode: contain;
`;

export const ImageCounter = styled.View`
  position: absolute;
  top: 30px;
  align-self: center;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 6px 14px;
  border-radius: 20px;
  z-index: 15;
`;

export const ImageCounterText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;
