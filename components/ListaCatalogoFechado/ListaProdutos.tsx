// components/ListaCatalogoFechado/ListaProdutos.tsx
import React, { useMemo, useRef, useCallback } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  ListRenderItem,
} from "react-native";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import CardProdutoCatalogo from "@/components/CardProdutoCatalogo";
import { FavoritoDeps } from "@/components/CardProdutoCatalogo/mapper/getProdutoViewData";
import { makeShortKey } from "@/utils/makeShortKey";

interface ListaProdutosProps {
  representanteId: string;
  produtos?: CatalogoItem[];
  carregarMais: () => void;
  loading: boolean;
  numColumns: number; // vem do OrientationContext
  catalogOpen?: boolean;

  // ↓ favoritos
  favDeps?: FavoritoDeps; // { isFavoriteById, toggleFavoriteById }
  favoritesMap?: Record<string, boolean>; // usado para calcular favKey por item
  favoritesVersion?: number;             // força re-render dos itens visíveis
  listKey?: string;

  // injeta "já comprou"
  isJaComprou?: (codigoProduto: string) => boolean;
}

const ListaProdutos: React.FC<ListaProdutosProps> = ({
  representanteId,
  produtos = [],
  carregarMais,
  loading,
  numColumns,
  catalogOpen,
  favDeps,
  favoritesMap,
  favoritesVersion = 0,
  listKey,
  isJaComprou, 
}) => {
  const isDraggingRef = useRef(false);
  const lastEndReachedRef = useRef(0);

  const handleEndReached = useCallback(() => {
    if (loading) return;
    if (!produtos || produtos.length === 0) return;
    const now = Date.now();
    if (now - lastEndReachedRef.current < 350) return; // throttle simples
    lastEndReachedRef.current = now;
    carregarMais();
  }, [carregarMais, loading, produtos]);

  const renderItem: ListRenderItem<CatalogoItem> = useCallback(
    ({ item }) => {
      if (!item || !item.codigo) return null;

      const produtoId = String((item as any)?.id ?? item.codigo);

      const favKey =
        favoritesMap && Object.prototype.hasOwnProperty.call(favoritesMap, produtoId)
          ? favoritesMap[produtoId] ? 1 : 0
          : 0;

      return (
        <CardProdutoCatalogo
          produto={item}
          catalogOpen={catalogOpen}
          // disableNavigate={isDraggingRef.current}
          favDeps={favDeps}
          favKey={favKey}
          isJaComprou={isJaComprou}   
        />
      );
    },
    [catalogOpen, favDeps, favoritesMap, isJaComprou]
  );   

  const keyExtractor = useCallback(
    (item: CatalogoItem, index: number) =>
      item?.codigo ? String(item.codigo) : `idx-${index}`,
    []
  );

  const columnStyle = useMemo(
    () =>
      numColumns > 1
        ? styles.columnMulti
        : undefined,
    [numColumns]
  );

  const renderFooter = useCallback(
    () =>
      loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Buscando produto ...</Text>
          <ActivityIndicator size="large" />
        </View>
      ) : null,
    [loading]
  );

  const renderEmpty = useCallback(
    () =>
      !loading ? (
        <View style={styles.emptyMessageContainer}>
          <Text style={styles.emptyMessageText}>Nenhum produto encontrado.</Text>
        </View>
      ) : null,
    [loading]
  );

  const shortKey = React.useMemo(() => makeShortKey(listKey), [listKey]);
  const index_key = `cols-${numColumns}-${shortKey}`; // encurta a chave, estável  

  return (
    <FlatList
      key={index_key} // força remount ao mudar colunas
      style={styles.list}
      data={produtos}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={numColumns}
      columnWrapperStyle={columnStyle} // só é aplicado quando > 1
      initialNumToRender={16}
      maxToRenderPerBatch={16}
      windowSize={7}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={renderFooter}
      ListFooterComponentStyle={loading ? styles.footerActive : styles.footerInactive}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={renderEmpty}
      removeClippedSubviews={Platform.OS === "android"}
      // re-render quando favoritos mudarem (sem precisar rolar)
      extraData={{ loading, favoritesVersion }}
    />
  );
};

export default React.memo(ListaProdutos);

const styles = StyleSheet.create({
  list: {
    marginBottom: 20,
  },
  columnMulti: {
    justifyContent: "space-around",
    marginVertical: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 60,
    width: "100%",
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  emptyMessageContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyMessageText: {
    color: "#888",
  },
  footerActive: {
    minHeight: 48,
  },
  footerInactive: {
    minHeight: 0,
  },
  contentContainer: {
    paddingBottom: 12,
  },
});
