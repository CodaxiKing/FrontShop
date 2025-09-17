import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { TopProvider } from "@/context/TopContext";

import EditarBandejaVendedorComponent from "@/components/EditarBandejaVendedorComponent";

const EditarBandejaVendedor: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      {/* <LabelComponent /> */}
      <EditarBandejaVendedorComponent />
    </Theme>
  );
};

export default EditarBandejaVendedor;
