import React from "react";
import { ScrollView } from "react-native";
import {
  TableContainer,
  TableHeader,
  TableHeaderCell,
  HeaderText,
  TableRow,
  TableCell,
  CellText,
} from "./style";

interface Column {
  key: string;
  title: string;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: { [key: string]: string | number }[];
}

export const TableStripped: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <ScrollView horizontal>
      <TableContainer>
        <TableHeader>
          {columns.map((column) => (
            <TableHeaderCell key={column.key} width={column.width}>
              <HeaderText>{column.title}</HeaderText>
            </TableHeaderCell>
          ))}
        </TableHeader>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex} isEven={rowIndex % 2 === 0}>
            {columns.map((column) => (
              <TableCell key={column.key} width={column.width}>
                <CellText>{row[column.key]}</CellText>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableContainer>
    </ScrollView>
  );
};
