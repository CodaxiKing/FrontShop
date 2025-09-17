import React, { useState, useContext } from "react";
import {
  ContainerActionEmpresa,
  ButtonCardEmpresa,
  TextEmpresa,
} from "./style";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import ModalEndereco from "./Modais/ModalEndereco";
import ModalExpositor from "./Modais/ModalExpositor";
import ModalParcial from "./Modais/ModalParcialEditarPedidoAberto";
import { Alert, View, ActivityIndicator, Text } from "react-native";
import * as SQLite from "expo-sqlite";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import AuthContext from "@/context/AuthContext";
import { useTopContext } from "@/context/TopContext";
import { IProdutoLoja } from "../CardProdutoCatalogo";
import { RootStackParamList } from "@/types/types";
import ModalParcialEditarPedidoAberto from "./Modais/ModalParcialEditarPedidoAberto";

const db = SQLite.openDatabaseSync("user_data.db");

export interface Endereco {
  cep: string;
  estado: string;
  municipio: string;
  bairro: string;
  endereco: string;
  numero: string;
  complemento: string;
}

export interface CarrinhoInfo {
  id?: number;
  cpfCnpj: string;
  enderecoEntrega: string;
  cepEntrega: string;
  bairroEntrega: string;
  complementoEntrega: string;
  estadoEntrega: string;
  municipioEntrega: string;
  produtosNoCarrinho?: { codigo: string }[];
  representanteId?: string;
  produtos?: string | any[];
}

interface IconesCardEditarPedidoProps {
  enderecosCliente: Endereco[];
  carrinhoInfo: CarrinhoInfo;
  setCarrinhoInfo: React.Dispatch<React.SetStateAction<any>>;
  onConfirmarExpositores?: () => Promise<void>;
  cpfCnpjSelecionado: string;
  onEnderecoAtualizado?: (endereco: Endereco) => void;
}

const IconesCardEditarPedidoAberto: React.FC<IconesCardEditarPedidoProps> = ({
  enderecosCliente,
  carrinhoInfo,
  cpfCnpjSelecionado,
  setCarrinhoInfo,
  onEnderecoAtualizado,
}) => {
  const { userData } = useContext(AuthContext);
  const { updateCarrinhosCount } = useTopContext();
  const representanteId = userData?.representanteId;

  const [modalEnderecoVisible, setModalEnderecoVisible] =
    useState<boolean>(false);
  const [modalExpositorVisible, setModalExpositorVisible] =
    useState<boolean>(false);
  const [modalParcialVisible, setModalParcialVisible] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [cep, setCep] = useState<string>("21300-00");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [carrinhos, setCarrinhos] = useState<IProdutoLoja[]>([]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleOpenEnderecoModal = () => {
    setModalEnderecoVisible(true);
  };

  const handleCloseEnderecoModal = () => {
    setModalEnderecoVisible(false);
  };

  const handleSelectCep = (value: string) => {
    setCep(value);
    setDropdownVisible(false);
  };

  const deletePedidoFromDB = async (pedidoId: number) => {
    try {
      if (!pedidoId) {
        console.error("pedidoId indefinido");
        return;
      }

      const queryDeletePedido = `DELETE FROM Pedido WHERE id = ?;`;
      await db.runAsync(queryDeletePedido, [pedidoId]);

      Alert.alert("Sucesso", "Pedido excluído com sucesso.", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("PedidosEmAberto");
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao excluir pedido do banco de dados:", error);
    }
  };

  const handleRemoveStore = () => {
    Alert.alert(
      "Confirmar remoção",
      "Você tem certeza que deseja remover esta loja e todos os seus produtos do carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);

            try {
              const pedidoId = carrinhoInfo.id;
              const repId = carrinhoInfo.representanteId || representanteId;

              if (!pedidoId || !repId) {
                throw new Error("Pedido ou Representante não identificado");
              }

              await db.runAsync(`DELETE FROM Pedido WHERE id = ?;`, [pedidoId]);

              setTimeout(() => {
                Alert.alert(
                  "Pedido removido",
                  "O pedido foi excluído com sucesso.",
                  [
                    {
                      text: "OK",
                      onPress: () => navigation.navigate("PedidosEmAberto"),
                    },
                  ]
                );
              }, 300); // Pequeno delay para feedback visual
            } catch (error) {
              console.error("Erro ao remover loja do carrinho:", error);
              Alert.alert(
                "Erro",
                "Não foi possível remover a loja do carrinho."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const updateEnderecoCliente = async (endereco: Endereco) => {
    try {
      if (onEnderecoAtualizado) {
        onEnderecoAtualizado(endereco);
      }

      // Atualiza o estado do carrinho
      setCarrinhoInfo((prev: any) => ({
        ...prev,
        enderecoEntrega: endereco.endereco,
        numeroEntrega: endereco.numero,
        cepEntrega: endereco.cep,
        bairroEntrega: endereco.bairro,
        complementoEntrega: endereco.complemento,
        estadoEntrega: endereco.estado,
        municipioEntrega: endereco.municipio,
      }));

      Alert.alert("Tudo Certo!", "Endereço atualizado com sucesso!");
      // Atualiza o estado local do endereço selecionado
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
      Alert.alert("Erro", "Não foi possível atualizar o endereço.");
    }
  };

  return (
    <>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </View>
      )}
      <ContainerActionEmpresa>
        <ButtonCardEmpresa onPress={handleOpenEnderecoModal}>
          <MaterialCommunityIcons
            name="map-marker-plus"
            size={30}
            color="black"
          />
          <TextEmpresa fontSize={14} weight={600}>
            Endereço
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => setModalExpositorVisible(true)}>
          <FontAwesome name="envelope" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Expositor
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => setModalParcialVisible(true)}>
          <FontAwesome name="search" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Parcial
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => handleRemoveStore()}>
          <FontAwesome name="trash" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Remover
          </TextEmpresa>
        </ButtonCardEmpresa>
      </ContainerActionEmpresa>

      {modalEnderecoVisible && (
        <ModalEndereco
          visible={modalEnderecoVisible}
          onClose={handleCloseEnderecoModal}
          selectedCep={cep}
          onSelectCep={handleSelectCep}
          ceps={enderecosCliente}
          onConfirmEndereco={(enderecoSelecionado) => {
            if (enderecoSelecionado) {
              updateEnderecoCliente(enderecoSelecionado);
              onEnderecoAtualizado?.(enderecoSelecionado);
            }
          }}
        />
      )}

      {/* Modal de expositores */}
      {modalExpositorVisible && (
        <ModalExpositor
          visible={modalExpositorVisible}
          onClose={() => setModalExpositorVisible(false)}
          cpfCnpj={carrinhoInfo.cpfCnpj}
          carrinhoInfo={carrinhoInfo}
          onConfirmarExpositores={() => setDeveAtualizarCarrinho(true)}
        />
      )}
      {/* Modal de parcial */}
      {modalParcialVisible && (
        <ModalParcialEditarPedidoAberto
          visible={modalParcialVisible}
          onClose={() => setModalParcialVisible(false)}
          pedidoId={carrinhoInfo.id}
          representanteId={carrinhoInfo.representanteId || representanteId}
          cpfCnpj={cpfCnpjSelecionado}
        />
      )}
    </>
  );
};

export default IconesCardEditarPedidoAberto;
