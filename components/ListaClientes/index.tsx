import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
} from "react-native";
import { CardCliente } from "@/components/CardCliente";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import InputFieldComponent from "@/components/InputFieldComponent";
import { Container } from "./style";
import { FormSearch } from "../CardCliente/style";
import ModalRepresentante from "@/modal/ModalRepresentante";
import { fetchClienteDBData, fetchClienteDBSearch } from "./database";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";
import { useTopContext } from "@/context/TopContext";

const ITEMS_PER_PAGE = 20;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Mode = "browse" | "search";

export const ListaClientes: React.FC<{
  setClientesSelecionados?: (clientes: any[]) => void;
}> = ({ setClientesSelecionados }) => {
  const { updateCarrinhosCount } = useTopContext();

  const [clientes, setClientes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [representanteModalVisible, setRepresentanteModalVisible] =
    useState(false);

  const navigation = useNavigation<NavigationProp>();

  const getNumColumns = () => (Dimensions.get("window").width > 1200 ? 3 : 2);
  const [numColumns, setNumColumns] = useState(getNumColumns());

  const [mode, setMode] = useState<Mode>("browse");
  const reqIdRef = useRef(0); // controla respostas obsoletas

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      handleOrientationChange
    );
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsDebouncing(true);
    }

    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsDebouncing(false);
    }, 500);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 3) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      resetClientes();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    // resetClientes();
    updateCarrinhosCount();
  }, []);

  function handleOrientationChange() {
    setNumColumns(getNumColumns());
  }

  const toggleSelection = (cpfCnpj: string, cliente: any) => {
    setSelectedItems((prev) => {
      const newSelection = { ...prev };
      if (newSelection[cpfCnpj]) {
        delete newSelection[cpfCnpj]; // Se já estava selecionado, remove
      } else {
        newSelection[cpfCnpj] = true; // Caso contrário, adiciona
      }
      if (setClientesSelecionados) {
        setClientesSelecionados(
          Object.keys(newSelection).map((key) =>
            clientes.find((c) => c.cpfCnpj === key)
          )
        );
      }

      return newSelection;
    });
  };

  async function handleSearch(term: string) {
    // entra em modo busca
    setMode("search");
    setLoading(true);
    try {
      const result = await fetchClienteDBSearch(term);

      setClientes(result || []);
      setHasMore(false); // sem paginação em modo busca
    } catch (error) {
      setClientes([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMoreClientes(
    currentPage: number,
    opts?: { force?: boolean }
  ) {
    // permite forçar o fetch inicial mesmo com loading ativo de outra origem
    if (loading && !opts?.force) return;
    setLoading(true);
    try {
      const result = await fetchClienteDBData(currentPage, ITEMS_PER_PAGE);
      if (result && result.length > 0) {
        setClientes((prev) =>
          currentPage === 1 ? result : [...prev, ...result]
        );
        setPage(currentPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes do banco de dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function resetClientes() {
    // cancela buscas pendentes e volta para navegação/paginação
    setMode("browse");
    setClientes([]);
    setHasMore(true);
    setPage(1);
    await fetchMoreClientes(1, { force: true });
  }

  const handleLoadMore = () => {
    if (mode === "browse" && hasMore && !loading) {
      fetchMoreClientes(page + 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if (!item) {
      console.warn("Cliente inválido encontrado na lista.");
      return null;
    }

    let enderecoCompleto = "Endereço não disponível";
    try {
      const enderecos = JSON.parse(item.enderecos);
      if (enderecos && enderecos.length > 0) {
        const primeiroEndereco = enderecos[0];
        enderecoCompleto = `${primeiroEndereco.endereco}, ${primeiroEndereco.municipio}, ${primeiroEndereco.estado}`;
      }
    } catch (error) {
      console.error("Erro ao processar endereços:", error);
    }

    return (
      <CardCliente
        cliente={{
          ...item,
          enderecoCompleto,
        }}
        setSearchTerm={setSearchTerm}
        isSelected={!!selectedItems[item.cpfCnpj]}
        onSelect={() => toggleSelection(item.cpfCnpj, item)}
      />
    );
  };

  const renderFooter = () =>
    loading ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Buscando cliente ...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    ) : null;

  //  console.warn(`ClientesSelecionados [${JSON.stringify(setClientesSelecionados)}]`);
  //  console.warn(`clientes [${JSON.stringify(clientes)}]`);

  return (
    <>
      <Container>
        <FormSearch>
          <View style={{ flex: 1 }}>
            <InputFieldComponent
              placeholder="Filtrar por Nome, CNPJ ou Código"
              value={searchTerm}
              onChangeText={(text) => setSearchTerm(text)}
              isLoading={isDebouncing || loading}
            />
          </View>
          <ConfirmacaoModalButton
            onPress={() => setRepresentanteModalVisible(true)}
            text="Selecionar Representante"
          />
        </FormSearch>

        <FlatList
          data={clientes}
          key={`flatlist-${numColumns}`}
          renderItem={renderItem}
          numColumns={numColumns}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {!loading && (
                <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
              )}
            </View>
          }
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginVertical: 10,
          }}
          contentContainerStyle={styles.listContainer}
        />
      </Container>

      {representanteModalVisible && (
        <ModalRepresentante
          isVisible={representanteModalVisible}
          onClose={() => setRepresentanteModalVisible(false)}
          onConfirm={() => setRepresentanteModalVisible(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
});
