import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import {
  ModalContainer,
  BoxContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  // ButtonCancel,
  // ButtonSave,
  // ButtonTextCancel,
  // ButtonTextSave,
  Input,
  InputGroup,
  ItemContainer,
  ItemImage,
  ItemDetails,
  RemoveButton,
  AddButton,
  DropdownResultContainer,
  DropdownResultItem,
  DropdownResultItemText,
  NoResultsText,
} from "./style";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import InputFieldComponent from "@/components/InputFieldComponent";
import { FontAwesome } from "@expo/vector-icons";

import * as SQLite from "expo-sqlite";
import { BandejaItem } from "@/context/interfaces/BandejaItem";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { UserData } from "../../context/interfaces/UserData";
import AuthContext from "@/context/AuthContext";

const db = SQLite.openDatabaseSync("user_data.db");

interface BandejaProps {
  bandeja: BandejaItem | null; // Recebe a bandeja selecionada
  onClose: () => void;
  visible: boolean;
  onSave: (items: {
    codigo: string;
    representanteId: string | undefined;
    nome: string;
    produtos: {
      representanteId: string | undefined;
      codigoBandeja: string;
      codigoProduto: string;
    }[];
  }) => void;
}

const ModalBandeja: React.FC<BandejaProps> = ({ bandeja, onSave }) => {
  const [selectedItems, setSelectedItems] = useState<CatalogoItem[]>([]);
  const [bandejaNome, setBandejaNome] = useState<string>(bandeja?.nome || "");
  const [referencia, setReferencia] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CatalogoItem[]>([]);
  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  useEffect(() => {
    setBandejaNome(bandeja?.nome || "");
    fetchProdutosDaBandeja();
  }, [bandeja]);

  const fetchProdutosDaBandeja = async () => {
    if (!bandeja) return;

    try {
      const query = `SELECT * FROM BandejaProduto INNER JOIN Catalogo ON BandejaProduto.codigoProduto = Catalogo.codigo WHERE BandejaProduto.codigoBandeja = ?`;
      const result = await db.getAllAsync(query, [bandeja.codigo]);
      setSelectedItems(result as CatalogoItem[]);
    } catch (error) {
      console.error("Erro ao buscar produtos da bandeja:", error);
    }
  };

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

  const handleAddProduto = (produto: any) => {
    const produtoJaAdicionado = selectedItems.some(
      (item) => item.codigo === produto.codigo
    );

    let imagemUrl = "https://via.placeholder.com/150";

    if (produto.imagens) {
      try {
        const imagensArray = JSON.parse(produto.imagens);
        if (imagensArray.length > 0 && imagensArray[0].imagemUrl) {
          imagemUrl = imagensArray[0].imagemUrl;
        }
      } catch (error) {
        console.error("Erro ao processar a imagem do produto:", error);
      }
    }

    if (!produtoJaAdicionado) {
      setSelectedItems((prev) => [
        ...prev,
        produto,
        // {
        //   codigo: produto.codigo,
        //   nomeEcommerce: produto.nomeEcommerce,
        //   precoUnitario: produto.precoUnitario,
        //   imagemUrl,
        // },
      ]);
    }

    setSearchResults([]);
    setReferencia("");
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.codigo !== id));
  };

  const handleSave = async () => {
    const bandejaCodigo = bandeja?.codigo || `BAN${Date.now()}`;
    const codigoFilial = "";

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

    try {
      // Inserir bandeja no banco de dados local, se for uma nova bandeja
      if (!bandeja?.codigo) {
        const query = `
          INSERT INTO Bandeja (codigo, codigoFilial, nome, dataInicio, usuarioInclusao, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.runAsync(query, [
          novaBandeja.codigo,
          codigoFilial,
          novaBandeja.nome,
          new Date().toISOString(),
          "admin",
          "Ativa",
        ]);
      }

      // Inserir produtos da bandeja no banco de dados local
      for (const produto of novaBandeja.produtos) {
        const produtoQuery = `
          INSERT INTO BandejaProduto (codigoProduto, codigoBandeja )
          VALUES (?, ?)
        `;
        await db.runAsync(produtoQuery, [
          produto.codigoProduto,
          produto.codigoBandeja,
        ]);
      }

      onSave(novaBandeja); // Retorna o JSON no formato correto
      onClose();
    } catch (error) {
      console.error("Erro ao salvar a bandeja:", error);
    }
  };
  // Código esperado no post da bandeja
  // {
  //   "codigo": "string",
  //   "representanteId": "string",
  //   "nome": "string",
  //   "produtos": [
  //     {
  //       "representanteId": "string",
  //       "codigoBandeja": "string",
  //       "codigoProduto": "string"
  //     }
  //   ]
  // }

  return (
    <ModalContainer>
      <View style={{ width: "80%" }}>
        <BoxContainer>
          <ModalHeader>
            <ModalTitle>{bandeja?.nome || "Nova Bandeja"}</ModalTitle>
          </ModalHeader>
          <ModalBody>
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
                disabled
                value={bandeja?.codigo || ""}
                label="Código da Bandeja"
                placeholder="Código da Bandeja"
              />
            </InputGroup>
            <InputGroup>
              <InputFieldComponent
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
                    // style={{ maxHeight: 600 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleAddProduto(item)}>
                        <DropdownResultItem>
                          <Text style={{ fontWeight: "bold" }}>
                            {item.nomeEcommerce}
                          </Text>
                          <Text>Referência: {item.codigo}</Text>
                          <Text>Preço: R$ {item.precoUnitario}</Text>
                        </DropdownResultItem>
                      </TouchableOpacity>
                    )}
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

            <FlatList
              data={selectedItems}
              // style={{ maxHeight: 400 }}
              keyExtractor={(item) => item.codigo}
              renderItem={({ item }) => {
                const productImage = item.imagens
                  ? item.imagens[0].imagemUrl
                  : "https://via.placeholder.com/150";
                return (
                  <ItemContainer>
                    <ItemImage
                      source={{
                        productImage,
                      }}
                    />
                    <ItemDetails>
                      <Text style={{ fontWeight: "bold" }}>{item.codigo}</Text>
                      <Text>{item.nomeEcommerce}</Text>
                      <Text>R${item.precoUnitario}</Text>
                    </ItemDetails>
                    <RemoveButton onPress={() => handleRemoveItem(item.codigo)}>
                      <FontAwesome name="trash" size={24} color="black" />
                    </RemoveButton>
                  </ItemContainer>
                );
              }}
            />
          </ModalBody>
          <ModalFooter>
            <ConfirmacaoModalButton
              text="Cancelar"
              variant="exit"
              onPress={() => {}}
            />
            <ConfirmacaoModalButton text="Salvar" onPress={handleSave} />
          </ModalFooter>
        </BoxContainer>
      </View>
    </ModalContainer>
  );
};

export default ModalBandeja;
