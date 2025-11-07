import React, { useContext, useEffect, useState } from "react";

import * as SQLite from "expo-sqlite";
import {
  ActionsContainer,
  ButtonContainer,
  ButtonText,
  Container,
  Tab,
  Table,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
  TableText,
  TabsHeader,
  TabText,
  TabTextName,
} from "./style";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { ScrollView, View, ActivityIndicator, Text, Alert } from "react-native";
import { BandejaVendedorItem } from "@/context/interfaces/BandejaVendedorItem";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import { useNavigation } from "expo-router";
import apiClient from "@/client/apiClient";
import AuthContext from "@/context/AuthContext";
import ModalSuccess from "../CardCarrinho/Modais/ModalSuccess";

const db = SQLite.openDatabaseSync("user_data.db");

const MinhaBandejaComponent = () => {
  const [modalConfirmationVisible, setModalConfirmationVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [bandejaVendedorData, setBandejaVendedorData] = useState<
    BandejaVendedorItem[]
  >([]);

  const [bandejaProdutoCounts, setBandejaProdutoCounts] = useState<{
    [codigoBandeja: string]: number;
  }>({});

  const { userData, accessToken } = useContext(AuthContext);
  const representanteId = userData?.representanteId;
  const nome = userData?.nome;

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const getBandejasVendedor = async () => {
    setLoading(true);
    const query = `SELECT * FROM BandejaVendedor WHERE representanteId = ?`;
    if (representanteId) {
      const result = await db.getAllAsync(query, [representanteId]);
      setBandejaVendedorData(result as BandejaVendedorItem[]);
      setLoading(false);
    } else {
      throw new Error("representanteId is undefined");
    }
  };

  const getBandejaProdutoCounts = async () => {
    const query = `
      SELECT BandejaVendedor.codigo AS codigoBandeja,
            COUNT(BandejaVendedorProduto.codigoProduto) AS qtdProdutos
      FROM BandejaVendedor
      JOIN BandejaVendedorProduto
        ON BandejaVendedor.codigo = BandejaVendedorProduto.codigoBandeja
      WHERE BandejaVendedor.representanteId = ?
      GROUP BY BandejaVendedor.codigo
    `;

    try {
      if (representanteId) {
        const result = await db.getAllAsync(query, [representanteId]);

        // Constrói um objeto onde a chave é o código da bandeja e o valor é a quantidade de produtos.
        const produtoCounts = result.reduce(
          (acc: { [codigoBandeja: string]: number }, item: any) => {
            acc[item.codigoBandeja] = item.qtdProdutos;
            return acc;
          },
          {}
        );

        setBandejaProdutoCounts(produtoCounts);
      } else {
        throw new Error("representanteId is undefined");
      }
    } catch (error) {
      console.error(
        "Erro ao buscar quantidade de produtos por bandeja:",
        error
      );
    }
  };

  const handleCriarBandejaNavigation = () => {
    navigation.navigate("CriarBandejaVendedor");
  };

  const handleEditBandejaNavigation = (codigo: string) => {
    navigation.navigate("EditarBandejaVendedor", { codigo });
  };

  const handleDeleteBandejaFromEndpoint = async (codigo: string) => {
    try {
      const response = await apiClient.delete(
        `/api/bandejavendedor?representanteId=${representanteId}&codigo=${codigo}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        await handleDeleteBandejaFromDB(codigo);
        setModalConfirmationVisible(true);
        setTimeout(() => {
          setModalConfirmationVisible(false);
          navigation.navigate("MinhaBandeja");
        }, 2000);
      }

      // Alert.alert("Bandeja deletada com sucesso!");
    } catch (error) {
      Alert.alert("Erro ao deletar bandeja!", error.message);
      console.error("Erro ao deletar bandeja: ", error);
    }
  };

  const handleDeleteBandejaFromDB = async (codigo: string) => {
    const query = `DELETE FROM BandejaVendedor WHERE codigo = ?`;
    await db.runAsync(query, [codigo]);
    const queryProduto = `DELETE FROM BandejaVendedorProduto WHERE codigoBandeja = ?`;
    await db.runAsync(queryProduto, [codigo]);

    getBandejasVendedor();
  };

  const abreviarCodigo = (codigo: string, comprimento: number = 4) => {
    if (codigo.length <= comprimento * 2 + 3) return codigo; // Não precisa truncar se o código for curto
    return `${codigo.substring(0, comprimento)}...${codigo.substring(
      codigo.length - comprimento
    )}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      await getBandejasVendedor();
      await getBandejaProdutoCounts();
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <Container>
        <TableContainer>
          {/* <TabsHeader>
            <Tab>
              <TabText>
                Minhas Bandejas - Representante:{" "}
                <TabTextName>{nome}</TabTextName>
              </TabText>
            </Tab>
          </TabsHeader> */}
          <Table>
            {/* Table Header fixo */}
            <TableHeader>
              <TableCell flex={0.5}>
                <TableText>ID</TableText>
              </TableCell>
              <TableCell flex={3}>
                <TableText>Nome</TableText>
              </TableCell>
              <TableCell flex={0.5}>
                <TableText>Qtd. Produtos</TableText>
              </TableCell>
              <TableCell flex={2}>
                <TableText>Ações</TableText>
              </TableCell>
            </TableHeader>

            {/* ScrollView para as linhas */}
            <ScrollView style={{ marginBottom: 50 }}>
              {loading && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    margin: 16,
                  }}
                >
                  <ActivityIndicator size={48} color="#0000ff" />
                </View>
              )}
              {bandejaVendedorData.length > 0
                ? bandejaVendedorData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell flex={0.5}>
                        <TableText>{abreviarCodigo(item.codigo)}</TableText>
                      </TableCell>
                      <TableCell flex={3}>
                        <TableText>{item.nome}</TableText>
                      </TableCell>
                      <TableCell flex={0.5}>
                        <TableText>
                          {bandejaProdutoCounts[item.codigo] || 0}
                        </TableText>
                      </TableCell>

                      <TableCell flex={2}>
                        <ActionsContainer>
                          <FontAwesome
                            onPress={() => {
                              Alert.alert(
                                "Deletar Bandeja",
                                "Deseja realmente deletar esta bandeja?",
                                [
                                  {
                                    text: "Cancelar",
                                    style: "cancel",
                                  },
                                  {
                                    text: "Deletar",
                                    onPress: async () => {
                                      // await handleDeleteBandejaFromDB(
                                      //   item.codigo
                                      // );
                                      await handleDeleteBandejaFromEndpoint(
                                        item.codigo
                                      );
                                    },
                                  },
                                ]
                              );
                            }}
                            name="trash"
                            size={32}
                            color="#000"
                            style={{
                              marginRight: 5,
                              padding: 10,
                            }}
                          />

                          <Feather
                            onPress={() => {
                              handleEditBandejaNavigation(item.codigo);
                            }}
                            name="edit"
                            size={32}
                            color="black"
                            style={{
                              padding: 10,
                            }}
                          />
                        </ActionsContainer>
                      </TableCell>
                    </TableRow>
                  ))
                : !loading && (
                    <Text style={{ padding: 16, textAlign: "center" }}>
                      Nenhuma bandeja encontrada.
                    </Text>
                  )}
            </ScrollView>
          </Table>
        </TableContainer>
        <ButtonContainer onPress={handleCriarBandejaNavigation}>
          <ButtonText>Nova Bandeja</ButtonText>
        </ButtonContainer>
      </Container>
      <ModalSuccess
        visible={modalConfirmationVisible}
        text="Bandeja Deletada com Sucesso!"
        onClose={() => setModalConfirmationVisible(false)}
      />
    </>
  );
};

export default MinhaBandejaComponent;
