import React, { useEffect, useState } from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { useRoute } from "@react-navigation/native";
import { LabelComponent } from "@/components/LabelComponent";

import { TopProvider } from "@/context/TopContext";
import ListaBandejaCatalogoFechado from "@/components/ListaBandejaCatalogoFechado";

const BandejaCatalogoFechado: React.FC = () => {
  const [razaoSocial, setRazaoSocial] = useState<string>("Itens da Bandeja");
  const [carregando, setCarregando] = useState<boolean>(true);

  const route = useRoute();

  const { bandejaCodigo, bandejaNome } = route.params as {
    bandejaCodigo: string;
    bandejaNome: string;
  };

  useEffect(() => {
    setCarregando(false); // Define o carregamento como falso após buscar as informações
  }, [bandejaCodigo]);

  if (carregando) {
    return (
      <Theme>
        <LabelComponent labelText="Carregando..." />
      </Theme>
    );
  }

  return (
    <Theme>
      <TopProvider>
        <Top />
        <LabelComponent bandejaText={bandejaNome} />
        <ListaBandejaCatalogoFechado bandejaCodigo={bandejaCodigo} />
      </TopProvider>
    </Theme>
  );
};

export default BandejaCatalogoFechado;
