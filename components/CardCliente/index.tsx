import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  CardContainer,
  InfoRow,
  Label,
  Value,
  Separator,
  IconContainer,
  IconButton,
  CheckButtonContainer,
  CheckButton,
} from "./style";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"; // Certifique-se de usar o hook correto
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";
import { useOrientation } from "@/context/OrientationContext";
import * as SQLite from "expo-sqlite";
import SelecaoTabelaProdutoModal from "@/modal/ModalSelecaoTabelaProduto";
import { AntDesign } from "@expo/vector-icons";

interface CardClienteProps {
  cliente: {
    codigo: string;
    cpfCnpj: string;
    razaoSocial: string;
    enderecoCompleto: string;
    [key: string]: any; // Para aceitar outras propriedades
  };
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
  isSelected: boolean;
  onSelect: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TopRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;


export const CardCliente: React.FC<CardClienteProps> = ({
  cliente,
  isSelected,
  onSelect,
}) => {
  const [selecaoTabelaPreco, setSelecaoTabelaPreco] = useState(false);

  //const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TopRouteProp>();
  const { isModoPaisagem, width } = useOrientation();

  const isCopiarPedido = route.name === "CopiarPedido";

  if (!cliente) {
    console.warn("Cliente não foi fornecido.");
    return null;
  }

  const handleSelectTabelaPreco = () => {
    setSelecaoTabelaPreco(true);
  };

  //forma anterior de selecionar cliente e navegar para o catálogo fechado, deixar comentado para futura referência

  return (
    <>
      <CardContainer isModoPaisagem={isModoPaisagem}>
        {isCopiarPedido && (
          <TouchableOpacity
            // onPress={() => console.log("Selecionado")}
            onPress={onSelect}
            style={{
              zIndex: 10,
              position: "absolute",
              top: 10,
              right: 10,
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
        )}
        <InfoRow style={{ marginBottom: 5 }}>
          <View style={{ width: "50%" }}>
            <Label isModoPaisagem={isModoPaisagem} width={width}>
              Código:
            </Label>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.codigo}
            </Value>
          </View>
          <View style={{ width: "50%" }}>
            <Label isModoPaisagem={isModoPaisagem} width={width}>
              CNPJ:
            </Label>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.cpfCnpj}
            </Value>
          </View>
        </InfoRow>
        <Separator />
        <View style={{ marginBottom: 5 }}>
          <Label isModoPaisagem={isModoPaisagem} width={width}>
            Razão Social:
          </Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.razaoSocial}
            </Value>
          </ScrollView>
        </View>
        <Separator />
        <View style={{ marginBottom: 5 }}>
          <Label isModoPaisagem={isModoPaisagem} width={width}>
            Endereço:
          </Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.enderecoCompleto}
            </Value>
          </ScrollView>
        </View>
        <Separator />
        <IconContainer>
          {!isCopiarPedido && (
            <IconButton>
              <FontAwesome name="thumbs-up" size={34} color="#000" />
            </IconButton>
          )}
          {/* <IconButton
            onPress={() =>
              navigation.navigate("DetalhesDoCliente", {
                codigo: cliente.codigo,
              })
            }
          >
            <MaterialIcons name="find-in-page" size={34} color="#000" />
          </IconButton> */}
          {!isCopiarPedido && (
            <IconButton onPress={handleSelectTabelaPreco}>
              <Entypo name="shop" size={34} color="black" />
            </IconButton>
          )}
        </IconContainer>
      </CardContainer>

      {selecaoTabelaPreco && (
        <SelecaoTabelaProdutoModal
          onClose={() => setSelecaoTabelaPreco(false)}
          visible={selecaoTabelaPreco}
          cliente={cliente}
        />
      )}
    </>
  );
};
