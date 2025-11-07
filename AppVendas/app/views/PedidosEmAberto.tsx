import React, { useState, useEffect, useContext } from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  Tab,
  NewOrderButton,
  SyncButton,
  ButtonText,
  Container,
  TabText,
  TabsHeader,
  FooterContainer,
  FooterContainerEmAberto,
} from "@/components/Pedidos/style";
import TablePedidosAbertos from "@/components/Pedidos/TablePedidosAbertos";
import TablePreVendas from "@/components/Pedidos/TablePreVendas";
import TableSicronizacao from "@/components/Pedidos/Sicronização";
import { TopProvider } from "@/context/TopContext";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import * as SQLite from "expo-sqlite";
import { RootStackParamList } from "@/types/types";
import AuthContext from "@/context/AuthContext";
import {
  fetchAllPedidosSincronizados,
  postPedidoData,
} from "@/services/ApiService";
import { LabelComponent } from "@/components/LabelComponent";

// Conecta com o banco SQLite
const db = SQLite.openDatabaseSync("user_data.db");

const PedidosEmAberto: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("em_aberto");
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { userData, accessToken } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    // fetchPedidos();
  }, [navigation]);

  // console.log("Pedido Selecionado:", selectedOrders);

  // SOMENTE PARA CONSULTA DA TABELA DE PEDIDO, NÃO FAZ NADA ALÉM DISSO.
  const fetchPedidos = async () => {
    try {
      if (representanteId) {
        // console.log("Representante ID Pedidos em Aberto: ", representanteId);
        // await db.runAsync(`DELETE FROM NovoPedido`);
        // await db.runAsync(`DELETE FROM Pedido`);
        // console.log("Tabela Deletada/Dropada");
      }
    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Erro", "Falha ao carregar pedidos.");
    }
  };

  const syncOrders = async () => {
    // Verifica se há pedidos selecionados
    if (selectedOrders.length === 0) {
      Alert.alert("Atenção", "Nenhum pedido selecionado para sincronizar.");
      return;
    }

    // Verifica a conectividade com a internet

    // Inicia o processo de sincronização
    setIsSyncing(true);

    let syncResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      for (const order of selectedOrders) {
        try {
          if (!accessToken) {
            throw new Error("Token de acesso não disponível.");
          }

          // Tenta sincronizar o pedido
          const response = await postPedidoData(accessToken, [order]);

          if (!response || response.status < 200 || response.status >= 300) {
            throw new Error(`Erro ao sincronizar pedido ${order.id}`);
          }

          // Sincronização bem-sucedida
          syncResults.success++;

          // Remove o pedido da base local após sincronização bem-sucedida
          const deleteQuery = `DELETE FROM Pedido WHERE id = ?;`;
          await db.runAsync(deleteQuery, [order.id]);

          // Atualiza a chave para recarregar a lista de pedidos
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          // Captura erros durante a sincronização de um pedido específico
          syncResults.failed++;
          syncResults.errors.push(
            `Pedido de ${order.razaoSocial}: ${error.message}`
          );
          console.error(
            "Erro na sincronização do pedido",
            order.id,
            ":",
            error
          );
        }
      }

      // Exibe o resultado da sincronização
      if (syncResults.failed === 0) {
        if (syncResults.success === 1) {
          Alert.alert("Sucesso", `Pedido sincronizado com sucesso.`);
        } else {
          Alert.alert(
            "Sucesso",
            `Todos os ${syncResults.success} pedidos foram sincronizados com sucesso.`
          );
        }
      } else if (syncResults.success > 0) {
        Alert.alert(
          "Atenção",
          `${syncResults.success} pedidos sincronizados, mas ${
            syncResults.failed
          } falharam.\n\nErros:\n${syncResults.errors.join("\n")}`
        );
      } else {
        Alert.alert(
          "Erro",
          `Nenhum pedido foi sincronizado.\n${syncResults.errors.join("\n")}`
        );
      }
    } catch (error) {
      // Captura erros gerais durante o processo de sincronização
      console.error("Erro geral na sincronização:", error);
      Alert.alert("Erro", "Ocorreu um erro durante a sincronização.");
    } finally {
      await fetchAllPedidosSincronizados(accessToken);
      // Finaliza o processo de sincronização
      setIsSyncing(false);
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "em_aberto":
        return (
          <TablePedidosAbertos
            onSelectionChange={(selected) => setSelectedOrders(selected)}
            refreshKey={refreshKey}
            representanteId={representanteId ?? ""}
          />
        );
      case "pre_venda":
        return (
          <TablePreVendas
            onSelectionChange={(selected) => setSelectedOrders(selected)}
            refreshKey={refreshKey}
            representanteId={representanteId ?? ""}
          />
        );
      case "sincronizados":
        return <TableSicronizacao />;
      default:
        return null;
    }
  };

  const RenderLoading = () => {
    return (
      <>
        {/* Fundo preto com opacidade */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            // backgroundColor: "rgba(0, 0, 0, 0.5)", // Preto com 50% de opacidade
            zIndex: 9998, // Z-index menor que o do conteúdo central
          }}
        />

        {/* Conteúdo central (loading) */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999, // Z-index maior para ficar acima do fundo
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              height: 150,
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text style={{ marginBottom: 15, fontSize: 16 }}>
              Processando...
            </Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </View>
      </>
    );
  };

  const renderFooterButtons = () => {
    if (activeTab === "em_aberto" || activeTab === "pre_venda") {
      return (
        <FooterContainerEmAberto>
          {!isSyncing ? (
            <>
              <NewOrderButton
                onPress={() => navigation.navigate("ListaDeClientes")}
              >
                <ButtonText>Novo Pedido</ButtonText>
              </NewOrderButton>
              <SyncButton onPress={syncOrders}>
                <ButtonText>Sincronizar</ButtonText>
              </SyncButton>
            </>
          ) : (
            <>
              <NewOrderButton
                onPress={() => navigation.navigate("ListaDeClientes")}
              >
                <ButtonText>Novo Pedido</ButtonText>
              </NewOrderButton>
              <SyncButton>
                <ButtonText>Sincronizando Pedidos ...</ButtonText>
              </SyncButton>
            </>
          )}
        </FooterContainerEmAberto>
      );
    } else if (activeTab === "sincronizados") {
      return (
        <FooterContainerEmAberto>
          <NewOrderButton
            onPress={() => navigation.navigate("ListaDeClientes")}
          >
            <ButtonText>Novo Pedido</ButtonText>
          </NewOrderButton>
        </FooterContainerEmAberto>
      );
    }
  };

  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="" labelTextPrefix={false} />
      {isSyncing && <RenderLoading />}
      <ScrollView>
        <Container>
          <TabsHeader>
            <Tab
              active={activeTab === "em_aberto"}
              onPress={() => setActiveTab("em_aberto")}
            >
              <TabText active={activeTab === "em_aberto"}>EM ABERTO</TabText>
            </Tab>
            <Tab
              active={activeTab === "pre_venda"}
              onPress={() => setActiveTab("pre_venda")}
            >
              <TabText active={activeTab === "pre_venda"}>PRÉ-VENDA</TabText>
            </Tab>
            <Tab
              active={activeTab === "sincronizados"}
              onPress={() => setActiveTab("sincronizados")}
            >
              <TabText active={activeTab === "sincronizados"}>
                SINCRONIZADOS
              </TabText>
            </Tab>
          </TabsHeader>

          {renderContent()}
          {renderFooterButtons()}
        </Container>
      </ScrollView>
    </Theme>
  );
};

export default PedidosEmAberto;
