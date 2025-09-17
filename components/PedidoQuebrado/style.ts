import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const Container = styled.View`
  background-color: #fff;
  padding: 16px;
  margin-bottom: 100px;
  width: 98%;
  /* flex: 1; */
  border-radius: 10px;
  margin: 0 10px;
`;

export const SearchInput = styled.TextInput`
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #dddddd;
  font-size: ${width > 600 ? "18px" : "14px"};
  padding: 16px;
  margin-bottom: 16px;
`;

export const TableContainer = styled.View`
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;

export const TableHeader = styled.View`
  flex-direction: row;
  background-color: #f2f2f2;
  padding: 12px;
`;

export const TableRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #dddddd;
  padding: 12px;
`;

export const TableCell = styled.View<{ flex?: number }>`
  flex: ${({ flex }) => flex || 1};
  justify-content: center;
  align-items: flex-start;
`;

export const TableText = styled.Text`
  font-size: ${width > 600 ? "14px" : "12px"};
  color: #333333;
`;

export const ActionButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;
