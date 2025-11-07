import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import PagamentoCard from "@/components/CardCarrinho/PagamentoCard";
import Button from "@/components/Button";
import { TopProvider } from "@/context/TopContext";

const ModalPagamentoCartaoDeCredito: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="Carrinho" />
      <PagamentoCard />
      <Button
        title={"Continuar"}
        marginTop={"20px"}
        padding={"14px 80px"}
        fontSize={20}
      />
    </Theme>
  );
};

export default ModalPagamentoCartaoDeCredito;
