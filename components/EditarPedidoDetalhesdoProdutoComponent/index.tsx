import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  FlatList,
  View,
  TouchableOpacity,
  ImageSourcePropType,
  Text,
  Alert,
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
  Tag,
  Container,
  PriceText,
  CarouselContainer,
  ArrowButton,
  ProductItem,
  ProductImage,
  ProductPrice,
  TitleContainer,
  Title,
  Subtitle,
  TagsContainer,
  InfoContainer,
  InfoText,
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
import {
  AntDesign,
  MaterialIcons,
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
  Fontisto,
  FontAwesome5,
} from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProdutosParams, RootStackParamList } from "@/types/types";
import { useProdutoQuantidade } from "@/context/ProdutoQuantidadeContext";

import * as SQLite from "expo-sqlite";
import { ContentContainer } from "../Tabs/style";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import AuthContext from "@/context/AuthContext";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";

const db = SQLite.openDatabaseSync("user_data.db");

type EditarPedidoDetalhesDoProdutoRouteProp = RouteProp<
  ProdutosParams,
  "DetalhesDoProduto"
>;

interface Catalogo {
  codigo: string;
  precoUnitario: number;
  codigoBarra: string;
  ncm: string;
  fecho: string;
  tamanhoCaixa: string;
  resistenciaAgua: string;
  tamanhoPulseira: string;
  materialPulseira: string;
  espessuraCaixa: string;
  materialCaixa: string;
  peso: string;
  garantia: string;
  descricaoComercial: string;
  descricaoTecnica: string;
  imagens: string;
  parsedSinalizadores: any[];
}

