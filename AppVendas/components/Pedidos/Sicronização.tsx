// O caminho provável do seu arquivo é: src/components/Pedidos/Sicronização/index.tsx

import React, { useState, useEffect, useContext } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  SearchInput,
  TableContainer,
  TableHeader,
  TableRow,
  TableCell,
  TableText,
  ActionButton,
  ButtonText,
  Header,
  ImportButton,
  Table,
  StatusText,
  ActionsContainer,
  Badge,
  BadgeText,
} from "./style";
import CheckBox from "../Checkbox";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ScrollView, View, ActivityIndicator, Alert, Text } from "react-native";
import ModalImportarReferencias, {
  Store,
} from "@/modal/ModalImportarReferencia";
import { RootStackParamList } from "@/types/types";
import AuthContext, { useAuth } from "@/context/AuthContext";

import * as SQLite from "expo-sqlite";
import {
  formatCurrency,
  formatDateToBR,
  getPedidoStatusLabel,
} from "@/helpers";
import LoadingPedidos from "./Loading";
import { PedidoSincronizadoItem } from "@/context/interfaces/PedidoSincronizadoItem";
import { formatarDataParaExibicao, parseDate } from "./useFormatAndParseDate";
import { hasValue } from "@/helpers/hasValue";
import { usePedidoCopia } from "@/context/PedidoCopiaContext";
const db = SQLite.openDatabaseSync("user_data.db");

type ProdutoDoPedido = {
  codigo: string;
  nomeEcommerce: string;
  dataPrevistaPA?: string | null;
  // ...outros campos usados no app
};

