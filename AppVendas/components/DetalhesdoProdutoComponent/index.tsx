// components/DetalhesdoProdutoComponent/index.tsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  FlatList,
  View,
  TouchableOpacity,
  ImageSourcePropType,
  Text,
} from "react-native";
import {
  LeftColumn,
  SmallImage,
  RightColumn,
  MainImage,
  ControlsContainer,
  QuantityButton,
  QuantityText,
  PriceContainer,
  Container,
  CarouselContainer,
  ArrowButton,
  ProductItem,
  ProductImage,
  ProductPrice,
  TitleContainer,
  Title,
  TagsContainer,
  InfoContainer,
  LabelContainer,
  Label,
  InfoTable,
  InfoRow,
  InfoCell,
  DescriptionContainer,
  DescriptionText,
  DescriptionTitle,
  InfoValue,
  TableContainer,
  Price,
} from "./style";
import { AntDesign } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Imagem, ProdutosParams, RootStackParamList } from "@/types/types";

import * as SQLite from "expo-sqlite";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import AuthContext from "@/context/AuthContext";
import { formatCurrency } from "../../helpers/index";
import {
  decorateForUI,
  IconKey,
  normalizeSinalizadores,
} from "@/utils/normalizeSinalizador";
import { iconFromKey } from "@/utils/sinalizadorIcon";
import { useCardProdutoController } from "../CardProdutoCatalogo/useCardProdutoController";
import { ImageStorage } from "@/core/infra/ImageStorage"; // [IMAGENS][PATCH]

const db = SQLite.openDatabaseSync("user_data.db");

type DetalhesDoProdutoRouteProp = RouteProp<
  ProdutosParams,
  "DetalhesDoProduto"
>;

