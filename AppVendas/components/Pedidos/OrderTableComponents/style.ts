import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const Container = styled.View`
  background-color: #f8f8f8;
  padding: 16px;
  width: 100%;
  margin-bottom: 50px;
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
`;

export const Tab = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  align-items: center;
  background-color: #fff;
  border-bottom-width: ${({ active }) => (active ? "4px" : "0px")};
  border-bottom-color: #007bff;
`;

export const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? "#007bff" : "#333")};
  font-weight: bold;
`;

export const SearchInput = styled.TextInput<{ activeTab: string }>`
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #dddddd;
  font-size: ${width > 600 ? "14px" : "14px"};
  padding: 20px 8px;
  width: ${({ activeTab }) =>
    activeTab === "sincronizados" || activeTab === "em_aberto" ? "55%" : "80%"};
`;

export const Table = styled.View`
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
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
  align-items: ${({ align }) => align || "flex-start"};
  justify-content: center;
  padding: 10px;
  min-width: 80px; /* Adiciona largura mínima */
`;

export const TableText = styled.Text`
  color: #333333;
  font-size: 14px;
`;

export const TableContainer = styled.View`
  width: 100%;
  flex-direction: column;
  overflow: hidden;
`;

export const StatusText = styled.Text<{ status: string }>`
  color: ${({ status }) =>
    status === "Aberto"
      ? "green"
      : status === "Falha Process."
      ? "orange"
      : status === "Pré-venda"
      ? "orange"
      : status === "Atendido"
      ? "green"
      : "red"};
  font-weight: bold;
  text-align: center;
`;

export const ActionsContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Button = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  margin: 8px;
  align-items: center;
  border-radius: 8px;
`;

export const NewOrderButton = styled(Button)`
  background-color: #23a6f0;
  width: 325px;
`;

export const SyncButton = styled(Button)`
  background-color: #5ebc00;
  width: 325px;
`;

export const ButtonText = styled.Text`
  color: #ffffff;
  font-weight: bold;
  text-align: center;
`;

export const Slider = styled.View<{ activeTab: string }>`
  position: absolute;
  bottom: 0;
  height: 3px;
  width: 33%;
  background-color: blue;
  left: ${({ activeTab }) =>
    activeTab === "em_aberto"
      ? "0%"
      : activeTab === "pre_venda"
      ? "33%"
      : "66%"};
  transition: left 0.3s ease-in-out;
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

// export const TableContainer = styled.View`
//   width: 100%;
// `;

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
