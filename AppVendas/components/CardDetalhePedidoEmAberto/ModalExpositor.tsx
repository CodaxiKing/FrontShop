import React from "react";
import {
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  View,
} from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalTitle,
  Card,
  CardImage,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardFooter,
  QuantityContainer,
  QuantityButton,
  QuantityText,
  ButtonRow,
  ButtonCancel,
  ButtonConfirm,
  ButtonText,
  ButtonTextBlue,
  CardHeader,
} from "./style.modal.expositor";
import CheckBox from "../Checkbox";
import CheckboxCircle from "../CheckboxCircle";
import { MaterialIcons } from "@expo/vector-icons";

interface ModalExpositorProps {
  visible: boolean;
  onClose: () => void;
}

const expositorItems = [
  {
    id: "1",
    image: require("../../assets/images/relogios/expositor.png"),
    title: "Estojo Technos Masc.",
    subtitle: "J3525CO/1P",
    stock: 231,
  },
  {
    id: "2",
    image: require("../../assets/images/relogios/expositor.png"),
    title: "Estojo Technos Fem.",
    subtitle: "J3525CO/1P",
    stock: 231,
  },
  {
    id: "3",
    image: require("../../assets/images/relogios/expositor.png"),
    title: "Estojo Technos Unissex",
    subtitle: "J3525CO/1P",
    stock: 231,
  },
];

const ModalExpositor: React.FC<ModalExpositorProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              Escolha seu expositor e adicione ao carrinho.
            </ModalTitle>
          </ModalHeader>
          <FlatList
            data={expositorItems}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Card>
                <CardHeader>
                  <CheckboxCircle
                    selected={false}
                    onPress={function (): void {
                      alert("Item selecionado");
                    }}
                  />
                </CardHeader>
                <CardImage source={item.image} />
                <CardContent>
                  <CardTitle>{item.title}</CardTitle>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 30,
                      alignItems: "center",
                      // justifyContent: "space-around",
                    }}
                  >
                    <CardSubtitle>{item.subtitle}</CardSubtitle>

                    <CardSubtitle>
                      <MaterialIcons
                        name="local-offer"
                        size={16}
                        color="black"
                      />
                      {item.stock}
                    </CardSubtitle>
                  </View>
                </CardContent>
                <CardFooter>
                  <QuantityContainer>
                    <QuantityButton>
                      <Text>-</Text>
                    </QuantityButton>
                    <QuantityText>2</QuantityText>
                    <QuantityButton>
                      <Text>+</Text>
                    </QuantityButton>
                  </QuantityContainer>
                </CardFooter>
              </Card>
            )}
          />
          <ButtonRow>
            <ButtonCancel onPress={onClose}>
              <ButtonTextBlue>Cancelar</ButtonTextBlue>
            </ButtonCancel>
            <ButtonConfirm>
              <ButtonText>Confirmar Seleção</ButtonText>
            </ButtonConfirm>
          </ButtonRow>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalExpositor;