const DetalhesDoProdutoComponent: React.FC = () => {
  const route = useRoute<DetalhesDoProdutoRouteProp>();
  const rawParams = route.params as any;
  const produto = useMemo(() => {
    return rawParams?.produto ?? rawParams;
  }, [rawParams]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { selectedTabelaPrecoContext, selectedClientContext } =
    useClientInfoContext();
  const { userData } = useContext(AuthContext);

  const representanteCreateId = userData?.representanteCreateId;
  const representanteId = userData?.representanteId;
  const selectedTabelaPreco = selectedTabelaPrecoContext;
  const selectedClient = selectedClientContext;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<number | string>(
    produto.imagemLocal ||
      produto.imagens?.[0]?.imagemUrl ||
      produto.productImage ||
      ""
  );
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  const { quantity, onIncrementQuantity, onDecrementQuantity, onInputChange } =
    useCardProdutoController(produto);

  const ITEMS_PER_VIEW = 3;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    handleGetProductImagesByCodigo(produto.codigo);
  }, []);

  useEffect(() => {
    fetchSimilarProducts();
  }, [produto.codigo]);

  const scrollToNextImage = () => {
    if (currentIndex + ITEMS_PER_VIEW < productImages.length) {
      setCurrentIndex((prev) => prev + ITEMS_PER_VIEW);
    }
  };

  const scrollToPreviousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - ITEMS_PER_VIEW);
    }
  };

  const scrollToNext = () => {
    flatListRef.current?.scrollToOffset({
      offset: 120,
      animated: true,
    });
  };

  const scrollToPrevious = () => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  function getImageSource(img: number | string): ImageSourcePropType {
    if (typeof img === "string") {
      return { uri: img };
    }
    return img;
  }

  const handleGetProductImagesByCodigo = async (codigo: string) => {
    try {
      const query = `SELECT imagens FROM Catalogo WHERE codigo = ?`;
      const result: { imagens: string }[] = await db.getAllAsync(query, [
        codigo,
      ]);

      if (result && result[0]?.imagens) {
        const imagensArray = JSON.parse(result[0].imagens);
        const urls = imagensArray
          .map((img: { imagemUrl: string }) =>
            ImageStorage.buildLocalPath(img.imagemUrl)
          )
          .filter(Boolean);
        setProductImages(urls);
      }
    } catch (error) {
      console.error("Erro ao obter imagens do produto:", error);
    }
  };

  const fetchSimilarProducts = async () => {
    if (!produto?.codigo || typeof produto.codigo !== "string") {
      setSimilarProducts([]);
      return;
    }

    try {
      const [prefix] = produto.codigo.split("/");
      const query = `SELECT * FROM Catalogo WHERE codigo LIKE ?`;
      const results = await db.getAllAsync(query, [`${prefix}%`]);

      if (!Array.isArray(results) || results.length === 0) {
        setSimilarProducts([]);
        return;
      }

      const products = results
        .map((item: any) => {
          if (!item || !item.codigo) return null;

          const imagens: Imagem[] = (() => {
            try {
              return JSON.parse(item.imagens || "[]");
            } catch {
              return [];
            }
          })();

          return {
            ...item,
            imagens,
            productImage: imagens?.[0]?.imagemUrl
              ? ImageStorage.buildLocalPath(imagens[0].imagemUrl)
              : item.productImage,
          };
        })
        .filter(
          (p: any): p is any => !!p && p.codigo && p.codigo !== produto.codigo
        );

      setSimilarProducts(products);
    } catch (error) {
      console.error("Erro ao buscar produtos similares:", error);
      setSimilarProducts([]);
    }
  };

  // normaliza sinalizadores
  const sinalizadoresDecor = useMemo(
    () =>
      decorateForUI(
        normalizeSinalizadores(produto.sinalizadores, {
          ordenarPorPrioridade: true,
        })
      ).map((s) => ({ ...s, icon: String(s.icon).trim() as IconKey })),
    [produto.sinalizadores]
  );

  const showPreco =
    produto.precoComIPI > 0 ? produto.precoComIPI : produto.precoUnitario;

  return (
    <ScrollView style={{ width: "100%" }}>
      {/* Imagens do produto */}
      <Container>
        <LeftColumn>
          {currentIndex > 0 && (
            <ArrowButton onPress={scrollToPreviousImage}>
              <AntDesign name="up" size={16} color="#333" />
            </ArrowButton>
          )}

          <FlatList
            data={productImages.slice(
              currentIndex,
              currentIndex + ITEMS_PER_VIEW
            )}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setMainImage(item)}>
                <SmallImage source={{ uri: item }} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
            }}
            style={{ flex: 1 }}
          />

          {currentIndex + ITEMS_PER_VIEW < productImages.length && (
            <ArrowButton onPress={scrollToNextImage}>
              <AntDesign name="down" size={16} color="#333" />
            </ArrowButton>
          )}
        </LeftColumn>

        <RightColumn>
          <MainImage source={getImageSource(mainImage)} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 6,
              gap: 10,
            }}
          >
            <TitleContainer>
              <Title>{produto.codigo}</Title>
            </TitleContainer>

            <ControlsContainer>
              <QuantityButton onPress={onDecrementQuantity}>
                <AntDesign name="minus" size={18} color="#007bff" />
              </QuantityButton>
              <QuantityText
                keyboardType="numeric"
                value={Math.max(0, quantity).toString()}
                onChangeText={onInputChange}
                maxLength={3}
              />
              <QuantityButton onPress={onIncrementQuantity}>
                <AntDesign name="plus" size={18} color="#007bff" />
              </QuantityButton>
            </ControlsContainer>

            <PriceContainer>
              <Price>{formatCurrency(showPreco * quantity)}</Price>
            </PriceContainer>
          </View>

          <TagsContainer>
            {sinalizadoresDecor.length > 0 ? (
              sinalizadoresDecor.map((sinalizador) => (
                <View
                  key={sinalizador.codigo}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    marginRight: 20,
                  }}
                >
                  {iconFromKey(sinalizador.icon)}
                  <Text>{sinalizador.descricao}</Text>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", padding: 16 }}>
                Nenhum sinalizador disponível.
              </Text>
            )}
          </TagsContainer>

          <InfoContainer>
            <View style={{ flexDirection: "row", gap: 5, marginRight: 20 }}>
              <Text>
                Preço Unitário:{"\n"}
                {formatCurrency(showPreco)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 5, marginRight: 20 }}>
              <Text>
                Cód Barras:{"\n"}
                {produto.codigoBarra}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Text>
                NCM:{"\n"}
                {produto.ncm}
              </Text>
            </View>
          </InfoContainer>
        </RightColumn>
      </Container>

      {/* Produtos Similares */}
      <LabelContainer>
        <Label>Produtos Similares</Label>
      </LabelContainer>
      <CarouselContainer>
        {similarProducts.length > 0 ? (
          <>
            <ArrowButton onPress={scrollToPrevious}>
              <AntDesign name="left" size={16} color="#333" />
            </ArrowButton>
            <FlatList
              ref={flatListRef}
              data={similarProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item?.codigo ?? String(index)}
              renderItem={({ item }) => (
                <ProductItem>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("DetalhesDoProduto", {
                        produto: item,
                      })
                    }
                  >
                    <ProductImage source={{ uri: item.productImage }} />
                    <ProductPrice>
                      R${item.precoUnitario.toFixed(2)}
                    </ProductPrice>
                  </TouchableOpacity>
                </ProductItem>
              )}
            />
            <ArrowButton onPress={scrollToNext}>
              <AntDesign name="right" size={16} color="#333" />
            </ArrowButton>
          </>
        ) : (
          <Text style={{ textAlign: "center", padding: 16 }}>
            Nenhum produto similar encontrado.
          </Text>
        )}
      </CarouselContainer>

      {/* Informações do Produto */}
      <LabelContainer>
        <Label>Informações do Produto</Label>
      </LabelContainer>

      <TableContainer>
        <InfoTable>
          <InfoRow>
            <InfoCell>Fecho:</InfoCell>
            <InfoValue>{produto.fecho || "N/A"}</InfoValue>
            <InfoCell>Tamanho da Caixa:</InfoCell>
            <InfoValue>
              {produto.tamanhoCaixa ? produto.tamanhoCaixa + "mm" : "N/A"}
            </InfoValue>
            <InfoCell>Resistente à água:</InfoCell>
            <InfoValue>
              {produto.resistenciaAgua
                ? produto.resistenciaAgua + "ATM"
                : "N/A"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoCell>Tamanho da Pulseira:</InfoCell>
            <InfoValue>
              {produto.tamanhoPulseira ? produto.tamanhoPulseira + "mm" : "N/A"}
            </InfoValue>
            <InfoCell>Pulseira:</InfoCell>
            <InfoValue>{produto.materialPulseira || "N/A"}</InfoValue>
            <InfoCell>Espessura da Caixa:</InfoCell>
            <InfoValue>
              {produto.espessuraCaixa ? produto.espessuraCaixa + "mm" : "N/A"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoCell>Caixa:</InfoCell>
            <InfoValue>{produto.materialCaixa || "N/A"}</InfoValue>
            <InfoCell>Peso:</InfoCell>
            <InfoValue>{produto.peso ? produto.peso + "g" : "N/A"}</InfoValue>
            <InfoCell>Garantia:</InfoCell>
            <InfoValue>
              {produto.garantia ? produto.garantia + " meses" : "N/A"}
            </InfoValue>
          </InfoRow>
        </InfoTable>

        <DescriptionContainer>
          <DescriptionTitle>Descrição Comercial:</DescriptionTitle>
          <DescriptionText>
            {produto.descricaoComercial || "N/A"}
          </DescriptionText>
        </DescriptionContainer>

        <DescriptionContainer>
          <DescriptionTitle>Especificações Técnicas:</DescriptionTitle>
          <DescriptionText>
            {produto.descricaoTecnica || "Nenhuma informação disponível."}
          </DescriptionText>
        </DescriptionContainer>
      </TableContainer>
    </ScrollView>
  );
};

export default DetalhesDoProdutoComponent;
