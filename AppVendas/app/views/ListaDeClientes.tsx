import React from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import { ListaClientes } from "@/components/ListaClientes";
import { TopProvider } from "@/context/TopContext";

const ListaDeClientes: React.FC = () => {
  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="" />
      <ListaClientes />
    </Theme>
  );
};

export default ListaDeClientes;
