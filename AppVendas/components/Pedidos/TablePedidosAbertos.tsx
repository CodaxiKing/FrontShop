import React, { useEffect } from "react";
import {
  ActionsContainer,
  Header,
  SearchInput,
  StatusText,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableText,
} from "./style";
import { FontAwesome } from "@expo/vector-icons";
import { Alert, ScrollView, Text } from "react-native";
import { useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import ModalImportarReferencias, {
  Store,
} from "@/modal/ModalImportarReferencia";
import { RootStackParamList } from "@/types/types";

import * as SQLite from "expo-sqlite";
import { formatCurrency } from "@/helpers";
import CheckBox from "../Checkbox";
import LoadingPedidos from "./Loading";
import { formatarDataParaExibicao, parseDate } from "./useFormatAndParseDate";
import { usePedidosFilter } from "./usePedidosFilter";
const db = SQLite.openDatabaseSync("user_data.db");

interface TablePedidosAbertosProps {
  onSelectionChange: (selected: any[]) => void;
  refreshKey: number;
  representanteId: string;
}

const TablePedidosAbertos: React.FC<TablePedidosAbertosProps> = ({
  onSelectionChange,
  refreshKey,
  representanteId,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [importarReferenciasModalVisible, setImportarReferenciasModalVisible] =
    useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { searchTerm, setSearchTerm, filteredPedidos } =
    usePedidosFilter(pedidos);

  useEffect(() => {
    setLoading(true);
    if (representanteId) {
      fetchPedidosEmAberto(representanteId);
    } else {
      setLoading(false);
      Alert.alert("Erro", "Representante não encontrado.");
    }
  }, []);

  useEffect(() => {
    if (representanteId) {
      fetchPedidosEmAberto(representanteId);
    }
  }, [refreshKey]);

  useEffect(() => {
    // Sempre que selectedIds mudar, buscamos os pedidos selecionados
    // e passamos para o componente pai
    if (selectedIds.length > 0) {
      fetchSelectedPedidos();
    } else {
      onSelectionChange([]);
    }
  }, [selectedIds]);

  useEffect(() => {
    if (!Array.isArray(selectedIds)) {
      setSelectedIds([]);
    }
  }, [selectedIds]);

  const handleOpenModal = () => {
    setImportarReferenciasModalVisible(true);
  };

  const handleCloseModal = () => {
    setImportarReferenciasModalVisible(false);
  };

  const handleSaveModal = (updatedStores: Store[]): void => {
    setImportarReferenciasModalVisible(false);
  };

  /**
   * Busca os pedidos em aberto no banco local SQLite,
   * ordena pela data de criação (mais recente primeiro)
   * e adiciona uma data formatada para exibição.
   *
   * @param representanteId ID do representante logado
   */
  const fetchPedidosEmAberto = async (
    representanteId: string
  ): Promise<void> => {
    try {
      const query = `SELECT * FROM Pedido WHERE representanteId = ? AND status = '1';`;
      const result = await db.getAllAsync(query, [representanteId]);

      const pedidosOrdenados = result
        .sort((a: any, b: any) => {
          return (
            parseDate(b.dataCriacao).getTime() -
            parseDate(a.dataCriacao).getTime()
          );
        })
        .map((pedido: any) => ({
          ...pedido,
          dataFormatada: formatarDataParaExibicao(
            parseDate(pedido.dataCriacao)
          ),
        }));

      // console.log("Pedidos EM ABERTO (verificar cpfCnpj):", pedidosOrdenados.slice(0, 2));
      setPedidos(pedidosOrdenados);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      Alert.alert("Erro", "Falha ao carregar pedidos.");
    }
  };

  const fetchSelectedPedidos = async () => {
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) return;

    try {
      const query = `SELECT * FROM Pedido WHERE id IN (${selectedIds.join(
        ","
      )})`;
      const result = await db.getAllAsync(query);

      // console.log("Pedidos selecionados:", result);

      onSelectionChange(result);
    } catch (error) {
      console.error("Erro ao buscar pedidos selecionados:", error);
      Alert.alert("Erro", "Falha ao carregar pedidos selecionados.");
    }
  };

  const isDisabled = true; // Ou alguma lógica condicional
  // const isSelecionado =
  //   Array.isArray(selectedIds) && selectedIds.includes(item.id);

  return (
    <>
      <Table>
        {/* Header fixo fora do scroll */}
        <Header>
          <SearchInput
            placeholder="Filtrar por Status, Data e Buscar (Dados Clientes)"
            activeTab="someTabValue"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {/*  <ImportButton
            disabled={isDisabled}
            onPress={() => navigation.navigate("CopiarPedido")}
            style={{ backgroundColor: isDisabled ? "#ccc" : "#007bff" }}
          >
            <ButtonText>Copiar</ButtonText>
          </ImportButton>
          <ButtonText>Copiar</ButtonText>

           <ImportButton onPress={handleOpenModal}>
            <ButtonText>Importar</ButtonText>
          </ImportButton> */}
        </Header>

        {/* Table Header fixo */}
        <TableHeader>
          <TableCell flex={0.2}>
            <TableText></TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Dt. Pedido</TableText>
          </TableCell>
          <TableCell flex={3}>
            <TableText>Cliente</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Qt. Produtos</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Valor Total</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Status</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Ações</TableText>
          </TableCell>
        </TableHeader>

        {/* ScrollView para as linhas */}
        <ScrollView>
          {loading && <LoadingPedidos />}
          {filteredPedidos.length > 0 ? (
            filteredPedidos.map((item, index) => (
              // console.log("Selecionados:", item),
              <TableRow key={index}>
                <TableCell flex={0.2}>
                  <TableText>
                    <CheckBox
                      isChecked={!!selectedIds.includes(item.id)}
                      onPress={() => {
                        if (
                          Array.isArray(selectedIds) &&
                          selectedIds.includes(item.id)
                        ) {
                          setSelectedIds((prev) =>
                            (prev ?? []).filter((id) => id !== item.id)
                          );
                        } else {
                          setSelectedIds((prev) => [...(prev ?? []), item.id]);
                        }
                      }}
                    />
                  </TableText>
                </TableCell>
                {/* <TableCell flex={1}>
                  <TableText>{item.id}</TableText>
                </TableCell> */}
                <TableCell flex={2}>
                  <TableText>
                    {/* {"N/A"} */}
                    {/* {item.dataCriacao || "N/A"} */}
                    {/* {formatDateToBR(item.dataCriacao) || "N/A"} */}
                    {item.dataFormatada}
                  </TableText>
                </TableCell>
                <TableCell flex={3}>
                  <TableText>{item.razaoSocial}</TableText>
                </TableCell>
                <TableCell flex={2}>
                  <TableText>{item.quantidadeItens}</TableText>
                </TableCell>
                <TableCell flex={2}>
                  <TableText>{formatCurrency(item.valorTotal)}</TableText>
                </TableCell>
                <TableCell flex={2}>
                  <StatusText status={item.status}>
                    {item.statusDescricao}
                  </StatusText>
                </TableCell>
                <TableCell flex={2}>
                  <ActionsContainer>
                    <FontAwesome
                      onPress={() =>
                        navigation.navigate("DetalhePedidoAberto", {
                          pedidoId: item.id,
                          pageTitle: "Detalhe do Pedido Aberto",
                        })
                      }
                      name="search"
                      size={30}
                      color="#000"
                      style={{ marginRight: 15 }}
                    />

                    {/* <FontAwesome5
                      onPress={() => {
                        Alert.alert(
                          "Editar Pedido",
                          "Tem certeza que deseja editar este pedido?",
                          [
                            {
                              text: "Cancelar",
                              style: "cancel", // Botão de cancelar
                            },
                            {
                              text: "Confirmar",
                              onPress: () => {
                                navigation.navigate("EditarPedidoAberto", {
                                  cpfCnpj: item.cpfCnpj,
                                  pedidoId: item.id,
                                });
                              },
                            },
                          ],
                          { cancelable: true } // Permite fechar o Alert clicando fora dele
                        );
                      }}
                      name="clipboard-list"
                      size={32}
                      color="black"
                    /> */}
                  </ActionsContainer>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <Text style={{ padding: 16, textAlign: "center" }}>
              Nenhum pedido em aberto encontrado.
            </Text>
          )}
        </ScrollView>
      </Table>

      <ModalImportarReferencias
        isVisible={importarReferenciasModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
      />
    </>
  );
};

export default TablePedidosAbertos;
