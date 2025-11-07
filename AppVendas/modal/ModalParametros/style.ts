import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
`;

export const BoxContainer = styled.View`
  width: 60%;
  background-color: #f1f1f1;
  border-radius: 16px;
`;

export const ModalHeader = styled.View`
  background-color: #fff;
  padding: 20px;
  margin: 10px;
  border-radius: 16px;
  align-items: center;
`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

export const ModalBody = styled.View`
  background-color: #fff;
  padding: 20px;
  margin: 10px;
  border-radius: 16px;
`;

export const ModalFooter = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  /* background-color: #fff; */
  padding: 15px;
  gap: 10px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

export const InputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* Maior espaçamento entre itens */
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #333;
  flex: 1; /* Expande para ocupar o espaço */
`;

export const ButtonCancel = styled.TouchableOpacity`
  background-color: #f5f5f5; /* Fundo cinza claro */
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

export const ButtonSave = styled.TouchableOpacity`
  background-color: #007bff; /* Azul padrão */
  padding: 10px 20px;
  border-radius: 8px;
`;

export const ButtonTextCancel = styled.Text`
  color: #333;
  font-size: 16px;
  font-weight: bold;
`;

export const ButtonTextSave = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;
