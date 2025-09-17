import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  align-items: center;
  background-color: #f5f5f5;
`;

export const SectionContainer = styled.View`
  width: 97%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2; /* Sombras para Android */
`;

export const SectionHeader = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #000;
  text-align: center;
`;

export const SectionSubHeader = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #000;
  text-align: center;
`;

export const InputRow = styled.View`
  width: 50%;
  /* flex: 0.5; */
  flex-direction: row;
  gap: 10px;
  justify-content: space-around;
  margin-bottom: 10px;
  padding-right: 5px;
`;

export const InputField = styled.View`
  width: 48%;
`;

export const Label = styled.Text`
  font-size: 14px;
  color: #333333;
  margin-bottom: 5px;
`;

export const TextInputStyled = styled.TextInput`
  border: 1px solid #cccccc;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  color: #333333;
  background-color: #f9f9f9;
`;
