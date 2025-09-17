import styled from "styled-components/native";

export const ModalContainer = styled.View`
  width: 98%;
  flex: 1;
  border-radius: 16px;
`;

export const Header = styled.View`
  background-color: #fff;
  padding: 20px;
  margin: 10px;
  margin-bottom: 0;
  border-radius: 16px;
  align-items: center;
`;

export const HeaderTitle = styled.Text`
  font-weight: bold;
  text-align: center;
  color: #333;
`;

export const Body = styled.View`
  flex: 1;
  padding: 10px;
`;

export const InputContainer = styled.View`
  background-color: #fff;
  padding: 20px;
  border-radius: 16px;
`;

export const ProductsContainer = styled.View`
  flex: 1;
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
  border-radius: 16px;
`;

export const Footer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  margin-bottom: 20px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

export const Input = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-top: 5px;
`;

export const InputGroup = styled.View`
  margin-bottom: 15px;
`;

export const ItemContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  border-width: 1px;
  border-color: #ddd;
  margin-bottom: 10px;
  padding: 10px;
`;

export const ItemImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 10px;
`;

export const ItemDetails = styled.View`
  flex: 1;
`;

export const RemoveButton = styled.TouchableOpacity`
  padding: 10px;
`;

export const AddButton = styled.TouchableOpacity`
  background-color: #007bff;
  padding: 10px 20px;
  border-radius: 8px;
  margin-left: 10px;
`;

export const DropdownResultContainer = styled.View`
  max-height: 250px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 5px;
  overflow: hidden;
  z-index: 10;
`;

export const DropdownResultItem = styled.View`
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

export const DropdownResultItemText = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const NoResultsText = styled.Text`
  font-size: 14px;
  color: #999;
  padding: 10px;
  text-align: center;
`;
