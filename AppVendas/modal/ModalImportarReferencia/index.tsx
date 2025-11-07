import React, { useState } from "react";
import {
  ModalContainer,
  ModalHeader,
  Title,
  ModalContent,
  StoreHeader,
  ProductRow,
  ProductImage,
  ProductDetails,
  ProductActions,
  InputQuantity,
  ProductName,
  ProductPrice,
  StoreTitle,
  StoreSubtitle,
  ButtonsContainer,
  Button,
  ButtonText,
  StoreContet,
  ProductId,
} from "./style";
import ProdutoImg01 from "../../assets/images/relogios/relogio01.png";
import ProdutoImg02 from "../../assets/images/relogios/relogio02.png";
import ProdutoImg03 from "../../assets/images/relogios/relogio03.png";
import { FontAwesome } from "@expo/vector-icons";
import {
  ImageSourcePropType,
  ScrollView,
  ScrollViewBase,
  Text,
} from "react-native";
import { Modal, View } from "react-native";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

interface Product {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: string;
  quantity: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  products: Product[];
}

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (updatedStores: Store[]) => void;
}

const storesMock: Store[] = [
  {
    id: "1",
    name: "RELOJOARIA EXEMPLO 01 - RJ",
    address: "Rua Alameda dos Anjos 100 Rio de Janeiro - RJ",
    products: [
      {
        id: "#TMAXAN/8D",
        name: "Smartwatch Technos Connect Max Bicolor",
        image: ProdutoImg01,
        price: "R$ 100,00",

        quantity: 1,
      },
      {
        id: "#TMAXAN/9D",
        name: "Relógio Technos Masculino Curvas Digiana Preto",
        image: ProdutoImg02,
        price: "R$ 100,00",
        quantity: 1,
      },
    ],
  },
  {
    id: "2",
    name: "RELOJOARIA EXEMPLO 02 - MG",
    address: "Rua Alameda dos Anjos 100 Belo Horizonte - MG",
    products: [
      {
        id: "#TMAXAN/10D",
        name: "Smartwatch Technos Connect Sports Flamengo Edição Especial",
        image: ProdutoImg03,
        price: "R$ 100,00",
        quantity: 1,
      },
    ],
  },
];

const ModalImportarReferencias: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [stores, setStores] = useState<Store[]>(storesMock);

  const handleRemoveProduct = (storeId: string, productId: string) => {
    setStores((prevStores) =>
      prevStores.map((store) =>
        store.id === storeId
          ? {
              ...store,
              products: store.products.filter(
                (product) => product.id !== productId
              ),
            }
          : store
      )
    );
  };

  const handleRemoveStore = (storeId: string) => {
    setStores((prevStores) =>
      prevStores.filter((store) => store.id !== storeId)
    );
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <ModalContainer>
        <ModalContent>
          <ScrollView>
            <ModalHeader>
              <Title>Importar Referências</Title>
            </ModalHeader>

            {stores.length === 0 ? (
              <View style={{ alignItems: "center", marginVertical: 20 }}>
                <Text
                  style={{ fontSize: 16, color: "#666", textAlign: "center" }}
                >
                  Não há nenhuma loja cadastrada no momento.
                </Text>
              </View>
            ) : (
              stores.map((store) => (
                <React.Fragment key={store.id}>
                  <StoreContet>
                    <StoreHeader>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <View>
                          <StoreTitle>{store.name}</StoreTitle>
                          <StoreSubtitle>{store.address}</StoreSubtitle>
                        </View>
                        <FontAwesome
                          name="trash"
                          size={28}
                          color="#ff4f45"
                          onPress={() => handleRemoveStore(store.id)}
                        />
                      </View>
                    </StoreHeader>

                    {store.products.length === 0 ? (
                      <View
                        style={{ alignItems: "center", marginVertical: 10 }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#999",
                            textAlign: "center",
                          }}
                        >
                          Não há produtos cadastrados nesta loja.
                        </Text>
                      </View>
                    ) : (
                      store.products.map((product) => (
                        <ProductRow key={product.id}>
                          <ProductImage source={product.image} />
                          <ProductDetails>
                            <ProductId>{product.id}</ProductId>
                            <ProductName>{product.name}</ProductName>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <InputQuantity
                                value={String(product.quantity)}
                                editable={false}
                              />
                              <ProductPrice>{product.price}</ProductPrice>
                            </View>
                          </ProductDetails>
                          <ProductActions>
                            <FontAwesome
                              name="trash"
                              size={28}
                              color="#ff4f45"
                              onPress={() =>
                                handleRemoveProduct(store.id, product.id)
                              }
                            />
                          </ProductActions>
                        </ProductRow>
                      ))
                    )}
                  </StoreContet>
                </React.Fragment>
              ))
            )}
          </ScrollView>
          <ButtonsContainer>
            <ConfirmacaoModalButton
              variant="exit"
              onPress={onClose}
              text="Cancelar"
            ></ConfirmacaoModalButton>
            <ConfirmacaoModalButton
              variant="confirm"
              onPress={() => onSave(stores)}
              text="Salvar"
            ></ConfirmacaoModalButton>
          </ButtonsContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalImportarReferencias;
