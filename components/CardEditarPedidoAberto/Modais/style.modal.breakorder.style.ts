import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ModalContent = styled.View`
  width: 90%;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  align-items: center;
  elevation: 10;
`;

export const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

export const Message = styled.Text`
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const RadioContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

export const RadioButton = styled.TouchableOpacity<{ selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border-width: 2px;
  border-color: ${({ selected }) => (selected ? '#007bff' : '#ccc')};
  background-color: ${({ selected }) => (selected ? '#007bff' : '#fff')};
  margin-right: 10px;
`;

export const RadioLabel = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const CancelButton = styled.TouchableOpacity`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  background-color: #ccc;
  align-items: center;
  margin-right: 10px;
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
