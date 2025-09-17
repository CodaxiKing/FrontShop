import React, { useEffect, useState } from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { LabelComponent } from "@/components/LabelComponent";
import { DetalhesCliente } from "@/components/DetalhesCliente";
import { TopProvider } from "@/context/TopContext";
import { ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("user_data.db");

const DetalhesDoCliente: React.FC = () => {
  const route = useRoute();
  const { codigo } = route.params as { codigo: string };
  const [nomeCliente, setNomeCliente] = useState<string>("Carregando...");

  useEffect(() => {
    if (codigo) {
      fetchNomeCliente(codigo);
    } else {
      setNomeCliente("Código inválido");
    }
  }, [codigo]);

  const fetchNomeCliente = async (codigoCliente: string) => {
    try {
      const query = `SELECT razaoSocial FROM CarteiraCliente WHERE codigo = ?`;
      const result = await db.getFirstAsync<{ razaoSocial: string }>(query, [
        codigoCliente,
      ]);

      if (result && result.razaoSocial) {
        setNomeCliente(result.razaoSocial);
      } else {
        setNomeCliente("Cliente não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar o nome do cliente:", error);
      setNomeCliente("Erro ao buscar cliente");
    }
  };

  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <ScrollView>
        <LabelComponent labelText={`Detalhes do Cliente \n ${nomeCliente}`} />
        <DetalhesCliente codigoCliente={codigo} />
      </ScrollView>
    </Theme>
  );
};

export default DetalhesDoCliente;
