import styled from "styled-components/native";

export const Dropdown = styled.View`
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

export const DropdownButton = styled.TouchableOpacity`
  padding: 10px;
  background-color: white;
`;

export const DropdownButtonContent = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

export const DropdownText = styled.Text`
  color: #333;
  font-size: 16px;
`;

export const DropdownItem = styled.TouchableOpacity`
  padding: 10px;
  background-color: #f9f9f9;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: white;
  width: 90%;
  border-radius: 10px;
  padding: 20px;
`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

export const InputContainer = styled.View`
  margin-bottom: 15px;
`;

export const InputLabel = styled.Text`
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
`;

export const Input = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background-color: #f0f0f0;
  color: #666;
  font-size: 16px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const InputSmall = styled(Input)`
  width: 48%;
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

export const ButtonClose = styled.TouchableOpacity`
  background-color: #fff;
  border: 1px solid #006FFD;
  border-radius: 5px;
  padding: 10px;
  width: 30%;
  align-items: center;
`;

export const ButtonSelect = styled.TouchableOpacity`
  background-color: #006FFD;
  padding: 10px;
  border-radius: 5px;
  width: 30%;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

export const ButtonTextBlue = styled(ButtonText)`
  color: #006FFD;
`;
