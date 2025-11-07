import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: #f1f1f1;
  width: 609px;
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
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

export const Card = styled.View`
  background-color: #fff;
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  width: 170px;
  align-items: center;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  padding: 2px 0;
  width: 100%;
`;

export const CardImage = styled.Image`
  width: 160px;
  height: 135px;
  border-radius: 10px;
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
  width: 80px;
`;

export const QuantityButton = styled.TouchableOpacity`
  background-color: #eef3ff;
  border-radius: 20px;
  align-items: center;
  height: 30px;
  justify-content: center;
  width: 30px;
`;

export const QuantityText = styled.Text`
  color: #006ffd;
  font-size: 14px;
  font-weight: bold;
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
`;

export const ButtonCancel = styled.TouchableOpacity`
  background-color: #fff;
  border: 1px solid #006ffd;
  padding: 10px;
  border-radius: 5px;
  width: 25%;
  align-items: center;
`;

export const ButtonConfirm = styled.TouchableOpacity`
  background-color: #006ffd;
  padding: 10px;
  border-radius: 5px;
  width: 35%;
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
