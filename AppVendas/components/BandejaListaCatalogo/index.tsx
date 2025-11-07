import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";

import * as SQLite from "expo-sqlite";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import CardBandejaProdutoCatalogo from "../CardBandejaProdutoCatalogo";

const db = SQLite.openDatabaseSync("user_data.db");

const ITEMS_PER_PAGE = 20;

interface BandejaListaCatalogoProps {
  selectedItems: CatalogoItem[];
  onSelectProduct: (produto: CatalogoItem, isSelected: boolean) => void;
}

const BandejaListaCatalogo: React.FC<BandejaListaCatalogoProps> = ({
  selectedItems,
  onSelectProduct,
}) => {
  const [produtosAtuais, setProdutosAtuais] = useState<CatalogoItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [footerLoading, setFooterLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Número de colunas dinâmico
  const getNumColumns = () => (Dimensions.get("window").width > 1000 ? 4 : 3);
  const [numColumns, setNumColumns] = useState(getNumColumns());

  const isFetching = useRef(false);

  useEffect(() => {
    fetchBandejaCatalogoDBData(1);

    const subscription = Dimensions.addEventListener(
      "change",
      handleOrientationChange
    );
    return () => subscription?.remove();
  }, []);

  const handleSelectProduct = (produto: CatalogoItem, isSelected: boolean) => {
    onSelectProduct(produto, isSelected);
  };

  const handleOrientationChange = () => {
    const newNumColumns = getNumColumns();
    if (newNumColumns !== numColumns) {
      setNumColumns(newNumColumns);
    }
  };

  const fetchBandejaCatalogoDBData = async (currentPage: number) => {
    if (isFetching.current) return; // Evita múltiplas chamadas
    isFetching.current = true;

    if (currentPage === 1) setProductsLoading(true);
    else setFooterLoading(true);

    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const query = `SELECT * FROM Catalogo LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
      const CatalogoProdutosDB = await db.getAllAsync(query);

      const parsedProdutos = CatalogoProdutosDB.map((produto: any) => ({
        ...produto,
        imagens: produto.imagens ? JSON.parse(produto.imagens) : [],
      }));

      // Combine os produtos já carregados com os novos, garantindo que não haja duplicatas.
      setProdutosAtuais((prevProdutos) => {
        const prodMap = new Map<string, CatalogoItem>();
        // Adiciona os produtos já carregados
        prevProdutos.forEach((item) => prodMap.set(item.codigo, item));
        // Adiciona os novos produtos
        parsedProdutos.forEach((item) => prodMap.set(item.codigo, item));
        // Adiciona também os itens selecionados (para que eles fiquem no topo)
        selectedItems.forEach((item) => prodMap.set(item.codigo, item));
        return Array.from(prodMap.values());
      });

      if (CatalogoProdutosDB.length < ITEMS_PER_PAGE) setHasMore(false);
    } catch (error) {
      console.error("Erro ao buscar dados do catálogo:", error);
    } finally {
      isFetching.current = false;
      setProductsLoading(false);
      setFooterLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !footerLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBandejaCatalogoDBData(nextPage);
    }
  };

  const renderFooter = () => {
    if (footerLoading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!hasMore && produtosAtuais.length > 0) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <Text style={{ color: "#555", fontSize: 16 }}>
            Você chegou ao final da lista! 🎉
          </Text>
          <Text style={{ color: "#888", fontSize: 14 }}>
            Não há mais produtos para exibir.
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmptyList = () => {
    if (footerLoading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!produtosAtuais.length && !productsLoading) {
      // Se não houver produtos filtrados e não estiver carregando
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <Text style={{ color: "#555", fontSize: 18 }}>
            Produtos não encontrados! 😢
          </Text>
          <Text style={{ color: "#555", fontSize: 16 }}>
            Verifique os filtros aplicados ou revise o termo de busca.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      {productsLoading ? (
        <>
          <ActivityIndicator
            size={62}
            color="#0000ff"
            style={{ marginTop: 40 }}
          />
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            Carregando Produtos ...
          </Text>
        </>
      ) : (
        <FlatList
          key={`flatlist-columns-${numColumns}`}
          data={produtosAtuais}
          extraData={numColumns}
          keyExtractor={(item, index) => `${item.codigo}-${index}`}
          renderItem={({ item }) => {
            const productImage = { uri: item.imagens[0]?.imagemUrl ?? "" };
            const allImagens = item.imagens;

            const isSelected = selectedItems.some(
              (selectedItem) => selectedItem.codigo === item.codigo
            );

            let precoUnitarioComIPIOuNao = 0;
            if (item.precoComIPI && item.precoComIPI > 0) {
              precoUnitarioComIPIOuNao = item.precoComIPI;
            } else {
              precoUnitarioComIPIOuNao = item.precoUnitario;
            }

            return (
              <CardBandejaProdutoCatalogo
                sinalizadores={item.sinalizadores}
                nomeEcommerce={item.nomeEcommerce}
                codigo={item.codigo}
                precoUnitario={item.precoUnitario}
                precoUnitarioComIPI={precoUnitarioComIPIOuNao}
                codigoBarra={item.codigoBarra}
                ncm={item.ncm}
                fecho={item.fecho}
                tamanhoCaixa={item.tamanhoCaixa}
                resistenciaAgua={item.resistenciaAgua}
                tamanhoPulseira={item.tamanhoPulseira}
                materialPulseira={item.materialPulseira}
                materialCaixa={item.materialCaixa}
                espessuraCaixa={item.espessuraCaixa}
                peso={item.peso}
                garantia={item.garantia}
                descricaoComercial={item.descricaoComercial}
                descricaoTecnica={item.descricaoTecnica}
                productImage={productImage}
                // allImagens={allImagens}
                inventoryQtd={item.quantidadeEstoquePA}
                isSelected={isSelected}
                precoDesconto={item.precoDesconto || 0}
                onSelect={() => onSelectProduct(item, isSelected)}
              />
            );
          }}
          numColumns={numColumns}
          columnWrapperStyle={{
            justifyContent: "space-around",
            marginVertical: 10,
          }}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default BandejaListaCatalogo;
