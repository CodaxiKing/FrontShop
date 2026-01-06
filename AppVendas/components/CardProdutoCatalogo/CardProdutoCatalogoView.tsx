// components/CardProdutoCatalogo/CardProdutoCatalogoView.tsx

import React, { useMemo } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { iconFromKey } from "@/utils/sinalizadorIcon";
import {
  CardContainer,
  ProductImage,
  ProductTitle,
  DiscountedPrice,
  ProductDiscountPercentage,
  ProductInfo,
  QuantityContainer,
  QuantityButton,
  DiscountedPriceContainer,
  ProductInfoContainer,
  QuantityButtonText,
  ProductInfoQtdContainer,
  QuantityTextInput,
  LeftIconsContainer,
  RightIconsContainer,
} from "./style";
import CheckBox from "../Checkbox";
import {
  normalizeSinalizadores,
  decorateForUI,
  type IconKey,
} from "@/utils/normalizeSinalizador";
import { useParametros } from "@/context/ParametrosContext";
import { getProdutoImageSource } from "@/core/images/imageSource"; // [IMAGENS][PATCH]

interface CardProdutoCatalogoViewProps {
  isModoPaisagem: boolean;
  width: number;
  codigo?: string;
  precoUnitario: number;
  precoUnitarioComIPI: number;
  percentualDesconto: number;
  productImage?: string;
  imagemLocal?: string | null; // [IMAGENS][PATCH]
  imagens?: string[]; // [IMAGENS][PATCH]
  inventoryQtd: number;
  catalogOpen: boolean;
  isFavorite: boolean;
  isChecked: boolean;
  quantity: number;
  sinalizadores: [];
  tabelaPrecoSelecionada?: { tipo: string; value: string };
  onToggleFavorite: () => void;
  onCheckBoxPress: () => void;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  onInputChange: (text: string) => void;
  onNavigateToDetails: () => void;
  onOpenImageZoom?: () => void;
  formatCurrency: (value: number) => string;
  disableNavigate?: boolean;
  onOpenSinalizadoresMenu?: () => void;

  onOpenLojasColigadas?: () => void;
  hasColigadas?: boolean;
}

const CardProdutoCatalogoView: React.FC<CardProdutoCatalogoViewProps> = ({
  isModoPaisagem,
  width,
  codigo = "Sem código",
  precoUnitario,
  precoUnitarioComIPI,
  percentualDesconto,
  productImage,
  imagemLocal,
  imagens,
  inventoryQtd,
  catalogOpen,
  isFavorite,
  isChecked,
  quantity,
  sinalizadores,
  tabelaPrecoSelecionada,
  onToggleFavorite,
  onCheckBoxPress,
  onIncrementQuantity,
  onDecrementQuantity,
  onInputChange,
  onNavigateToDetails,
  onOpenImageZoom,
  formatCurrency,
  disableNavigate = false,
  onOpenSinalizadoresMenu,
  onOpenLojasColigadas,
  hasColigadas,
}) => {
  const { exibirDesconto } = useParametros();

  // [IMAGENS][PATCH] helper resolve a fonte da imagem (local > placeholder)
  const imageSource: ImageSourcePropType = useMemo(() => {
    return getProdutoImageSource({ imagemLocal, imagens, productImage });
  }, [imagemLocal, imagens, productImage]);

  let sinalizadoresDecor = useMemo(
    () =>
      decorateForUI(
        normalizeSinalizadores(sinalizadores, { ordenarPorPrioridade: true })
      ).map((s) => ({ ...s, icon: String(s.icon).trim() as IconKey })),
    [sinalizadores]
  );

  const deveExibirDesconto =
    exibirDesconto &&
    (percentualDesconto ?? 0) > 0 &&
    tabelaPrecoSelecionada?.tipo === "002";

  const showPreco =
    precoUnitarioComIPI > 0 ? precoUnitarioComIPI : precoUnitario;

  return (
    <CardContainer isModoPaisagem={isModoPaisagem} deviceWidth={width}>
      <LeftIconsContainer>
        <TouchableOpacity onPress={onToggleFavorite}>
          <AntDesign
            name={isFavorite ? "star" : "staro"}
            size={28}
            color={isFavorite ? "#F2EB46" : "#000000"}
          />
        </TouchableOpacity>
        <View style={styles.sinalizadoresCol}>
          {sinalizadoresDecor.map((s) => (
            <View key={s.codigo} style={styles.sinalizadorIcon}>
              {iconFromKey(s.icon)}
            </View>
          ))}
        </View>
      </LeftIconsContainer>

      <RightIconsContainer>
        {/* Botão de Checkbox */}
        {catalogOpen && (
          <View style={styles.checkboxContainer}>
            <CheckBox
              label=""
              isChecked={isChecked}
              onPress={onCheckBoxPress}
            />
          </View>
        )}

        {/* Botão de Abrir detalhes do Produto */}
        <TouchableOpacity
          onPress={onNavigateToDetails}
          disabled={disableNavigate}
        >
          <Feather name="zoom-in" size={28} color="black" />
        </TouchableOpacity>

        {/* Botão de Abrir Lojas Coligadas */}

        {!catalogOpen && hasColigadas === true && (
          <TouchableOpacity onPress={onOpenLojasColigadas}>
            <FontAwesome5 name="store" size={20} color="black" />
          </TouchableOpacity>
        )}
        {/* Tentativa de adicionar um loader enquanto não carrega */}
        {/* {!catalogOpen && showColigadas === null && (
          <ActivityIndicator size="small" color="#0000ff" />
        )} */}
      </RightIconsContainer>

      {/* Botão de Abrir Zoom da Imagem */}
      <TouchableOpacity
        onPress={onOpenImageZoom}
        disabled={disableNavigate}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {/* [IMAGENS][PATCH] usando helper */}
          <ProductImage
            source={imageSource}
            isModoPaisagem={isModoPaisagem}
            deviceWidth={width}
          />
          <ProductTitle>{codigo}</ProductTitle>

          <ProductInfoContainer>
            <DiscountedPriceContainer>
              <DiscountedPrice>{formatCurrency(showPreco)}</DiscountedPrice>
            </DiscountedPriceContainer>
            <ProductDiscountPercentage>
              {deveExibirDesconto && <>(-{percentualDesconto}%)</>}
            </ProductDiscountPercentage>
            <ProductInfoQtdContainer>
              <MaterialIcons name="local-offer" size={20} color="black" />
              <ProductInfo>{inventoryQtd}</ProductInfo>
            </ProductInfoQtdContainer>
          </ProductInfoContainer>
        </View>
      </TouchableOpacity>

      {!catalogOpen && (
        <QuantityContainer>
          <QuantityButton
            disabled={quantity <= 0}
            onPress={onDecrementQuantity}
          >
            <QuantityButtonText>-</QuantityButtonText>
          </QuantityButton>
          <QuantityTextInput
            keyboardType="numeric"
            value={quantity.toString()}
            onChangeText={onInputChange}
            maxLength={5}
          />
          <QuantityButton onPress={onIncrementQuantity}>
            <QuantityButtonText>+</QuantityButtonText>
          </QuantityButton>
        </QuantityContainer>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    position: "relative",
    left: 2,
    top: -7,
  },
  sinalizadoresCol: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
    paddingVertical: 1,
    minWidth: 28,
  },
  sinalizadorIcon: {
    padding: 2,
  },
  imageContainer: {
    alignItems: "center",
  },
});

export default React.memo(CardProdutoCatalogoView);
