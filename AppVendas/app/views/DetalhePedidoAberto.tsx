import React, { useEffect } from "react";
import CardCarrinho from "@/components/CardCarrinho";
import Menu from "@/components/Menu";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import TopCardPage from "@/components/TopCardPage";
import { useNavigation } from "expo-router";
import CardDetalhePedidoEmAberto from "@/components/CardDetalhePedidoEmAberto";
import { TopProvider } from "@/context/TopContext";
import { useRoute } from "@react-navigation/native";
import { LabelComponent } from "@/components/LabelComponent";

const DetalhePedidoAberto: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pageTitle } = route.params as { pageTitle: string };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <LabelComponent labelText="" labelTextPrefix={false}/>
      <TopCardPage textTopCard={pageTitle ? pageTitle : "Detalhes do Pedido"} />
      <CardDetalhePedidoEmAberto />
    </Theme>
  );
};

export default DetalhePedidoAberto;
