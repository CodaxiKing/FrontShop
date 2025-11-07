import React, { useEffect } from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { useNavigation } from "expo-router";
import { ScrollView } from "react-native";
import EditarPedidoDetalhesdoProdutoComponent from "@/components/EditarPedidoDetalhesdoProdutoComponent";

const EditarPedidoDetalhesDoProduto: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <Theme>
      {/* <TopProvider> */}
      <Top />
      {/* </TopProvider> */}
      <ScrollView>
        {/* <LabelComponent labelText="Detalhes do Produto" /> */}
        <EditarPedidoDetalhesdoProdutoComponent />
      </ScrollView>
    </Theme>
  );
};

export default EditarPedidoDetalhesDoProduto;
