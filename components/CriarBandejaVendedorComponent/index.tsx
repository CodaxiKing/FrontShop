import React from "react";
import { Alert, FlatList, Text, TouchableOpacity } from "react-native";
import {
  ModalContainer,
  InputGroup,
  DropdownResultContainer,
  DropdownResultItem,
  NoResultsText,
  Header,
  HeaderTitle,
  Body,
  Footer,
  InputContainer,
  ProductsContainer,
} from "./style";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import InputFieldComponent from "@/components/InputFieldComponent";

import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import AuthContext from "@/context/AuthContext";
import apiClient from "@/client/apiClient";
import BandejaListaCatalogo from "../BandejaListaCatalogo";
import ModalSuccess from "../CardCarrinho/Modais/ModalSuccess";
import { useNavigation } from "expo-router";
import { RootStackParamList } from "@/types/types";

import * as Crypto from "expo-crypto";

import * as SQLite from "expo-sqlite";
import { useContext, useState } from "react";
import { NavigationProp } from "@react-navigation/native";

const db = SQLite.openDatabaseSync("user_data.db");

const CriarBandejaVendedorComponent = ({}) => {
  const [loadingSave, setLoadingSave] = useState<boolean>(false);
  const [bandejaNome, setBandejaNome] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<CatalogoItem[]>([]);
  const [referencia, setReferencia] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CatalogoItem[]>([]);
  const [modalConfirmationVisible, setModalConfirmationVisible] =
    useState(false);
  const { userData, accessToken } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSearchProdutos = async (query: string) => {
    setReferencia(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const searchQuery = `
        SELECT * FROM Catalogo 
        WHERE nomeEcommerce LIKE ? OR codigo LIKE ?
        LIMIT 10
      `;
      const results = await db.getAllAsync(searchQuery, [
        `%${query}%`,
        `%${query}%`,
      ]);

      setSearchResults(results as CatalogoItem[]);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const handleAddProduto = (produto: CatalogoItem) => {
    setSelectedItems((prev) => {
      const produtoJaSelecionado = prev.some(
        (item) => item.codigo === produto.codigo
      );
      if (produtoJaSelecionado) {
        // Remove o produto se já estiver na lista
        return prev.filter((item) => item.codigo !== produto.codigo);
      } else {
        // Adiciona o produto se não estiver na lista
        return [...prev, produto];
      }
    });

    setSearchResults([]); // Limpa os resultados após a seleção
    setReferencia(""); // Limpa o campo de busca
  };

  const handleSelectProduct = (produto: CatalogoItem) => {
    setSelectedItems((prev) => {
      const produtoJaSelecionado = prev.some(
        (item) => item.codigo === produto.codigo
      );

      if (produtoJaSelecionado) {
        // Remove o produto se ele já estiver na lista
        return prev.filter((item) => item.codigo !== produto.codigo);
      } else {
        // Adiciona o produto se ele não estiver na lista
        return [...prev, produto];
      }
    });
  };

  const handleSave = async () => {
    if (!bandejaNome.trim()) {
      Alert.alert(
        "Nome da Bandeja Obrigatório",
        "Por favor, insira o nome da bandeja antes de prosseguir."
      );
      return;
    }

    try {
      setLoadingSave(true);

      const bandejaCodigo = `${Crypto.randomUUID()}`;
      const novaBandeja = {
        codigo: bandejaCodigo,
        representanteId: representanteId,
        nome: bandejaNome,
        produtos: selectedItems.map((item) => ({
          representanteId: representanteId,
          codigoBandeja: bandejaCodigo,
          codigoProduto: item.codigo,
        })),
      };

      if (novaBandeja?.codigo) {
        const query = `
          INSERT INTO BandejaVendedor (codigo, representanteId, nome)
          VALUES (?, ?, ?)
        `;
        await db.runAsync(query, [
          novaBandeja.codigo,
          novaBandeja.representanteId || "",
          novaBandeja.nome,
        ]);

        for (const produto of novaBandeja.produtos) {
          const produtoQuery = `
          INSERT INTO BandejaVendedorProduto (representanteId, codigoBandeja, codigoProduto)
          VALUES (?, ?, ?)
        `;
          await db.runAsync(produtoQuery, [
            produto.representanteId || "",
            produto.codigoBandeja,
            produto.codigoProduto,
          ]);
        }
      }

      onSave(novaBandeja);
    } catch (error) {
      setLoadingSave(false);
      console.error("Erro ao salvar a bandeja:", error);
    }
  };

  const onSave = async (novaBandeja: {
    codigo: string;
    representanteId: string | undefined;
    nome: string;
    produtos: {
      representanteId: string | undefined;
      codigoBandeja: string;
      codigoProduto: string;
    }[];
  }) => {
    try {
      const response = await apiClient.post(
        "/api/bandejavendedor",
        novaBandeja,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setLoadingSave(false);
        setModalConfirmationVisible(true);
        setTimeout(() => {
          setModalConfirmationVisible(false);
          navigation.navigate("MinhaBandeja");
        }, 2000);
      } else {
        setLoadingSave(false);
        console.error(
          "Erro ao salvar Bandeja Vendedor no BFF:",
          JSON.stringify(response.statusText)
        );
      }
    } catch (error) {
      setLoadingSave(false);
      console.error("Erro ao salvar bandeja vendedor no BFF:", error);
    }
  };

  return (
    <>
      <ModalContainer>
        <Header>
          <HeaderTitle>
            {"Selecione os Produtos para Adcionar à Nova Bandeja"}
          </HeaderTitle>
        </Header>
        <Body>
          <InputContainer>
            <InputGroup>
              <InputFieldComponent
                label="Nome da Bandeja"
                placeholder="Digite o nome da bandeja"
                value={bandejaNome}
                onChangeText={setBandejaNome}
              />
            </InputGroup>

            <InputGroup>
              <InputFieldComponent
                label="Filtrar Produtos"
                placeholder="Buscar produtos por nome ou referência"
                value={referencia}
                onChangeText={handleSearchProdutos}
              />
              {/* Dropdown com os resultados da busca */}
              {searchResults.length > 0 ? (
                <DropdownResultContainer>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, index) =>
                      `${item.codigoBarra}-${index}`
                    }
                    renderItem={({ item }) => {
                      const isSelected = selectedItems.some(
                        (selectedItem) => selectedItem.codigo === item.codigo
                      );

                      return (
                        <TouchableOpacity
                          onPress={() => handleAddProduto(item)}
                        >
                          <DropdownResultItem
                            style={{
                              backgroundColor: isSelected ? "#e0f7e9" : "#fff",
                            }}
                          >
                            <Text style={{ fontWeight: "bold" }}>
                              {item.nomeEcommerce}
                            </Text>
                            <Text>Referência: {item.codigo}</Text>
                            <Text>Preço: R$ {item.precoUnitario}</Text>
                          </DropdownResultItem>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </DropdownResultContainer>
              ) : (
                referencia.length > 0 && (
                  <DropdownResultContainer>
                    <NoResultsText>Nenhum produto encontrado</NoResultsText>
                  </DropdownResultContainer>
                )
              )}
            </InputGroup>
          </InputContainer>

          <ProductsContainer>
            {/* Aqui vem a BandejaListaCatalogo */}
            <BandejaListaCatalogo
              onSelectProduct={handleSelectProduct}
              selectedItems={selectedItems}
            />
          </ProductsContainer>
        </Body>
        <Footer>
          <ConfirmacaoModalButton
            text="Cancelar"
            variant="exit"
            onPress={() => navigation.goBack()}
            disabled={loadingSave}
          />

          <ConfirmacaoModalButton
            text="Criar Bandeja"
            onPress={handleSave}
            disabled={loadingSave}
          />
        </Footer>
      </ModalContainer>
      <ModalSuccess
        visible={modalConfirmationVisible}
        text="Bandeja Criada com Sucesso!"
        onClose={() => setModalConfirmationVisible(false)}
      />
    </>
  );
};

export default CriarBandejaVendedorComponent;
