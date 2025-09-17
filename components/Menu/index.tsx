import React, { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ModalParcialGeral } from "./ModalPesquisa/ModalParcialGeral";
import ModalLojas from "./ModalLojas";
import {
  ContainerMenu,
  ContentMenu,
  ContentStatus,
  ContentLogo,
  UserLogo,
  ContentText,
  NameProfile,
  StatusConect,
  ContentTextMenu,
  TextMenuMiddle,
  ContentActions,
  ButtonActions,
} from "./style";
// import avatar from "../../assets/images/avatar.png";
import { useMenuContext } from "../../context/MenuProvider";
import AuthContext from "@/context/AuthContext";
import * as SQLite from "expo-sqlite";
import { CONFIGS } from "@/constants/Configs";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";

const db = SQLite.openDatabaseSync("user_data.db");

interface TopPops {
  showMenu?: boolean;
  cpfCnpj?: string;
  onAbrirModalLojas?: () => void;
}

type TopRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

const Menu: React.FC<TopPops> = ({
  showMenu = true,
  cpfCnpj,
  onAbrirModalLojas,
}) => {
  const { userData } = useContext(AuthContext);
  const email = userData?.email;
  const [nomeRepresentante, setNomeRepresentante] = useState("Carregando...");

  const route = useRoute<TopRouteProp>();
  const isEditarPedidoAbertoRoute = route.name === "EditarPedidoAberto";

  const routeLabels: Record<string, string> = {
    EditarPedidoAberto: "Editar Pedido em Aberto",
    PedidosEmAberto: "Pedidos em Aberto",

    // Adicionar outras rotas aqui conforme necessário
  };

  const currentRouteLabel = routeLabels[route.name] || "Carrinho";

  useEffect(() => {
    const fetchRepresentante = async () => {
      if (!email) {
        setNomeRepresentante("Email não encontrado");
        return;
      }

      try {
        const query = `SELECT nome FROM Representante WHERE UPPER(Email) = UPPER(?)`;
        const nameResult: { nome: string }[] = await db.getAllAsync(query, [
          email,
        ]);

        if (nameResult[0]?.nome) {
          setNomeRepresentante(nameResult[0].nome); // Define apenas o valor do nome
        } else {
          setNomeRepresentante("Representante não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar representante no banco de dados:", error);
        setNomeRepresentante("Erro ao carregar representante");
      }
    };

    fetchRepresentante();
  }, [email]);

  const { setModalParcialVisible } = useMenuContext();

  return (
    <ContainerMenu>
      <ContentMenu>
        <ContentStatus>
          <ContentLogo>
            <UserLogo
              source={require("../../assets/images/avatar/avatar.png")}
            />
          </ContentLogo>
          <ContentText>
            <NameProfile>{nomeRepresentante}</NameProfile>
            <StatusConect>
              Sincronizado em: {CONFIGS.AMBIENTE_SINCRONIZACAO}
            </StatusConect>
          </ContentText>
        </ContentStatus>
        {showMenu && (
          <ContentTextMenu>
            <TextMenuMiddle>{currentRouteLabel}</TextMenuMiddle>
          </ContentTextMenu>
        )}
        {isEditarPedidoAbertoRoute ? (
          <ContentActions></ContentActions>
        ) : (
          showMenu && (
            <ContentActions>
              <ButtonActions onPress={onAbrirModalLojas}>
                <Text>Lojas</Text>
                <FontAwesome5 name="store" size={24} color="black" />
              </ButtonActions>
              <ButtonActions onPress={() => setModalParcialVisible(true)}>
                <Text>Parcial</Text>
                <FontAwesome5 name="search" size={24} color="black" />
              </ButtonActions>
            </ContentActions>
          )
        )}
      </ContentMenu>
    </ContainerMenu>
  );
};

export default React.memo(Menu);
// export default Menu;
