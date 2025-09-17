import styled from "styled-components/native";
import { TextInputMask } from "react-native-masked-text";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
`;

export const BoxContainer = styled.View`
  align-content: center;
  justify-content: center;
  width: 92%;
  margin: 0 auto;
  background-color: #f1f1f1;
  border-radius: 16px;
`;

export const ModalHeader = styled.View`
  background-color: #fff;
  padding: 20px;
  margin: 10px;
  border-radius: 16px;

  align-items: center;
`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

export const ModalBody = styled.View`
  background-color: #fff;
  padding: 20px;
  margin: 10px;
  border-radius: 16px;
`;

export const FilterRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const FilterColumn = styled.View`
  width: 48%;
`;

export const FilterLabel = styled.Text`
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
`;

export const FilterInput = styled.TextInput`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  color: #333;
`;

export const ModalFooter = styled.View`
  padding: 15px;
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
`;

export const FilterButton = styled.TouchableOpacity`
  background-color: #007bff;
  padding: 10px 20px;
  border-radius: 8px;
`;

export const FilterButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

export const AdditionalFiltersContainer = styled.View``;

export const AdditionalFilterRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  /* gap: 10px; */
  /* margin-bottom: 16px; */
`;

export const AdditionalFilterGroup = styled.View`
  margin-bottom: 20px;
`;

export const AdditionalFilterInput = styled.TextInput`
  background-color: #fff;
  width: 130px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  text-align: center; /* Centraliza o placeholder */
  color: #333;
  margin-top: 5px;
  /* margin-right: 10px; */
`;
export const AdditionalFilterInputMoney = styled(TextInputMask)`
  background-color: #fff;
  width: 130px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  text-align: center; /* Centraliza o placeholder */
  color: #333;
  margin-top: 5px;
  /* margin-right: 10px; */
`;
