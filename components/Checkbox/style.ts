import styled from "styled-components/native";

export const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin: 10px 0;
`;

export const Box = styled.View<{ isChecked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid ${({ isChecked }) => (isChecked ? "#0B5FFF" : "#CCC")};
  background-color: ${({ isChecked }) =>
    isChecked ? "#0B5FFF" : "transparent"};
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

export const CheckMark = styled.Text`
  color: white;
  font-size: 14px;
`;

export const Label = styled.Text`
  font-size: 12px;
  color: #333;
`;
