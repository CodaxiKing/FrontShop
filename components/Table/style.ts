import styled from 'styled-components/native';

export const TableContainer = styled.View`
  width: 100%;
  margin-top: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

export const TableHeader = styled.View`
  flex-direction: row;
  background-color: #f7f7f7;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

export const TableHeaderCell = styled.View<{ width?: string }>`
  padding: 12px;
  flex: 1;
  ${({ width }) => (width ? `width: ${width};` : '')}
`;

export const HeaderText = styled.Text`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

export const TableRow = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
  background-color: #fff;
`;

export const TableCell = styled.View<{ width?: string }>`
  padding: 12px;
  flex: 1;
  ${({ width }) => (width ? `width: ${width};` : '')}
`;

export const CellText = styled.Text`
  font-size: 14px;
  color: #333;
`;
