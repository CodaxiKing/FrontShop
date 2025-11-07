import React, { useEffect } from "react";
import CardCarrinho from "@/components/CardCarrinho";
import Menu from "@/components/Menu";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { useNavigation } from "expo-router";
import { MenuProvider } from "@/context/MenuProvider";
import { TopProvider } from "@/context/TopContext";
import { ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { CardEditarPedidoAberto } from "@/components/CardEditarPedidoAberto";
import { EditarPedidoAbertoProvider } from "@/context/EditarPedidoAbertoContext";

interface RouteParams {
  cpfCnpj?: string;
  pedidoId?: number;
}

const EditarPedidoAberto: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params as RouteParams;
  const cpfCnpj = params?.cpfCnpj;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <ScrollView style={{ width: "96%" }}>
        <Menu cpfCnpj={cpfCnpj} showMenu={true} />
        <CardEditarPedidoAberto />
      </ScrollView>
    </Theme>
  );
};

export default EditarPedidoAberto;
