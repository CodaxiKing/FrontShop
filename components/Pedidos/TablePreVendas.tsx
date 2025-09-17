import React, { useState, useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import {
  SearchInput,
  ImportButton,
  ButtonText,
  TableHeader,
  TableRow,
  TableCell,
  TableText,
  ActionButton,
  Header,
  StatusText,
  Table,
} from "./style";
import { ScrollView, Alert } from "react-native";
import ModalImportarReferencias, {
  Store,
} from "@/modal/ModalImportarReferencia";
import { useOrientation } from "@/context/OrientationContext";
import { useAuth } from "@/context/AuthContext";

import * as SQLite from "expo-sqlite";
import { formatCurrency } from "@/helpers";
import LoadingPedidos from "./Loading";
import ErroPedidos from "./ErrorTableData";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import { formatarDataParaExibicao, parseDate } from "./useFormatAndParseDate";
import CheckBox from "../Checkbox";
const db = SQLite.openDatabaseSync("user_data.db");

interface TablePedidoPrevendaProps {
  onSelectionChange: (selected: any[]) => void;
  refreshKey: number;
  representanteId: string;
}

const TablePreVendas: React.FC<TablePedidoPrevendaProps> = ({
  onSelectionChange,
  refreshKey,
  representanteId,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [activeTab, setActiveTab] = useState("pre_venda");
  const [importarReferenciasModalVisible, setImportarReferenciasModalVisible] =
    useState(false);

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchPedidosPreVenda(representanteId);
  }, []);

  useEffect(() => {
    if (representanteId) {
      fetchPedidosPreVenda(representanteId);
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
  const fetchPedidosPreVenda = async (representanteId: string) => {
    try {
      const query = `SELECT * FROM Pedido WHERE representanteId = ? AND status = 3;`;
      // const query = `SELECT * FROM NovoPedido;`;
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

      setPedidos(pedidosOrdenados);
      setLoading(false);
      // console.log("Pedidos Tabela Em Prevenda: ", result);
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

      // console.log("Pedidos selecionados (PRE-VENDA):", result);

      onSelectionChange(result);
    } catch (error) {
      console.error("Erro ao buscar pedidos selecionados:", error);
      Alert.alert("Erro", "Falha ao carregar pedidos selecionados.");
    }
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
        </Header>
        {/* <ScrollView horizontal> */}
        {/* <TableContainer style={{ width }}> */}
        <TableHeader>
          <TableCell>
            <TableText></TableText>
          </TableCell>
          <TableCell flex={1}>
            <TableText>ID Pai</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Data Pedido</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Cliente</TableText>
          </TableCell>
          <TableCell flex={2}>
            <TableText>Qtd. Produtos</TableText>
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
        <ScrollView>
          {loading && <LoadingPedidos />}
          {pedidos.length > 0 ? (
            pedidos.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
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
                <TableCell flex={1}>
                  <TableText>{item.representanteId || "N/A"}</TableText>
                </TableCell>
                <TableCell flex={2}>
                  <TableText>{item.dataCriacao || "N/A"}</TableText>
                </TableCell>
                <TableCell flex={2}>
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
                  <ActionButton>
                    <FontAwesome
                      onPress={() =>
                        navigation.navigate("DetalhePedidoAberto", {
                          pedidoId: item.id,
                          pageTitle: "Detalhe do Pedido em Pré-Venda",
                        })
                      }
                      name="search"
                      size={30}
                      color="#000"
                      style={{ marginRight: 15 }}
                    />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <ErroPedidos />
          )}
        </ScrollView>
        {/* </TableContainer> */}
        {/* </ScrollView> */}
      </Table>
      <ModalImportarReferencias
        isVisible={importarReferenciasModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
      />
    </>
  );
};

export default TablePreVendas;
