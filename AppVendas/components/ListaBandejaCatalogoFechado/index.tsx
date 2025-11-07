import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";

import CardProdutoCatalogo from "../CardProdutoCatalogo";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { useRoute } from "@react-navigation/native";

import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("user_data.db");

export const ITEMS_PER_PAGE = 20;

interface ListaBandejaCatalogoFechadoProps {
  bandejaCodigo: string;
}

const ListaBandejaCatalogoFechado: React.FC<
  ListaBandejaCatalogoFechadoProps
> = ({ bandejaCodigo }) => {
  const [produtos, setProdutos] = useState<CatalogoItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [footerLoading, setFooterLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const route = useRoute();
  const { selectedTabelaPreco } = route.params as {
    selectedTabelaPreco: string;
  };

  // Número de colunas dinâmico
  const getNumColumns = () => (Dimensions.get("window").width > 800 ? 5 : 4);
  const [numColumns, setNumColumns] = useState(getNumColumns());

  const isFetching = useRef(false);

  useEffect(() => {
    fetchProdutosDaBandeja(1);

    const subscription = Dimensions.addEventListener(
      "change",
      handleOrientationChange
    );
    return () => subscription?.remove();
  }, [bandejaCodigo]);

  const handleOrientationChange = () => {
    const newNumColumns = getNumColumns();
    if (newNumColumns !== numColumns) {
      setNumColumns(newNumColumns);
    }
  };

  const fetchProdutosDaBandeja = async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const query = `
        SELECT p.*
        FROM BandejaVendedorProduto bvp
        JOIN Catalogo p ON p.codigo = bvp.codigoProduto
        WHERE bvp.codigoBandeja = ? 
      `;
      const result = await db.getAllAsync(query, [bandejaCodigo]);

      const parsedProdutos = result.map((produto: any) => ({
        ...produto,
        imagens: produto.imagens ? JSON.parse(produto.imagens) : [],
      }));

      setProdutos(parsedProdutos as CatalogoItem[]);
    } catch (error) {
      console.error("Erro ao buscar produtos da bandeja:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !footerLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProdutosDaBandeja(nextPage);
    }
  };

  const renderFooter = () => {
    if (footerLoading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!hasMore && produtos.length > 0) {
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

    if (!produtos.length && !loading) {
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

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
          extraData={numColumns}
          data={produtos}
          keyExtractor={(item, index) => `${item.codigo}-${index}`}
          renderItem={({ item }) => {
            const productImage = { uri: item.imagens[0]?.imagemUrl };

            let precoUnitarioComIPIOuNao = 0;
            if (item.precoComIPI && item.precoComIPI > 0) {
              precoUnitarioComIPIOuNao = item.precoComIPI;
            } else {
              precoUnitarioComIPIOuNao = item.precoUnitario;
            }

            return (
              <CardProdutoCatalogo
                catalogOpen
                codigo={item.codigo}
                nomeEcommerce={item.nomeEcommerce}
                precoUnitario={precoUnitarioComIPIOuNao}
                precoComIPI={item.precoComIPI}
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
                inventoryQtd={item.quantidadeEstoquePA}
              />
            );
          }}
          numColumns={numColumns}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginVertical: 10,
          }}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
        />
      )}
    </View>
  );
};

export default ListaBandejaCatalogoFechado;