const EditarPedidoDetalhesdoProdutoComponent: React.FC = () => {
  const route = useRoute<EditarPedidoDetalhesDoProdutoRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { selectedTabelaPrecoContext, selectedClientContext } =
    useClientInfoContext();
  const { userData } = useContext(AuthContext);

  const representanteCreateId = userData?.representanteCreateId;
  const representanteId = userData?.representanteId;
  const selectedTabelaPreco = selectedTabelaPrecoContext;
  const selectedClient = selectedClientContext;

  const {
    nomeEcommerce,
    codigo,
    precoUnitario,
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
    parsedSinalizadores,
    cpfCnpj,
    clienteId,
  } = route.params;

  // Contexto de edição de pedido
  const { carrinho, adicionarProduto, atualizarQuantidade, removerProduto } =
    useEditarPedidoAberto();

  // Deriva quantidade atual do carrinho
  const currentItem = carrinho.find((p) => p.codigo === codigo);
  const quantity = currentItem?.quantidade || 0;

  // Imagens do produto
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [mainImage, setMainImage] = useState<number | string>(
    productImage || ""
  );
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [localInput, setLocalInput] = useState<string>(quantity.toString());

  const ITEMS_PER_VIEW = 3; // Quantidade de imagens exibidas por vez

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
        const urls = imagensArray.map(
          (img: { imagemUrl: string }) => img.imagemUrl
        );
        setProductImages(urls);
      }
    } catch (error) {
      console.error("Erro ao obter imagens do produto:", error);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const [prefix, suffix] = codigo.split("/");
      const query = `
        SELECT *
        FROM Catalogo
        WHERE codigo LIKE ?
      `;
      const results = await db.getAllAsync(query, [`${prefix}%`]);

      if (results && results.length > 0) {
        const products = results
          .map((item: any) => ({
            codigo: item.codigo,
            precoUnitario: item.precoUnitario,
            codigoBarra: item.codigoBarra,
            ncm: item.ncm,
            fecho: item.fecho,
            tamanhoCaixa: item.tamanhoCaixa,
            resistenciaAgua: item.resistenciaAgua,
            tamanhoPulseira: item.tamanhoPulseira,
            materialPulseira: item.materialPulseira,
            espessuraCaixa: item.espessuraCaixa,
            materialCaixa: item.materialCaixa,
            peso: item.peso,
            garantia: item.garantia,
            descricaoComercial: item.descricaoComercial,
            descricaoTecnica: item.descricaoTecnica,
            productImage: JSON.parse(item.imagens)?.[0]?.imagemUrl || "",
            parsedSinalizadores: JSON.parse(item.sinalizadores),
          }))
          .filter((product: any) => product.codigo !== codigo);
        // console.log("Produtos Similares Encontrados: ", products);
        setSimilarProducts(products);
        // console.log("===Produtos similares atualizados:", products);
      } else {
        setSimilarProducts([]);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos similares:", error);
      setSimilarProducts([]);
    }
  };

  const handleNavigateToProduct = (productCode: string) => {
    // console.log("===Código do Produto Clicado:", productCode);
    const selectedProduct = similarProducts.find(
      (p) => p.codigo === productCode
    );

    // Verifique se o produto foi encontrado
    if (!selectedProduct) {
      console.error(`Produto com código ${productCode} não encontrado`);
      return; // Adiciona um return para evitar que o código abaixo seja executado
    }

    // console.log("selectedProduct", selectedProduct);
    if (selectedProduct) {
      setMainImage(selectedProduct.productImage);
      handleGetProductImagesByCodigo(selectedProduct.codigo);

      navigation.navigate("EditarPedidoDetalhesDoProduto", {
        codigo: selectedProduct.codigo,
        descricaoTecnica: selectedProduct.descricaoTecnica,
        descricaoComercial: selectedProduct.descricaoComercial,
        codigoBarra: selectedProduct.codigoBarra,
        ncm: selectedProduct.ncm,
        precoUnitario: selectedProduct.precoUnitario,
        fecho: selectedProduct.fecho,
        tamanhoCaixa: selectedProduct.tamanhoCaixa,
        resistenciaAgua: selectedProduct.resistenciaAgua,
        tamanhoPulseira: selectedProduct.tamanhoPulseira,
        materialPulseira: selectedProduct.materialPulseira,
        espessuraCaixa: selectedProduct.espessuraCaixa,
        materialCaixa: selectedProduct.materialCaixa,
        peso: selectedProduct.peso,
        garantia: selectedProduct.garantia,
        parsedSinalizadores: selectedProduct.parsedSinalizadores,
      });
    }
  };

  const getIconBySinalizador = (codigo: string) => {
    if (codigo) {
      switch (codigo) {
        case (codigo = "001"):
          return <FontAwesome6 name="trophy" size={14} color="black" />;

        case (codigo = "002"):
          return <FontAwesome6 name="gift" size={14} color="black" />;

        case (codigo = "003"):
          return <MaterialIcons name="new-releases" size={14} color="black" />;

        case (codigo = "004"):
          return (
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={14}
              color="black"
            />
          );

        case (codigo = "005"):
          return <Fontisto name="arrow-return-right" size={14} color="black" />;

        case (codigo = "006"):
          return (
            <MaterialCommunityIcons name="cart-check" size={14} color="black" />
          );

        default:
          return <FontAwesome5 name="question" size={14} color="black" />;
      }
    }
  };

  const handleIncrement = () => {
    if (quantity > 0) {
      atualizarQuantidade(codigo, quantity + 1);
    } else {
      adicionarProduto({
        codigo,
        nomeEcommerce,
        precoUnitario,
        quantidade: 1,
        tipo: "R",
        codigoMarca: "",
        imagem:
          typeof productImage === "string"
            ? { uri: productImage }
            : productImage,
        cpfCnpj,
        percentualDesconto: 0,
      });
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      atualizarQuantidade(codigo, quantity - 1);
    } else if (quantity === 1) {
      Alert.alert(
        "Quantidade Mínima",
        "Para remoção do produto, acesse a tela de Editar Pedido."
      );
    }
  };

  const handleInputChange = (text: string) => {
    // Converte o texto para número, se vazio define como 0
    let newValue = parseInt(text.replace(/[^0-9]/g, ""), 10);
    const item = carrinho.find((p) => p.codigo === codigo);

    // Se o valor for NaN (campo vazio), define como 0
    if (isNaN(newValue)) {
      newValue = 0;
    }

    const novoProduto = {
      codigo,
      nomeEcommerce,
      quantidade: newValue,
      precoUnitario,
      tipo: "R",
      codigoMarca: "", // Add a valid value for codigoMarca
      produtos: [], // Add a valid value for produtos if applicable
      imagem:
        typeof productImage === "string" ? { uri: productImage } : productImage,
      cpfCnpj,
      percentualDesconto: 0,
    };

    // Atualiza o estado com o valor numérico correto
    setLocalInput(newValue.toString());

    // Caso contrário, se o produto estiver no carrinho, atualiza a quantidade
    if (newValue <= 0) {
      Alert.alert(
        "Quantidade Mínima",
        "Para remoção do produto, acesse a tela de Editar Pedido."
      );
    } else if (item) {
      atualizarQuantidade(codigo, newValue); // Atualiza no carrinho
    } else {
      adicionarProduto(novoProduto); // Adiciona o novo produto ao carrinho
    }
  };

  useEffect(() => {
    handleGetProductImagesByCodigo(codigo);
  }, []);

  useEffect(() => {
    fetchSimilarProducts();
  }, [codigo]);

  useEffect(() => {
    setLocalInput(quantity.toString());
  }, [quantity]);

  return (
    <ScrollView>
      {/* Imagens do produto */}
      <Container>
        <LeftColumn>
          {currentIndex > 0 && (
            <ArrowButton onPress={scrollToPreviousImage}>
              <AntDesign name="up" size={16} color="#333" />
            </ArrowButton>
          )}

          <FlatList
            data={
              productImages.length > 0
                ? productImages.slice(
                    currentIndex,
                    currentIndex + ITEMS_PER_VIEW
                  )
                : ""
            }
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  setMainImage(typeof item === "string" ? item : "")
                }
              >
                <SmallImage
                  source={
                    typeof item === "string"
                      ? { uri: item }
                      : getImageSource(item)
                  }
                />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
            }}
            style={{ flex: 1 }}
            onMomentumScrollEnd={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / 150); // Ajustar com base no tamanho de cada item
              setCurrentIndex(index * ITEMS_PER_VIEW);
            }}
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
              <Title>{codigo}</Title>
            </TitleContainer>

            <ControlsContainer>
              <QuantityButton onPress={handleDecrement}>
                <AntDesign name="minus" size={18} color="#007bff" />
              </QuantityButton>
              <QuantityText
                keyboardType="numeric"
                value={localInput}
                onChangeText={handleInputChange}
                maxLength={3}
              />
              {/* <QuantityText>{quantity}</QuantityText> */}
              <QuantityButton onPress={handleIncrement}>
                <AntDesign name="plus" size={18} color="#007bff" />
              </QuantityButton>
            </ControlsContainer>

            <PriceContainer>
              <Price>R${(precoUnitario * quantity).toFixed(2)}</Price>
            </PriceContainer>
          </View>
          <TagsContainer>
            {parsedSinalizadores && parsedSinalizadores.length > 0 ? (
              parsedSinalizadores.map((sinalizador, index) => (
                <View
                  key={`${sinalizador.codigo}-${sinalizador.descricao}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    marginRight: 20,
                  }}
                >
                  {getIconBySinalizador(sinalizador.codigo)}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginRight: 20,
              }}
            >
              <Text style={{ textAlign: "center" }}>
                Preço Unitário: {`\n`}R${precoUnitario}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginRight: 20,
              }}
            >
              <Text style={{ textAlign: "center" }}>
                Cód Barras: {`\n`}
                {codigoBarra}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text style={{ textAlign: "center" }}>
                NCM: {`\n`}
                {ncm}
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
          <CarouselContainer>
            <ArrowButton onPress={scrollToPrevious}>
              <AntDesign name="left" size={16} color="#333" />
            </ArrowButton>
            <View style={{ justifyContent: "center" }}>
              <FlatList
                ref={flatListRef}
                data={similarProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.codigo}
                renderItem={({ item }) => (
                  <ProductItem>
                    <TouchableOpacity
                      onPress={() => handleNavigateToProduct(item.codigo)}
                    >
                      <ProductImage source={{ uri: item.productImage }} />
                      <ProductPrice>
                        R${item.precoUnitario.toFixed(2)}
                      </ProductPrice>
                    </TouchableOpacity>
                  </ProductItem>
                )}
              />
            </View>

            <ArrowButton onPress={scrollToNext}>
              <AntDesign name="right" size={16} color="#333" />
            </ArrowButton>
          </CarouselContainer>
        ) : (
          <CarouselContainer>
            <Text style={{ textAlign: "center", padding: 16 }}>
              Nenhum produto similar encontrado.
            </Text>
          </CarouselContainer>
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
            <InfoValue>{fecho ? fecho : "N/A"}</InfoValue>
            <InfoCell>Tamanho da Caixa:</InfoCell>
            <InfoValue>{tamanhoCaixa ? tamanhoCaixa + `mm` : "N/A"}</InfoValue>
            <InfoCell>Resistente à água:</InfoCell>
            <InfoValue>
              {resistenciaAgua ? resistenciaAgua + `ATM` : "N/A"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoCell>Tamanho da Pulseira:</InfoCell>
            <InfoValue>
              {tamanhoPulseira ? tamanhoPulseira + `mm` : "N/A"}
            </InfoValue>
            <InfoCell>Pulseira:</InfoCell>
            <InfoValue>{materialPulseira ? materialPulseira : "N/A"}</InfoValue>
            <InfoCell>Espessura da Caixa:</InfoCell>
            <InfoValue>
              {espessuraCaixa ? espessuraCaixa + `mm` : "N/A"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoCell>Caixa:</InfoCell>
            <InfoValue>{materialCaixa ? materialCaixa : "N/A"}</InfoValue>
            <InfoCell>Peso:</InfoCell>
            <InfoValue>{peso ? peso + `g` : "N/A"}</InfoValue>
            <InfoCell>Garantia:</InfoCell>
            <InfoValue>{garantia ? garantia + `meses` : "N/A"} </InfoValue>
          </InfoRow>
        </InfoTable>

        <DescriptionContainer>
          <DescriptionTitle>Descrição Comercial:</DescriptionTitle>
          <DescriptionText>
            {descricaoComercial ? descricaoComercial : "N/A"}
          </DescriptionText>
        </DescriptionContainer>

        <DescriptionContainer>
          <DescriptionTitle>Especificações Técnicas:</DescriptionTitle>
          <DescriptionText>
            {descricaoTecnica
              ? descricaoTecnica
              : "Nenhuma informação disponível."}
          </DescriptionText>
        </DescriptionContainer>
      </TableContainer>
    </ScrollView>
  );
};

export default EditarPedidoDetalhesdoProdutoComponent;
