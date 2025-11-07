import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: #f1f1f1;
  width: 70%;
  /* width: 609px; */
  border-radius: 10px;
  padding: 20px;
  align-items: center;
`;

export const ModalHeader = styled.View`
  margin-bottom: 20px;
  background-color: #fff;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
  align-items: center;
`;

export const ModalTitle = styled.Text`
  font-weight: bold;
  text-align: center;
`;

export const Card = styled.View`
  /* background-color: red; */
  background-color: #fff;
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  width: 190px;
  align-items: center;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  padding: 2px 0;
  width: 100%;
`;

export const CardImage = styled.Image`
  width: 100%;
  /* width: 160px; */
  height: 240px;
  border-radius: 10px;
  resize-mode: contain;
`;

export const CardContent = styled.View`
  margin: 10px 0;
  align-items: center;
`;

export const CardTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
  text-align: center;
`;

export const CardSubtitle = styled.Text`
  font-size: 12px;
  color: #666;
  text-align: center;
`;

export const CardFooter = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

export const QuantityContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const QuantityButton = styled.TouchableOpacity`
  background-color: #eef3ff;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
`;

export const QuantityText = styled.TextInput`
  color: #006ffd;
  font-size: 14px;
  font-weight: bold;
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
`;

export const ButtonCancel = styled.TouchableOpacity`
  background-color: #fff;
  border: 1px solid #006ffd;
  padding: 10px;
  border-radius: 5px;
  width: 160px;
  align-items: center;
`;

export const ButtonConfirm = styled.TouchableOpacity`
  background-color: #006ffd;
  padding: 10px;
  border-radius: 5px;
  width: 160px;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  text-align: center;
`;

export const ButtonTextBlue = styled(ButtonText)`
  color: #006ffd;
`;
