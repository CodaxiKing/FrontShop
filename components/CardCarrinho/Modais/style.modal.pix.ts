import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: #f1f1f1;
  width: 80%;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

export const ContainerTitle = styled.View`
  background-color: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  padding: 20px;
`;

export const ContainerBody = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
`;

export const ModalSubtitle = styled.Text`
  font-weight: bold;
  font-size: 16px;
  color: #000;
  margin-right: 20px;
  margin-left: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

export const ContainerCondicaoPagamento = styled.View`
  margin-bottom: 14px;
  flex-direction: column;
`;

export const ContainerValorSubtitle = styled.Text`
  font-weight: bold;
  margin-bottom: 5px;
`;

export const ContainerValorPedido = styled.View``;

export const ContainerValor = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 50%;
  margin: 0 4px;
`;

export const TitleValor = styled.Text`
  text-align: left;
  font-weight: bold;
`;

export const AmoutValor = styled.Text`
  font-weight: bold;
  color: #555;
`;

export const CardSection = styled.View`
  margin-bottom: 15px;
`;

export const Input = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
  width: 100%;
`;

export const Button = styled.View`
  background-color: #007bff;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 10px;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
`;

export const CloseButton = styled.View`
  background-color: #ccc;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
`;

export const CloseButtonText = styled.Text`
  color: #000;
  font-size: 16px;
`;

export const FlexRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;
