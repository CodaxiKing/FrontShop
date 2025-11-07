import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: #f1f1f1;
  width: 60%;
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
`;

export const CardSection = styled.View`
  margin-bottom: 0px;
`;

export const Message = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 40px;
  text-align: center;
  color: #333;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
  width: 100%;
`;

export const RadioContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

export const RadioButton = styled.TouchableOpacity<{ selected: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  border-width: 2px;
  border-color: ${({ selected }) => (selected ? "#007bff" : "#ccc")};
  background-color: ${({ selected }) => (selected ? "#007bff" : "#fff")};
  margin-right: 10px;
`;

export const RadioLabel = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const CancelButton = styled.TouchableOpacity`
  background-color: #ccc;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
`;

export const ConfirmButton = styled.TouchableOpacity`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  background-color: #007bff;
  align-items: center;
`;

export const ButtonText = styled.Text`
  font-size: 16px;
  color: #fff;
`;
