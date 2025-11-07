import React, { memo, useState } from "react";
import {
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
  Fontisto,
  FontAwesome5,
} from "@expo/vector-icons";
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
  IconContainer,
  ProductInfoQtdContainer,
  QuantityTextInput,
  LeftIconsContainer,
  RightIconsContainer,
} from "./style";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ProdutosParams } from "@/types/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { useOrientation } from "@/context/OrientationContext";
import * as SQLite from "expo-sqlite";
import { useTopContext } from "@/context/TopContext";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import CheckBox from "expo-checkbox";
import { formatCurrency } from "@/helpers";

/**
 * Helper para normalizar a prop productImage, seja string (URL) ou local require (número).
 */
function getImageSource(img?: string | number) {
  if (typeof img === "string") {
    return { uri: img };
  }
  return img;
}

const db = SQLite.openDatabaseSync("user_data.db");

type TopRouteProp = RouteProp<ProdutosParams, keyof ProdutosParams>;
type NavigationProp = NativeStackNavigationProp<ProdutosParams>;

interface BandejaCatalogoProduto extends CatalogoItem {
  precoDesconto: number;
  productImage: { uri: string };
  allImagens: { imagemUrl: string }[];
  inventoryQtd: number;
  catalogOpen?: boolean;
  nomeEcommerce: string;
  isSelected: boolean;
  onSelect: (codigo: string, isSelected: boolean) => void;
}

