import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import { CopiarPedidoComponent } from "@/components/CopiarPedidoComponent";
import { TopProvider } from "@/context/TopContext";

const CopiarPedido: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="Copiar Pedido" />
      <CopiarPedidoComponent />
    </Theme>
  );
};

export default CopiarPedido;
