import React, { useEffect, useState } from "react";
import CardCarrinho from "@/components/CardCarrinho";
import Menu from "@/components/Menu";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import { useNavigation } from "expo-router";
import { TopProvider } from "@/context/TopContext";
import { ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useMenuContext } from "@/context/MenuProvider";
import { ModalParcialGeral } from "@/components/Menu/ModalPesquisa/ModalParcialGeral";
import ModalLojas from "@/components/Menu/ModalLojas";

interface RouteParams {
  cpfCnpj?: string;
}

const Carrinho: React.FC = () => {
  const [modalLojasVisible, setModalLojasVisible] = useState(false);
  const [refreshKeyLojas, setRefreshKeyLojas] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params as RouteParams;
  const cpfCnpj = params?.cpfCnpj;

  const { modalParcialVisible, setModalParcialVisible } = useMenuContext();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <Theme>
      <TopProvider>
        <Top />
      </TopProvider>
      <ScrollView style={{ width: "96%" }}>
        <Menu
          cpfCnpj={cpfCnpj}
          showMenu={true}
          onAbrirModalLojas={() => setModalLojasVisible(true)}
        />
        <CardCarrinho refreshKeyLojas={refreshKeyLojas} />
      </ScrollView>
      {modalParcialVisible && (
        <ModalParcialGeral
          visible={modalParcialVisible}
          onClose={() => setModalParcialVisible(false)}
          cnpjCliente={cpfCnpj}
        />
      )}
      {modalLojasVisible && (
        <ModalLojas
          visible={modalLojasVisible}
          onClose={() => setModalLojasVisible(false)}
          cnpjCliente={cpfCnpj}
          setRefreshKeyLojas={setRefreshKeyLojas}
        />
      )}
    </Theme>
  );
};

export default Carrinho;
