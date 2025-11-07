import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import { Text } from "react-native";
import { TelaDeSincronizacao } from "@/components/TelaDeSincronizacao";
import { TopProvider } from "@/context/TopContext";

const Sincronizacao: React.FC = () => {
  return (
    <Theme>
      {/* <TopProvider> */}
      <Top />
      {/* </TopProvider> */}
      <LabelComponent labelText="" />
      <TelaDeSincronizacao />
    </Theme>
  );
};

export default Sincronizacao;
