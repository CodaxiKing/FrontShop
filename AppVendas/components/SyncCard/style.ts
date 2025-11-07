import styled from "styled-components/native";

export const Card = styled.View`
  width: 48%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
  position: relative;
`;

export const CardTitle = styled.Text`
  font-weight: bold;
  margin-top: 10px;
  color: #252b42;
  flex: 1; /* Faz com que o título ocupe o espaço disponível */
`;

export const CardValue = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #000;
  text-align: right;
`;

export const CardStatus = styled.Text`
  color: #000;
  margin-top: 5px;
`;

export const IconButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: ${(props) => (props.disabled ? 0.3 : 1)};
`;
