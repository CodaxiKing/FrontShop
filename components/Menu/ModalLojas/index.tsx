import React, { useEffect, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  StyledModal,
  ModalContainer,
  ModalContent,
  Header,
  Title,
  StoreSelection,
  Label,
  StoreList,
  StoreOption,
  StoreText,
  Footer,
  ActionButton,
  ActionButtonText,
  ContainerList,
} from "./style";

import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useMenuContext } from "@/context/MenuProvider";

import * as SQLite from "expo-sqlite";
import { Endereco } from "@/components/CardCarrinho/IconesCardCarrinho";

const db = SQLite.openDatabaseSync("user_data.db");

interface ModalLojasProps {
  visible: boolean;
  onClose: () => void;
  cnpjCliente: string | undefined;
  setRefreshKeyLojas: React.Dispatch<React.SetStateAction<number>>;
}

interface Store {
  cpfCnpj: string | undefined;
  razaoSocial: string;
  nomeReduzido: string;
  enderecos: Endereco[];
}

const ModalLojas: React.FC<ModalLojasProps> = ({
  visible,
  onClose,
  cnpjCliente,
  setRefreshKeyLojas,
}) => {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const { lojasSelecionadas, setLojasSelecionadas } = useMenuContext();
  const { getLojasSelecionadasParaCliente, setLojasParaCliente } =
    useMenuContext();

  useEffect(() => {
    if (!visible || !cnpjCliente) return;

    fetchStores();

    const lojasSalvas = getLojasSelecionadasParaCliente(cnpjCliente);
    if (lojasSalvas.length > 0) {
      setSelectedStores(lojasSalvas);
    } else {
      setSelectedStores([cnpjCliente]); // fallback
    }
  }, [visible, cnpjCliente]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const query = `
      SELECT cpfCnpjPai, cpfCnpj, razaoSocial, nomeReduzido, enderecos
      FROM CarteiraCliente
      WHERE codigoColigado = (
        SELECT codigoColigado
        FROM CarteiraCliente
        WHERE cpfCnpj = '${cnpjCliente}'
        LIMIT 1
      );
    `;
      const result = await db.getAllAsync(query);

      const uniqueResult = result.filter(
        (value: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.cpfCnpj === value.cpfCnpj)
      );

      if (uniqueResult.length > 0) {
        setStores(uniqueResult as Store[]);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Erro ao buscar lojas filhas:", error);
      setStores([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectStore = (cpfCnpj: string) => {
    // Se for a loja do próprio cliente, não permite alterar
    if (cpfCnpj === cnpjCliente) return;
    if (selectedStores.includes(cpfCnpj)) {
      setSelectedStores(selectedStores.filter((item) => item !== cpfCnpj));
    } else {
      setSelectedStores([...selectedStores, cpfCnpj]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedStores.length > 0 && cnpjCliente) {
      // let produtoLojas = JSON.parse(pedidos.produtos);

      setLojasParaCliente(cnpjCliente, selectedStores); // Atualiza o contexto com as lojas selecionadas
      //alert(`Lojas selecionadas: ${selectedStores.join(", ")}`);
      setRefreshKeyLojas((prev) => prev + 1); // Força recarregar carrinho

      onClose();
    } else {
      Alert.alert("Atenção", "Selecione pelo menos uma loja.");
    }
  };

  return (
    <StyledModal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ScrollView>
            <Header>
              <Title>Seleção de Loja</Title>
            </Header>
            <StoreSelection>
              <Label>Lojas</Label>
              <StoreList>
                <ContainerList>
                  {loading ? (
                    <View style={{ flexDirection: "column", gap: 10 }}>
                      <ActivityIndicator size="large" color="#007bff" />
                      <Text>Buscando Lojas</Text>
                    </View>
                  ) : stores.length > 0 ? (
                    stores.map((store) => (
                      <StoreOption
                        key={store.cpfCnpj}
                        selected={
                          store.cpfCnpj
                            ? selectedStores.includes(store.cpfCnpj)
                            : false
                        }
                        onPress={() =>
                          store.cpfCnpj && toggleSelectStore(store.cpfCnpj)
                        }
                      >
                        <FontAwesome5
                          name={
                            store.cpfCnpj &&
                            selectedStores.includes(store.cpfCnpj)
                              ? "check-circle"
                              : "circle"
                          }
                          size={20}
                          color={
                            store.cpfCnpj &&
                            selectedStores.includes(store.cpfCnpj)
                              ? "#007bff"
                              : "#ccc"
                          }
                          style={{ marginRight: 10 }}
                        />
                        <StoreText
                          selected={
                            store.cpfCnpj
                              ? selectedStores.includes(store.cpfCnpj)
                              : false
                          }
                        >
                          {store.cpfCnpj} - {store.nomeReduzido}
                        </StoreText>
                      </StoreOption>
                    ))
                  ) : (
                    <StoreText selected={false}>
                      Nenhuma loja encontrada
                    </StoreText>
                  )}
                </ContainerList>
              </StoreList>
            </StoreSelection>
            <Footer>
              <ActionButton onPress={onClose} outlined>
                <ActionButtonText outlined>Fechar</ActionButtonText>
              </ActionButton>
              <ActionButton onPress={handleConfirmSelection}>
                <ActionButtonText>
                  Selecionar ({selectedStores.length})
                </ActionButtonText>
              </ActionButton>
            </Footer>
          </ScrollView>
        </ModalContent>
      </ModalContainer>
    </StyledModal>
  );
};

export default ModalLojas;
