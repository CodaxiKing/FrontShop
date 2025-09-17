import styled from "styled-components/native";

export const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
`;

export const ModalContainer = styled.View`
  width: 90%;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  elevation: 5;
`;

export const ModalHeader = styled.View`
  flex-direction: row;
  /* justify-content: space-between; */
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

export const Subtitle = styled.Text`
  font-size: 14px;
  color: #007bff;
  margin-left: 8px;
`;

export const Section = styled.View`
  margin-bottom: 20px;
`;

export const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const Input = styled.TextInput`
  flex: 1;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-right: 10px;
`;

export const TextArea = styled.TextInput`
  flex: 1;
  height: 80px;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin-left: 10px;
`;

export const RadioGroup = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const RadioButton = styled.TouchableOpacity`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid #ccc;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

export const RadioLabel = styled.Text`
  margin-right: 20px;
  font-size: 14px;
`;

export const CardContainer = styled.View`
  margin-bottom: 10px;
`;

export const CardRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const CardInput = styled.TextInput`
  flex: 1;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-right: 10px;
`;

export const AddCardButton = styled.TouchableOpacity`
  padding: 10px;
  background-color: #007bff;
  border-radius: 8px;
  align-items: center;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const CancelButton = styled.TouchableOpacity`
  flex: 1;
  background-color: transparent;
  border: 1px solid #007bff;
  border-radius: 8px;
  align-items: center;
  padding: 10px;
  margin-right: 10px;
`;

export const SaveButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #007bff;
  border-radius: 8px;
  align-items: center;
  padding: 10px;
`;
