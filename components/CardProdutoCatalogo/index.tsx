// components/CardProdutoCatalogo/index.tsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { getProdutoData, FavoritoDeps } from "./mapper/getProdutoViewData";
import { useCardProdutoController } from "./useCardProdutoController";
import CardProdutoCatalogoView from "./CardProdutoCatalogoView";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { useOrientation } from "@/context/OrientationContext";
import { ModalImageZoom } from "@/modal/ModalImageZoom";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import { ImageStorage } from "@/core/infra/ImageStorage"; // [IMAGENS][PATCH]
import { usePedidoCopia } from "@/context/PedidoCopiaContext";
import { useProdutoQuantidade } from "@/context/ProdutoQuantidadeContext";
import AuthContext from "@/context/AuthContext";

interface Props {
  produto: CatalogoItem;
  catalogOpen?: boolean;
  disableNavigate?: boolean;
  favDeps?: FavoritoDeps;
  favKey?: number;
  isJaComprou?: (codigoProduto: string) => boolean;
  jaKey?: number;
}

const CardProdutoCatalogo: React.FC<Props> = ({
  produto,
  catalogOpen,
  disableNavigate = false,
  favDeps,
  favKey,
  isJaComprou,
  jaKey,
}) => {
  const { isModoPaisagem, cardWidth } = useOrientation();

  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  const { selectedTabelaPrecoContext } = useClientInfoContext();
  const tabelaPrecoSelecionada = selectedTabelaPrecoContext ?? {
    tipo: "999999",
    value: "999999",
  };

  const {
    isChecked,
    quantity,
    onCheckBoxPress,
    onIncrementQuantity,
    onDecrementQuantity,
    onInputChange,
    onNavigateToDetails,
  } = useCardProdutoController(produto);

  const {
    codigo,
    precoUnitario,
    precoComIPI,
    percentualDesconto,
    productImage,
    imagemLocal, // [IMAGENS][PATCH]
    imagens, // [IMAGENS][PATCH]
    inventoryQtd,
    isFavorite,
    sinalizadores,
    onToggleFavorite,
    formatCurrency,
  } = getProdutoData(produto, favDeps, { isJaComprou });

  // [IMAGENS][PATCH] monta lista de caminhos locais
  const allImagens = useMemo<string[]>(() => {
    const locais: string[] = [];

    if (imagemLocal) {
      locais.push(imagemLocal);
    }

    if (Array.isArray(produto?.imagens)) {
      for (const it of produto.imagens) {
        if (it?.imagemUrl) {
          const localPath = ImageStorage.buildLocalPath(it.imagemUrl);
          if (localPath && localPath !== imagemLocal) {
            locais.push(localPath);
          }
        }
      }
    }
    return Array.from(new Set(locais)); // remove duplicados mantendo ordem
  }, [produto?.imagens, imagemLocal]);

  // [IMAGENS][PATCH] shape esperado pelo ModalImageZoom
  const zoomImages = useMemo<{ imagemLocal: string }[]>(
    () => allImagens.map((p) => ({ imagemLocal: p })),
    [allImagens]
  );

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const openImageModal = useCallback(() => {
    if (disableNavigate) return;
    if (allImagens.length === 0) return;
    setIsImageModalVisible(true);
  }, [disableNavigate, allImagens.length]);

  const handleNavigate = useCallback(() => {
    if (disableNavigate) return;
    onNavigateToDetails();
  }, [disableNavigate, onNavigateToDetails]);

  // if (__DEV__ && produto?.imagens?.length > 3) {
  //   console.log("[CardProdutoCatalogo] Produto com muitas imagens", {
  //     codigo: produto.codigo,
  //     total: produto.imagens.length,
  //   });
  // }

  return (
    <>
      <CardProdutoCatalogoView
        isModoPaisagem={isModoPaisagem}
        width={cardWidth}
        codigo={codigo}
        precoUnitario={precoUnitario}
        precoUnitarioComIPI={precoComIPI}
        percentualDesconto={percentualDesconto}
        productImage={productImage}
        imagemLocal={imagemLocal} // [IMAGENS][PATCH]
        imagens={imagens} // [IMAGENS][PATCH]
        inventoryQtd={inventoryQtd}
        catalogOpen={!!catalogOpen}
        isFavorite={isFavorite}
        isChecked={isChecked}
        quantity={quantity}
        sinalizadores={sinalizadores}
        tabelaPrecoSelecionada={tabelaPrecoSelecionada}
        onToggleFavorite={onToggleFavorite}
        onCheckBoxPress={onCheckBoxPress}
        onIncrementQuantity={onIncrementQuantity}
        onDecrementQuantity={onDecrementQuantity}
        onInputChange={onInputChange}
        onNavigateToDetails={handleNavigate}
        onOpenImageZoom={openImageModal}
        formatCurrency={formatCurrency}
        disableNavigate={disableNavigate}
      />

      {isImageModalVisible && (
        <ModalImageZoom
          isVisible={isImageModalVisible}
          onClose={() => setIsImageModalVisible(false)}
          images={zoomImages}
        />
      )}
    </>
  );
};

export default React.memo(CardProdutoCatalogo, (prev, next) => {
  const a = prev.produto;
  const b = next.produto;
  return (
    prev.catalogOpen === next.catalogOpen &&
    prev.disableNavigate === next.disableNavigate &&
    prev.favKey === next.favKey &&
    prev.jaKey === next.jaKey &&
    a?.codigo === b?.codigo &&
    a?.precoUnitario === b?.precoUnitario &&
    (a as any)?.inventoryQtd === (b as any)?.inventoryQtd
  );
});
