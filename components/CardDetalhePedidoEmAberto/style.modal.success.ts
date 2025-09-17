import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: white;
  width: 80%;
  border-radius: 10px;
  padding: 60px 20px;
  justify-content: center;
  align-items: center;
`;

export const SuccessText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
  text-align: center;
`;

export const SuccessIcon = styled.View`
  width: 80px;
  height: 80px;
  background-color: #28a745; /* Verde */
  border-radius: 40px;
  justify-content: center;
  align-items: center;
`;
