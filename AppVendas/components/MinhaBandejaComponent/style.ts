import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const Container = styled.View`
  flex: 1;
  padding: 16px;
  width: 100%;
  min-width: 100%;
  margin-bottom: 50px;
`;

export const TableContainer = styled.View`
  flex: 1;
  background-color: #fff;
  padding-top: 4px;
  border-radius: 10px;
  flex-direction: column;
  overflow: hidden;
`;

export const TabsContainer = styled.View`
  background-color: #ffffff;
  border-radius: 8px;
  flex-direction: row;
  overflow: hidden;
  margin-bottom: 16px;
`;

export const TabsHeader = styled.View`
  background-color: #ffffff;
  flex-direction: row;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
  border-radius: 8px;
`;

export const Tab = styled.View`
  /* flex: 0.6; */
  padding: 12px;
  align-items: flex-start;
  background-color: #fff;

  border-bottom-width: 4px;
  border-bottom-color: #007bff;
`;

export const TabText = styled.Text`
  color: "#007bff";
  /* font-weight: bold; */
`;
export const TabTextName = styled.Text`
  font-weight: bold;
`;

export const SearchInput = styled.TextInput`
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #dddddd;
  font-size: 14px;
  padding: 20px 8px;
  width: "80%";
`;

export const Table = styled.View`
  background-color: #ffffff;
  border-radius: 8px;
  overflow: scroll;
  padding: 16px;
`;

export const TableRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 8px;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

export const TableHeader = styled(TableRow)`
  background-color: #f9f9f9;
`;

export const TableCell = styled.View<{ flex?: number; align?: string }>`
  flex: ${({ flex }) => flex || 1};
  align-items: ${({ align }) => align || "center"};
  justify-content: center;
  padding: 10px;
  min-width: 80px; /* Adiciona largura mínima */
`;

export const TableText = styled.Text`
  color: #333333;
  text-align: left;
`;

export const ActionsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

export const Button = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  margin: 8px;
  align-items: center;
  border-radius: 8px;
`;

export const ButtonContainer = styled.TouchableOpacity`
  background-color: #23a6f0;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  width: 320px;
  height: 50px;
  border-radius: 12px;
`;

export const ButtonText = styled.Text`
  color: #ffffff;
  font-weight: bold;
  text-align: center;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const ImportButton = styled.TouchableOpacity`
  background-color: #007bff;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  padding: 20px 16px;
  width: 20%;
`;

export const TableColumn = styled.Text`
  font-weight: bold;
  text-align: center;
  width: 100%;
`;

export const ActionButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
`;

export const FooterContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;
