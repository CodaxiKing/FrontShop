import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import { TopProvider } from "@/context/TopContext";
import EditarPagamentoPedidoAbertoCard from "@/components/CardEditarPedidoAberto/EditarPagamentoPedidoAbertoCard";

const EditarFormaPagamentoPedidoAberto: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent />
      <EditarPagamentoPedidoAbertoCard />
    </Theme>
  );
};

export default EditarFormaPagamentoPedidoAberto;
