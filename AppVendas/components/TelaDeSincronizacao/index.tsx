import React, {useEffect} from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import {
  Container,
  Header,
  HeaderLeft,
  HeaderRight,
  SyncInfo,
  CardContainer,
  Content,
  SyncAllButton,
  CompanyName,
  SyncEnvironment,
  AppStatus,
  HeaderTextContainer,
  UserLogo,
  UserLogoContainer,
  StatusContainer,
  StatusIndicator,
} from "./style";
import {
  FontAwesome5,
  FontAwesome6,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { SyncCardData, useSync } from "@/hooks/useSync";
import { SyncCard } from "../SyncCard";
import { useTopContext } from "@/context/TopContext";
import { CONFIGS } from "@/constants/Configs";
import * as SQLite from "expo-sqlite";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

// // DEBUG TEMPORÁRIO: progresso do download de imagens
// import { eventBus } from "@/core/eventBus";
// useEffect(() => {
//   const offP = eventBus.on("sync:images:progress", (p: any) => {
//     console.log("[img:event] progress", p); // { ok, total, percent }
//   });
//   const offD = eventBus.on("sync:images:done", (p: any) => {
//     console.log("[img:event] done", p);      // { ok, total, percent }
//   });
//   return () => { offP?.(); offD?.(); };
// }, []);

const db = SQLite.openDatabaseSync("user_data.db");
// Tipos para a resposta da API (exemplo)
interface SyncResponse {
  total: number;
  synced: number;
}

interface CardData {
  title: string;
  icon: React.ReactNode;
  currentValue: number;
  totalValue: number;
  status: string;
  lastSync: string;
  endpoint: string; // campo para sabermos qual endpoint chamar
  progress: number; // 0 a 100
  isLoading: boolean;
}

export const TelaDeSincronizacao: React.FC = () => {
  const { isLoadingSync, setIsLoadingSync } = useTopContext();

  const isConnected = useNetworkStatus();

  const initialCards: SyncCardData[] = [
    {
      title: "Clientes",
      icon: <FontAwesome5 name="user-alt" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/carteiracliente",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Bandeja",
      icon: <MaterialIcons name="inventory" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/bandeja",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Bandeja Produto",
      icon: <MaterialIcons name="inventory" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/bandeja/produto",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Bandeja Vendedor",
      icon: <MaterialIcons name="inventory" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/bandejavendedor",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Bandeja Vendedor Produto",
      icon: <MaterialIcons name="inventory" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/bandejavendedor/produto",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Pedido",
      icon: <MaterialCommunityIcons name="notebook" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/pedido",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Tabela Preço Produto",
      icon: <FontAwesome name="tags" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/tabelapreco/produto",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Representantes",
      icon: <FontAwesome6 name="people-group" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/representante",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Frete",
      icon: <FontAwesome6 name="people-carry-box" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/frete",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Pagamento",
      icon: <MaterialIcons name="payments" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/pagamento",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Quem Comprou Cliente",
      icon: <MaterialIcons name="payments" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/quemcomproucliente",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Expositor",
      icon: <MaterialIcons name="payments" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/expositor",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Pedido Minimo",
      icon: <MaterialIcons name="payments" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/pedidominimo",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Historico Compra Cliente",
      icon: <MaterialIcons name="payments" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/historicocompracliente",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Catálogo/Produtos",
      icon: <MaterialIcons name="watch" size={32} color="black" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente",
      lastSync: "",
      endpoint: "/api/catalogo",
      progress: 0,
      isLoading: false,
    },
    {
      title: "Catálogo/Imagens",
      icon: <MaterialIcons name="photo-library" size={32} color="#000" />,
      currentValue: 0,
      totalValue: 0,
      status: "Pendente -",
      lastSync: "",
      endpoint: "/internal/images",   // IMPORTANTÍSSIMO: bate com useSync.ts
      progress: 0,
      isLoading: false,
    },
    
  ];

  const { accessToken, userData, syncData, fetchAllData, syncProgress } =
    useAuth();

  // console.log("Dados do usuário logado:", userData);

  const {
    cards,
    lastSyncTime,
    nextSyncTime,
    syncCard,
    syncAll,
    isSingleCardSyncing,
  } = useSync(initialCards);

  const handleAllData = async (accessToken: string) => {
    try {
      setIsLoadingSync(true); // Atualiza o contexto
      if (fetchAllData) {
        await fetchAllData(accessToken);
      }

      // await updateCardCounts(); // Atualiza os valores após sincronização
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      Alert.alert("Erro", "Ocorreu um erro ao sincronizar os dados.");
    } finally {
      setIsLoadingSync(false);
    }
  };

  const handleSyncAll = async () => {
    if (accessToken) {
      // ÚNICA ALTERAÇÃO: blindagem com try/finally para sempre liberar o topo
      try {
        setIsLoadingSync(true);
        await syncAll(accessToken);
      } catch (error) {
        console.error("Erro ao sincronizar tudo:", error);
        Alert.alert("Erro", "Ocorreu um erro durante a sincronização.");
      } finally {
        setIsLoadingSync(false);
      }
    } else {
      Alert.alert("Erro", "Token de acesso inválido.");
    }
  };

  return (
    <>
      <ScrollView>
        <Container>
          <Content>
            <Header>
              <HeaderLeft>             
                <HeaderTextContainer>              
              
                  <StatusContainer>
                    <StatusIndicator isOnline={isConnected ? true : false} />
                    <AppStatus isOnline={isConnected ? true : false}>
                      {isConnected ? "Aplicação Online" : "Aplicação Offline"}
                    </AppStatus>
                    {/* <AppStatus isOnline={CONFIGS.STATUS_APLICACAO_ONLINE}>
                      {CONFIGS.STATUS_APLICACAO_ONLINE
                        ? "Aplicação Online"
                        : "Aplicação Offline"}
                    </AppStatus> */}
                  </StatusContainer>
                </HeaderTextContainer>
              </HeaderLeft>
              <HeaderRight>
                <View>
                  <SyncInfo>
                    Última sincronização: {"\n"} {lastSyncTime}
                  </SyncInfo>
                </View>
                <SyncAllButton
                  onPress={
                    isSingleCardSyncing || isLoadingSync
                      ? undefined
                      : () => handleSyncAll()
                  }
                  disabled={isSingleCardSyncing || isLoadingSync}
                >
                  <MaterialIcons
                    name="sync"
                    size={40}
                    color={
                      isSingleCardSyncing || isLoadingSync ? "#ccc" : "black"
                    }
                  />
                </SyncAllButton>
              </HeaderRight>
            </Header>
            <ScrollView>
              {isLoadingSync && (
                <View
                  style={{
                    marginHorizontal: 20,
                    backgroundColor: "#f9f9f9",
                    justifyContent: "center",
                    alignContent: "center",
                    padding: 20,
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignContent: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      Status da Atualização: Em Andamento ...
                    </Text>
                    <ActivityIndicator size={20} color="#000" />
                  </View>
                </View>
              )}
              <CardContainer>
                {cards.map((card, index) => (
                  <SyncCard
                    key={index}
                    title={card.title}
                    icon={card.icon}
                    currentValue={card.currentValue}
                    totalValue={card.totalValue}
                    status={card.status}
                    lastSync={card.lastSync}
                    progress={card.progress}
                    isLoading={card.isLoading}
                    onSync={() => accessToken && syncCard(index, accessToken)}
                    disabled={isSingleCardSyncing || card.isLoading}
                  />
                ))}
              </CardContainer>
            </ScrollView>
          </Content>
        </Container>
      </ScrollView>
    </>
  );
};