const CardBandejaProdutoCatalogo: React.FC<BandejaCatalogoProduto> = ({
  nomeEcommerce,
  codigo,
  descricaoTecnica,
  descricaoComercial,
  codigoBarra,
  ncm,
  precoUnitario,
  precoUnitarioComIPI,
  precoDesconto,
  fecho,
  materialPulseira,
  tamanhoPulseira,
  resistenciaAgua,
  peso,
  materialCaixa,
  tamanhoCaixa,
  espessuraCaixa,
  garantia,
  productImage,
  inventoryQtd,
  catalogOpen,
  isSelected,
  sinalizadores,
  onSelect,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { updateCarrinhosCount } = useTopContext();

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TopRouteProp>();
  const { cpfCnpj, clienteId, selectedClient, selectedTabelaPreco } =
    route.params || {};

  const { isModoPaisagem, width } = useOrientation();

  const isCatalogo = route.name === "Catalogo";

  const parsedSinalizadores =
    typeof sinalizadores === "string"
      ? JSON.parse(sinalizadores)
      : sinalizadores;

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const updateCart = async (newQuantity) => {
    if (!clienteId) {
      Alert.alert(
        "Erro",
        "Cliente não identificado. Verifique se o cliente foi selecionado corretamente."
      );
      return;
    }

    try {
      const querySelectPedido = `
        SELECT * FROM NovoPedido WHERE cpfCnpj = ? AND clienteId = ? LIMIT 1;
      `;
      const result = await db.getAllAsync(querySelectPedido, [
        cpfCnpj,
        clienteId,
      ]);

      let pedidoExistente = result[0];
      const novoProduto = {
        codigo,
        nomeEcommerce,
        quantidade: newQuantity,
        precoUnitario,
        precoUnitarioComIPI,
        imagem: productImage,
      };

      if (pedidoExistente) {
        const produtosExistentes = JSON.parse(pedidoExistente.produtos || "[]");
        const produtoIndex = produtosExistentes.findIndex(
          (p) => p.codigo === codigo
        );

        if (newQuantity === 0 && produtoIndex > -1) {
          // Remove o produto do carrinho
          produtosExistentes.splice(produtoIndex, 1);
        } else if (produtoIndex > -1) {
          // Atualiza a quantidade do produto existente
          produtosExistentes[produtoIndex].quantidade = newQuantity;
        } else if (newQuantity > 0) {
          // Adiciona um novo produto
          produtosExistentes.push(novoProduto);
        }

        const quantidadeTotal = produtosExistentes.reduce(
          (acc, p) => acc + p.quantidade,
          0
        );
        const valorTotal = produtosExistentes.reduce(
          (acc, p) => acc + p.quantidade * p.precoUnitarioComIPI,
          0
        );

        const queryUpdatePedido = `
          UPDATE NovoPedido
          SET produtos = ?, nomeEcommerce = ?, quantidadeItens = ?, quantidadePecas = ?, valorTotal = ?, selectedTabelaPreco = ?
          WHERE id = ?;
        `;

        await db.runAsync(queryUpdatePedido, [
          JSON.stringify(produtosExistentes),
          nomeEcommerce,
          produtosExistentes.length,
          quantidadeTotal,
          valorTotal,
          selectedTabelaPreco,
          pedidoExistente.id,
        ]);
      } else if (newQuantity > 0) {
        // Cria um novo pedido
        const queryInsertNovoPedido = `
          INSERT INTO NovoPedido (
            clienteId, razaoSocial, cpfCnpj, enderecoEntrega, numeroEntrega,
            cepEntrega, bairroEntrega, complementoEntrega, estadoEntrega,
            municipioEntrega, produtos, quantidadeItens, quantidadePecas, valorTotal, selectedTabelaPreco, nomeEcommerce
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const clienteSelecionado = selectedClient;
        const enderecosCliente = JSON.parse(
          clienteSelecionado.enderecos || "[]"
        );
        const endereco = enderecosCliente[0] || {};

        await db.runAsync(queryInsertNovoPedido, [
          clienteSelecionado.clienteId,
          clienteSelecionado.razaoSocial,
          clienteSelecionado.cpfCnpj,
          clienteSelecionado.enderecoCompleto,
          "",
          endereco.cep || "",
          endereco.bairro || "",
          endereco.complemento || "",
          endereco.estado || "",
          endereco.municipio || "",
          JSON.stringify([novoProduto]),
          1,
          quantity,
          precoUnitarioComIPI * quantity,
          selectedTabelaPreco,
          nomeEcommerce,
        ]);
      }

      updateCarrinhosCount();
    } catch (error) {
      console.error("Erro ao atualizar o carrinho:", error);
      Alert.alert("Erro", "Não foi possível atualizar o carrinho.");
    }
  };

  const handleInputChange = (text: string) => {
    const sanitizedText = text.replace(/[^0-9]/g, "");
    const newQuantity = Number(sanitizedText) || 0;
    setQuantity(newQuantity);
    updateCart(newQuantity);
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateCart(newQuantity);
  };

  const decrementQuantity = () => {
    const newQuantity = Math.max(quantity - 1, 0);
    setQuantity(newQuantity);
    updateCart(newQuantity);
  };

  const getIconBySinalizador = (codigo: string) => {
    if (codigo) {
      switch (codigo) {
        case (codigo = "001"):
          return <FontAwesome6 name="trophy" size={20} color="black" />;

        case (codigo = "002"):
          return <FontAwesome6 name="gift" size={20} color="black" />;

        case (codigo = "003"):
          return <MaterialIcons name="new-releases" size={20} color="black" />;

        case (codigo = "004"):
          return (
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={20}
              color="black"
            />
          );

        case (codigo = "005"):
          return <Fontisto name="arrow-return-right" size={20} color="black" />;

        case (codigo = "006"):
          return (
            <MaterialCommunityIcons name="cart-check" size={20} color="black" />
          );

        default:
          return <FontAwesome5 name="question" size={20} color="black" />;
      }
    }
  };

  // Se não tiver URI válida, usa imagem padrão
  if (!productImage.uri || productImage.uri === "") {
    productImage = require("@/assets/images/sem-imagem.png");
  }

  return (
    <>
      <CardContainer isModoPaisagem={isModoPaisagem} deviceWidth={width}>
        {/* <IconContainer> */}
        <LeftIconsContainer>
          {Array.isArray(parsedSinalizadores) &&
            parsedSinalizadores.map((sinalizador: { codigo: string }) => {
              return (
                <TouchableOpacity key={sinalizador.codigo}>
                  {getIconBySinalizador(sinalizador.codigo)}
                </TouchableOpacity>
              );
            })}
        </LeftIconsContainer>
        <RightIconsContainer>
          {/* Custom Checkbox */}
          <TouchableOpacity
            
            onPress={() => onSelect(codigo, isSelected)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: isSelected ? "#34C759" : "#ffffff",
              borderWidth: 2,
              borderColor: isSelected ? "#34C759" : "#c0c0c0",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isSelected && <AntDesign name="check" size={22} color="#ffffff" />}
          </TouchableOpacity>
        </RightIconsContainer>
        {/* </IconContainer> */}

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("DetalhesDoProduto", {
              codigo,
              precoUnitario,
              precoUnitarioComIPI,
              precoUnitarioComIPIOuNao: precoUnitarioComIPI,
              codigoBarra,
              ncm,
              fecho,
              tamanhoCaixa,
              resistenciaAgua,
              tamanhoPulseira,
              materialPulseira,
              espessuraCaixa,
              materialCaixa,
              peso,
              garantia,
              descricaoComercial,
              descricaoTecnica,
              productImage,
              catalogOpen,
              parsedSinalizadores,
              imagens: [],
            });
          }}
        >
          <View style={{ alignItems: "center" }}>
            <ProductImage
              source={
                productImage &&
                productImage !== undefined &&
                productImage.uri !== "" &&
                productImage.uri !== undefined
                  ? productImage
                  : require("@/assets/images/sem-imagem.png")
              }
              // source={getImageSource(productImage)}
              isModoPaisagem={isModoPaisagem}
              deviceWidth={width}
            />
            <ProductTitle>{codigo}</ProductTitle>

            <ProductInfoContainer>
              <DiscountedPriceContainer>
                <DiscountedPrice>
                  {formatCurrency(precoUnitarioComIPI)}
                </DiscountedPrice>
              </DiscountedPriceContainer>
              <ProductDiscountPercentage>
                (-{precoDesconto}%)
              </ProductDiscountPercentage>
              <ProductInfoQtdContainer>
                <MaterialIcons name="local-offer" size={20} color="black" />
                <ProductInfo>{inventoryQtd}</ProductInfo>
              </ProductInfoQtdContainer>
            </ProductInfoContainer>
          </View>
        </TouchableOpacity>

        {catalogOpen && (
          <>
            <QuantityContainer>
              <QuantityButton onPress={decrementQuantity}>
                <QuantityButtonText>-</QuantityButtonText>
              </QuantityButton>
              <QuantityTextInput
                keyboardType="numeric"
                value={quantity.toString()}
                onChangeText={handleInputChange}
                maxLength={5}
              />
              <QuantityButton onPress={incrementQuantity}>
                <QuantityButtonText>+</QuantityButtonText>
              </QuantityButton>
            </QuantityContainer>
          </>
        )}
      </CardContainer>
    </>
  );
};

export default memo(CardBandejaProdutoCatalogo);
// export default CardProdutoCatalogo;
