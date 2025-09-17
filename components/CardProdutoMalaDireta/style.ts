import styled from "styled-components/native";
import { Text } from "react-native";

const CardContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f2f2f2;
  border-radius: 15px;
  padding: 7px 16px;

  width: 300px;
  height: 80px;
`;

const Image = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  margin-right: 10px;
  object-fit: contain;
`;

const InfoContainer = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const RefText = styled(Text)`
  font-size: 12px;
  color: #0f0f0f;
`;

const NameText = styled(Text)`
  font-size: 10px;
  font-weight: Regular;
  color: #868686;
`;

export { CardContainer, Image, InfoContainer, RefText, NameText };
