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

export const LojasContainer = styled.View`
  width: 100%;
  margin-bottom: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export const ModalSubtitle = styled.Text`
  font-size: 16px;
  color: #555;
  margin-right: 20px;
  margin-left: 20px;
`;

export const ContainerBody = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
`;

export const TagContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  /* margin-bottom: 20px; */
`;

export const Tag = styled.Text`
  background-color: #e1f5fe;
  color: #007bff;
  padding: 8px 12px;
  border-radius: 20px;
  margin: 4px;
`;

export const CardSection = styled.View`
  margin-bottom: 0px;
`;

export const CheckBoxSection = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Label = styled.Text`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
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
  width: 49%;
  gap: 20px;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;
export const FlexColumn = styled.View`
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const RadioContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-content: center;
  margin-top: 10px;
  padding-left: 30px;
`;

export const RadioLabel = styled.Text`
  font-size: 14px;
  margin-left: 5px;
  margin-right: 15px;
`;

export const RadioButton = styled.View<{ selected: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  border: 2px solid ${({ selected }) => (selected ? "#007bff" : "#ccc")};
  background-color: ${({ selected }) => (selected ? "#007bff" : "transparent")};
  margin-right: 40px;
`;
