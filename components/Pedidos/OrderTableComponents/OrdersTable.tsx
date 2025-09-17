// OrderTableComponents/OrdersTable.tsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";

import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableText,
  StatusText,
  ActionsContainer,
} from './style';
import ErrorTableData from '../ErrorTableData';
import { Pedido } from "@/types/types";

interface OrdersTableProps {
  pedidos: Pedido[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ pedidos }) => {
  const navigation = useNavigation();

  if (!pedidos || pedidos.length === 0) {
    return <ErrorTableData />;
  }

  return (
    <Table>
      <TableHeader>
        <TableCell flex={1}>
          <TableText>ID</TableText>
        </TableCell>
        <TableCell flex={2}>
          <TableText>Dt. Pedido</TableText>
        </TableCell>
        <TableCell flex={3}>
          <TableText>Cliente</TableText>
        </TableCell>
        <TableCell flex={2}>
          <TableText>Qt. Produtos</TableText>
        </TableCell>
        <TableCell flex={2}>
          <TableText>Valor Total</TableText>
        </TableCell>
        <TableCell flex={2}>
          <TableText>Status</TableText>
        </TableCell>
        <TableCell flex={2}>
          <TableText>Ações</TableText>
        </TableCell>
      </TableHeader>

      {pedidos.map((item) => (
        <TableRow key={item.id}>
          <TableCell flex={1}>
            <TableText>{item.id}</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>{item.dataPedido}</TableText>
          </TableCell>
          <TableCell flex={3}>
            <TableText>{item.cliente}</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>{item.qtProdutos}</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>{item.valorTotal}</TableText>
          </TableCell>
          <TableCell flex={2}>
            <StatusText status={item.status}>{item.status}</StatusText>
          </TableCell>
          <TableCell flex={2}>
            <ActionsContainer>
              <TouchableOpacity
                onPress={() => navigation.navigate('DetalhePedidoAberto')}
                style={{ marginRight: 15 }}
              >
                <FontAwesome name="search" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Carrinho')}>
                <FontAwesome5 name="clipboard-list" size={20} color="#000" />
              </TouchableOpacity>
            </ActionsContainer>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default OrdersTable;
