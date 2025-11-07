import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { TopProvider } from "@/context/TopContext";

import CriarBandejaVendedorComponent from "@/components/CriarBandejaVendedorComponent";
import { LabelComponent } from "@/components/LabelComponent";

// Conecta com o banco SQLite

const CriarBandejaVendedor: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="" labelTextPrefix={false} />
      <CriarBandejaVendedorComponent />
    </Theme>
  );
};

export default CriarBandejaVendedor;
