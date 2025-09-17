import React from "react";
import { ContainerFooterCard, TextEmpresa } from "./style";

interface FooterTotalProps {
  total: number;
}

const FooterTotal: React.FC<FooterTotalProps> = ({ total }) => (
  <ContainerFooterCard>
    <TextEmpresa fontSize={17} weight={600}>
      Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </TextEmpresa>
  </ContainerFooterCard>
);

export default FooterTotal;
