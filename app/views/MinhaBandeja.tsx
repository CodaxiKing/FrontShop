import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { TopProvider } from "@/context/TopContext";

import MinhaBandejaComponent from "@/components/MinhaBandejaComponent";
import { LabelComponent } from "@/components/LabelComponent";

const MinhaBandeja: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="" />
      <MinhaBandejaComponent />
    </Theme>
  );
};

export default MinhaBandeja;
