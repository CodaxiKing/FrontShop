import React from "react";
import { ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  Container,
  SearchInput,
  TableContainer,
  TableHeader,
  TableRow,
  TableCell,
  TableText,
  ActionButton,
} from "./style";

const mockData = [
  {
    date: "12/09/24",
    client: "Criare Sistemas",
    orderValue: "R$ 800,00",
    quantity: 4,
    balanceValue: "R$ 400,00",
    balanceQty: 2,
    redeemed: 0,
  },
  {
    date: "12/09/24",
    client: "Criare Sistemas",
    orderValue: "R$ 800,00",
    quantity: 4,
    balanceValue: "R$ 400,00",
    balanceQty: 2,
    redeemed: 0,
  },
  {
    date: "12/09/24",
    client: "Criare Sistemas",
    orderValue: "R$ 800,00",
    quantity: 4,
    balanceValue: "R$ 400,00",
    balanceQty: 2,
    redeemed: 0,
  },
];

const TablePedidoSicronizadoQuebrado: React.FC = () => {
  return (
    <ScrollView>
      <Container>
        <SearchInput placeholder="Filtrar por Status, Data e Buscar (Dados Clientes)" />
        <TableContainer>
          {/* Table Header */}
          <TableHeader>
            <TableCell flex={1.2}>
              <TableText>Dt. Fat.</TableText>
            </TableCell>
            <TableCell flex={2}>
              <TableText>Razão</TableText>
            </TableCell>
            <TableCell flex={2}>
              <TableText>Val. Pedido</TableText>
            </TableCell>
            <TableCell flex={1}>
              <TableText>Qtd. Pedido</TableText>
            </TableCell>
            <TableCell flex={2}>
              <TableText>Val. Saldo</TableText>
            </TableCell>
            <TableCell flex={1}>
              <TableText>Qtd. Saldo</TableText>
            </TableCell>
            <TableCell flex={1}>
              <TableText>Resgatado</TableText>
            </TableCell>
            <TableCell flex={1}>
              <TableText>Ações</TableText>
            </TableCell>
          </TableHeader>

          {/* Table Rows */}
          {mockData.map((item, index) => (
            <TableRow key={index}>
              <TableCell flex={1}>
                <TableText>{item.date}</TableText>
              </TableCell>
              <TableCell flex={2}>
                <TableText>{item.client}</TableText>
              </TableCell>
              <TableCell flex={2}>
                <TableText>{item.orderValue}</TableText>
              </TableCell>
              <TableCell flex={1}>
                <TableText>{item.quantity}</TableText>
              </TableCell>
              <TableCell flex={2}>
                <TableText>{item.balanceValue}</TableText>
              </TableCell>
              <TableCell flex={1}>
                <TableText>{item.balanceQty}</TableText>
              </TableCell>
              <TableCell flex={1}>
                <TableText>{item.redeemed}</TableText>
              </TableCell>
              <TableCell flex={1}>
                <ActionButton>
                  <FontAwesome name="search" size={24} color="#000" />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableContainer>
      </Container>
    </ScrollView>
  );
};

export default TablePedidoSicronizadoQuebrado;
