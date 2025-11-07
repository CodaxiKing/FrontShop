import React, { useEffect } from "react";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { useNavigation } from "expo-router";
import { LabelComponent } from "@/components/LabelComponent";
import DetalhesDoProdutoComponent from "@/components/DetalhesdoProdutoComponent";
import { TopProvider } from "@/context/TopContext";
import { ScrollView } from "react-native";

const DetalhesDoProduto: React.FC = () => {
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
        <DetalhesDoProdutoComponent />
      </ScrollView>
    </Theme>
  );
};

export default DetalhesDoProduto;
