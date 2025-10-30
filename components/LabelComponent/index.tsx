import React, { useContext, useEffect, useState } from "react";
// import avatar from "../../assets/images/avatar.png";

import {
  ContainerMenu,
  ContentLogo,
  ContentStatus,
  ContentText,
  LabelText,
  NameProfile,
  StatusConect,
  UserLogo,
} from "./style";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AuthContext from "@/context/AuthContext";
import * as SQLite from "expo-sqlite";
import { Text, TouchableOpacity, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import BonificacaoModal from "../CardCarrinho/Modais/BonificacaoModal";
import { CONFIGS } from "@/constants/Configs";

const db = SQLite.openDatabaseSync("user_data.db");

type TopNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TopRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

interface LabelProps {
  labelText?: string;
  labelTextPrefix?: boolean;
  bandejaText?: string;
  editarPedido?: boolean;  
}

export const LabelComponent: React.FC<LabelProps> = ({  
  labelText,
  labelTextPrefix = false,
  bandejaText,
  editarPedido = false,  
}) => {
  const route = useRoute<TopRouteProp>();

  const [bonificacaoModalVisible, setBonificacaoModalVisible] = useState(false);

  const { userData } = useContext(AuthContext);
  const email = userData?.email;
  const [nomeRepresentante, setNomeRepresentante] = useState<
    string | undefined
  >(undefined);

  const isPagamento = route.name === "Pagamento";

  useEffect(() => {
    const fetchRepresentante = async () => {
      if (!email) {
        setNomeRepresentante("Email não encontrado");
        return;
      }

      // console.log("EMAIL LABEL COMPONENT", email);

      try {
        if (email === "undefined" || email === null || email === "") {
          setNomeRepresentante("Email não encontrado");
          return;
        }
        email.toUpperCase();
        const query = `SELECT nome FROM Representante WHERE UPPER(Email) = UPPER(?)`;
        const nameResult: { nome: string }[] = await db.getAllAsync(query, [
          email,
        ]);
        // console.log("NOME LABEL COMPONENT", nameResult[0]?.nome);

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

  return (
    <ContainerMenu>
      <ContentStatus>
        <ContentLogo>
          <UserLogo source={require("../../assets/images/avatar/avatar.png")} />
        </ContentLogo>
        <ContentText>
          <NameProfile>{nomeRepresentante || "Carregando..."}</NameProfile>
          <StatusConect>
            Ambiente: {CONFIGS.AMBIENTE_SINCRONIZACAO}             
          </StatusConect>
          <StatusConect>            
            Version: {CONFIGS.APP_VERSION}
          </StatusConect>
          {/* <StatusConect>Sincronizado em: Ambiente Dev</StatusConect> */}
        </ContentText>
      </ContentStatus>
      {!isPagamento && labelText && (
        <LabelText>
          <Text style={{ fontWeight: 400 }}>
            {labelTextPrefix ? editarPedido  ? `Alterando Pedido de: \n` : `Novo Pedido Para: \n` : " "}{" "} 
          </Text>
          {labelText}
        </LabelText>
      )}
      {bandejaText && (
        <LabelText>
          <Text style={{ fontWeight: 400 }}>Bandeja: {`\n`} </Text>
          {bandejaText}
        </LabelText>
      )}
      {isPagamento && (
        <TouchableOpacity onPress={() => setBonificacaoModalVisible(true)}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              flexDirection: "row",
              marginRight: 20,
            }}
          >
            <Text>Carrinho</Text>
            <View>
              <MaterialIcons name="shopping-basket" size={22} color="black" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {bonificacaoModalVisible && (
        <BonificacaoModal
          visible={bonificacaoModalVisible}
          onClose={() => setBonificacaoModalVisible(false)}
        />
      )}
    </ContainerMenu>
  );
};
