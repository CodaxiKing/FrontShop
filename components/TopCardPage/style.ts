import { Dimensions } from "react-native";
import styled from "styled-components/native";
const { width } = Dimensions.get("window");

const ContainerTopPageCard = styled.View`
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto 0 auto;
  padding: 10px 0;
  width: 100%;
  max-width: ${width * 0.96}px;
`;

const TextTopPageCard = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #000;
`;

export { ContainerTopPageCard, TextTopPageCard };
