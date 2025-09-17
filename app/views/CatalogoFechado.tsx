import React, { useEffect, useState } from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LabelComponent } from "@/components/LabelComponent";
import ListaCatalogoFechado from "@/components/ListaCatalogoFechado";
import * as SQLite from "expo-sqlite";
import { TopProvider } from "@/context/TopContext";
import { SelectedProductsProvider } from "@/context/SelectedProductsContext";

const db = SQLite.openDatabaseSync("user_data.db");

const CatalogoFechado: React.FC = () => {
  const [razaoSocial, setRazaoSocial] = useState<string>("Novo Pedido");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [labelText, setLabelText] = useState<string>("Novo Pedido");

  const navigation = useNavigation();
  const route = useRoute();
  const { cpfCnpj, clienteId, filtroTipo, filtroNome, catalogOpen } =
    route.params as {
      cpfCnpj: string;
      clienteId: number;
      pedidoId: number;
      filtroTipo?: string;
      filtroCodigo?: string;
      filtroNome?: string;
      catalogOpen?: boolean;
    };

  useEffect(() => {
    const fetchData = async () => {
      if (cpfCnpj || clienteId) {
        await fetchRazaoSocial(cpfCnpj, clienteId);
      } else {
        console.warn("Nenhum CNPJ ou clienteId recebido.");
      }

      setCarregando(false);
      navigation.setOptions({ headerShown: false });
    };
    fetchData();
  }, [navigation, cpfCnpj, clienteId]);

  useEffect(() => {
    if (filtroTipo && filtroNome) {
      setLabelText(razaoSocial);
    } else {
      setLabelText(razaoSocial);
    }
  }, [razaoSocial, filtroTipo, filtroNome]);

  const fetchRazaoSocial = async (cpfCnpj: string, clienteId: number) => {
    try {
      const query = `
        SELECT razaoSocial 
        FROM CarteiraCliente 
        WHERE cpfCnpj = ? OR clienteId = ? 
        LIMIT 1
      `;

      const result: { razaoSocial?: string }[] = await db.getAllAsync(query, [
        cpfCnpj,
        clienteId,
      ]);

      if (result.length > 0 && result[0]?.razaoSocial) {
        setRazaoSocial(result[0].razaoSocial);
      } else {
        setRazaoSocial("Novo Pedido");
      }
    } catch (error) {
      console.error("Erro ao buscar razão social:", error);
      setRazaoSocial("Novo Pedido");
    }
  };

  const lblVitrine = catalogOpen ? "Vitrine" : labelText;

  if (carregando) {
    return (
      <Theme>
        <LabelComponent labelText="Carregando..." />
      </Theme>
    );
  }

  return (
    <Theme>
      <SelectedProductsProvider>
        {catalogOpen && (
          <TopProvider>
            <Top catalogOpen={catalogOpen} />
          </TopProvider>
        )}
        {!catalogOpen && <Top catalogOpen={catalogOpen} />}
        <LabelComponent labelText={lblVitrine} labelTextPrefix={true} />
        <ListaCatalogoFechado />
        {/* </TopProvider> */}
      </SelectedProductsProvider>
    </Theme>
  );
};

export default CatalogoFechado;
