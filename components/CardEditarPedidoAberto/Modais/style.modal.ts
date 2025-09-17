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

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const InputRow = styled.View`
  flex: 1;
  margin-right: 10px;
`;
export const InputRowLast = styled(InputRow)`
  margin-right: 0;
`;

export const InputSmall = styled.TextInput`
  border: 1px solid #ddd;
  background-color: #fff;
  width: 100%;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;

  ${(props) =>
    props.editable === false &&
    `
    background-color: #F0F0F0;  
    border-color: #DCDCDC;     
    color: #777;               
  `}
`;

export const InputLabelSmall = styled.Text`
  font-weight: bold;
  margin-bottom: 5px;
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

export const ButtonClose = styled.TouchableOpacity`
  background-color: #fff;
  border: 1px solid #006ffd;
  border-radius: 5px;
  padding: 10px;
  width: 30%;
  align-items: center;
`;

export const ButtonSelect = styled.TouchableOpacity`
  background-color: #006ffd;
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
  color: #006ffd;
`;

export const SearchButton = styled.TouchableOpacity`
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 40px;
  border: 1px solid #ddd;
`;

export const SearchButtonContent = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;