/** Converte "produtos" que podem vir como string JSON ou array em um array tipado. */
function parseProdutosField(raw: unknown): ProdutoDoPedido[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ProdutoDoPedido[];
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? (arr as ProdutoDoPedido[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Retorna se há pré-venda usando `hasValue`. */
function getPrevendaInfo(
  rawProdutos: unknown,
  hasValueFn: (v: any) => boolean
): { isPrevenda: boolean } {
  const produtos = parseProdutosField(rawProdutos);
  const match = produtos.find((p) => hasValueFn(p?.dataPrevistaPA));
  return {
    isPrevenda: !!match,
  };
}

const TableSicronizacao = () => {
  const [activeTab, setActiveTab] = useState("sincronizados");
  const [importarReferenciasModalVisible, setImportarReferenciasModalVisible] =
    useState(false);
  const [pedidosSincronizados, setPedidosSincronizados] = useState<
    PedidoSincronizadoItem[]
  >([]);
  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<PedidoSincronizadoItem | null>(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  const { setSelectedOrderRaw } = usePedidoCopia();

  useEffect(() => {
    setLoading(true);
    if (representanteId) {
      fetchPedidosSincronizados(representanteId);
    } else {
      setLoading(false);
      Alert.alert("Erro", "Representante não encontrado.");
    }
  }, []);

  const fetchPedidosSincronizados = async (representanteId: string) => {
    try {
      //Foi necessário pegar todos os campos para evitar erros nas chamadas de sincronização
      const query = `SELECT PS.*, CC.RazaoSocial
                      FROM PedidoSincronizado PS
                      LEFT JOIN CarteiraCliente CC ON PS.ClienteId = CC.ClienteId
                      WHERE PS.representanteId = ?`;

      const result = await db.getAllAsync(query, [representanteId]);

      const pedidosOrdenados = result
        .sort((a: any, b: any) => {
          return (
            parseDate(b.dataCriacao).getTime() -
            parseDate(a.dataCriacao).getTime()
          );
        })
        .map((pedido: any) => {
          const { isPrevenda } = getPrevendaInfo(pedido.produtos, hasValue);
          return {
            ...pedido,
            dataFormatada: formatarDataParaExibicao(
              parseDate(pedido.dataCriacao)
            ),
            isPrevenda,
          };
        });

      setPedidosSincronizados(pedidosOrdenados as PedidoSincronizadoItem[]);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setImportarReferenciasModalVisible(true);
  };

  const handleCloseModal = () => {
    setImportarReferenciasModalVisible(false);
  };

  const handleSaveModal = (updatedStores: Store[]): void => {
    setImportarReferenciasModalVisible(false);
  };

  const handlePedidoSelecionado = (pedido: PedidoSincronizadoItem) => {
    setPedidoSelecionado((prev) => (prev?.id === pedido.id ? null : pedido));
  };

  return (
    <>
      <Table>
        <Header>
          <SearchInput
            activeTab={activeTab}
            placeholder="Filtrar por Status, Data e Buscar (Dados Clientes)"
          />

          {/* <ImportButton disabled onPress={handleOpenModal}>
            <ButtonText>Importar</ButtonText>
          </ImportButton> */}
          <ImportButton
            onPress={() => {
              if (pedidoSelecionado) {
                setSelectedOrderRaw(pedidoSelecionado); // <- guarda {codigo, quantidade}
                navigation.navigate("ListaDeClientes", {
                  isCopiarPedido: true,
                });
              }
            }}
            disabled={!pedidoSelecionado}
            style={{ backgroundColor: pedidoSelecionado ? "#007bff" : "#ccc" }}
          >
            <ButtonText>Copiar</ButtonText>
          </ImportButton>
          {/* <ImportButton disabled onPress={handleOpenModal}>
            <ButtonText>Importar</ButtonText>
          </ImportButton> */}
        </Header>
        <ScrollView
          contentContainerStyle={{
            minWidth: "100%",
          }}
          horizontal
        >
          <TableContainer>
            <TableHeader>
              <TableCell flex={0.5} align="center">
                <TableText></TableText>
              </TableCell>
              <TableCell flex={1.5}>
                <TableText>Data Pedido</TableText>
              </TableCell>
              <TableCell flex={5}>
                <TableText>Cliente</TableText>
              </TableCell>
              <TableCell flex={1}>
                <TableText>Qt. Prod.</TableText>
              </TableCell>
              <TableCell flex={1}>
                <TableText>Valor Total</TableText>
              </TableCell>
              <TableCell flex={1}>
                <TableText>Data Sinc.</TableText>
              </TableCell>
              <TableCell flex={0.5}>
                <TableText>Quebrado</TableText>
              </TableCell>
              <TableCell flex={0.5}>
                <TableText>Pré-Venda</TableText>
              </TableCell>
              <TableCell flex={2}>
                <TableText>Status</TableText>
              </TableCell>
              <TableCell flex={0.3}>
                <TableText>Ações</TableText>
              </TableCell>
            </TableHeader>
            {loading && <LoadingPedidos />}
            {pedidosSincronizados.length > 0 ? (
              pedidosSincronizados.map((item) => {
                const isPrevenda = item.isPrevenda === true;
                return (
                  <TableRow key={item.id}>
                    <TableCell flex={0.5} align="center">
                      <CheckBox
                        label=""
                        isChecked={pedidoSelecionado?.id === item.id}
                        onPress={() => handlePedidoSelecionado(item)}
                      />
                    </TableCell>

                    <TableCell flex={1.5}>
                      <TableText>
                        {formatDateToBR(item.dataCriacao) || "N/A"}
                      </TableText>
                    </TableCell>
                    <TableCell flex={5}>
                      <TableText>{item.razaoSocial || "N/A"}</TableText>
                    </TableCell>
                    <TableCell flex={1}>
                      <TableText>{item.quantidadeItens}</TableText>
                    </TableCell>
                    <TableCell flex={1}>
                      <TableText>
                        {formatCurrency(item.valorTotal) || "N/A"}
                      </TableText>
                    </TableCell>
                    <TableCell flex={1}>
                      <TableText>
                        {formatDateToBR(item.dataSincronizacao) || "N/A"}
                      </TableText>
                    </TableCell>
                    <TableCell flex={0.5}>
                      <TableText>{item.quebraPreVenda || "N/A"}</TableText>
                    </TableCell>
                    <TableCell flex={0.5}>
                      {item.isPrevenda ? (
                        <Badge>
                          <BadgeText>Sim</BadgeText>
                        </Badge>
                      ) : (
                        <TableText>Não</TableText>
                      )}
                    </TableCell>
                    <TableCell flex={2}>
                      <StatusText status={item.status || "N/A"}>
                        {item.statusDescricao || "N/A"}
                      </StatusText>
                    </TableCell>
                    <TableCell flex={0.3}>
                      <ActionsContainer>
                        <FontAwesome
                          onPress={() =>
                            navigation.navigate("DetalhePedidoSincronizado", {
                              pedidoSincronizadoSelecionado: item,
                            })
                          }
                          name="search"
                          size={30}
                          color="#000"
                          style={{ marginRight: 15 }}
                        />
                      </ActionsContainer>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <Text style={{ padding: 16, textAlign: "center" }}>
                Nenhum Pedido Sincronizado Encontrado. {"\n"}Sincronize os Dados
                Novamente.
              </Text>
            )}
          </TableContainer>
        </ScrollView>
      </Table>
      {importarReferenciasModalVisible && (
        <ModalImportarReferencias
          isVisible={importarReferenciasModalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}
    </>
  );
};

export default TableSicronizacao;
