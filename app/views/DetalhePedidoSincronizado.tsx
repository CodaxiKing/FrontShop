import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import CardCarrinho from "@/components/CardCarrinho";
import TablePedidoSicronizadoQuebrado from "@/components/PedidoQuebrado";
import CardDetalhePedidoSincronizado from "@/components/CardDetalhePedidoSincronizado";
import { TopProvider } from "@/context/TopContext";
import TopCardPage from "@/components/TopCardPage";

const DetalhePedidoSicronizado: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="" labelTextPrefix={false}/>
      <TopCardPage textTopCard="Detalhe do Pedido Sincronizado" />
      <CardDetalhePedidoSincronizado />
      {/* <CardCarrinho /> */}
      {/* <LabelComponent labelText={`Pedido Quebrado por Saldo`} /> */}
      {/* <TablePedidoSicronizadoQuebrado /> */}
    </Theme>
  );
};

export default DetalhePedidoSicronizado;
