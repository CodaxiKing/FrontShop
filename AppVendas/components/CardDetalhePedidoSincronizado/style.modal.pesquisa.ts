import styled from "styled-components/native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  background-color: white;
  width: 95%;
  border-radius: 10px;
  padding: 20px;
`;

export const ModalTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
`;

export const Table = styled.View`
  width: 100%;
`;

export const TableHeader = styled.View`
  background-color: #f9f9f9;
`;

export const TableFooter = styled.View`
  margin-top: 0px;
`;

export const TableRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
  padding: 0;
`;

export const TableCell = styled.Text<{
  header?: boolean;
  footer?: boolean;
  center?: boolean;
  masculine?: boolean;
  feminine?: boolean;
  unissex?: boolean;
}>`
  flex: 1;
  text-align: ${({ center }) => (center ? "center" : "left")};
  font-weight: ${({ header, footer }) =>
    header || footer ? "bold" : "normal"};
  color: ${({ footer }) => (footer ? "#333" : "#000")};
  font-size: ${({ footer }) => (footer ? "14px" : "12px")};
  padding: 5px;
  background-color: ${({ masculine, feminine, unissex }) =>
    masculine
      ? "#e6f0ff"
      : feminine
      ? "#ffe6f7"
      : unissex
      ? "#f2f2f2"
      : "transparent"};
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
`;

export const ButtonClose = styled.TouchableOpacity`
  background-color: #006ffd;
  padding: 10px 20px;
  border-radius: 5px;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  text-align: center;
`;
