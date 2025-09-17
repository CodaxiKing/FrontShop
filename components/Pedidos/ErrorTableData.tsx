import React from "react";
import { Text } from "react-native";

const ErroPedidos: React.FC = () => {
  return (
    <>
      <Text style={{ padding: 16, textAlign: "center" }}>
        Nenhum Pedido Pré-venda Encontrado.
      </Text>
    </>
  );
};

export default ErroPedidos;
