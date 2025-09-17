import styled from "styled-components/native";

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.9);
  justify-content: center;
  align-items: center;
`;

export const ModalContainer = styled.View`
  width: 90%;
  max-width: 500px;
  background-color: #f1f1f1;
  border-radius: 10px;
  padding: 20px;
  elevation: 5;
`;

export const SectionContainer = styled.View`
  width: 100%;
  height: 150px;
  justify-content: center;
  align-items: center;
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
  width: 60%;
  color: #000;

  text-align: center;
`;

export const ModalHeader = styled.Text`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: #ccc;
  margin-bottom: 20px;
`;

export const ModalContent = styled.View``;

export const ModalInput = styled.Text`
  font-size: 14px;
  color: #333;
`;

export const CheckboxContainer = styled.View`
  flex-direction: row;
  align-items: center;
  /* margin-top: 10px; */
`;

export const Checkbox = styled.View<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 5px;
  background-color: ${({ checked }) => (checked ? "#007bff" : "transparent")};
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  align-self: flex-end;
`;

export const CancelButton = styled.TouchableOpacity`
  padding: 10px;
  border-radius: 5px;
  background-color: #ccc;
  width: 48%;
  align-items: center;
`;

export const SaveButton = styled.TouchableOpacity`
  padding: 10px;
  border-radius: 5px;
  background-color: #007bff;
  width: 48%;
  align-items: center;
`;

export const CancelButtonText = styled.Text`
  color: #333;
`;

export const SaveButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;
