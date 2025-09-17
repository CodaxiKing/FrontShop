import React, { useEffect, useState } from "react";
import { Alert, Modal } from "react-native";
import {
  ModalContainer,
  ModalTitle,
  CardSection,
  ModalContent,
  ContainerTitle,
  ContainerBody,
  ButtonContainer,
  ContainerValorPedido,
  ContainerValor,
  TitleValor,
  AmoutValor,
} from "./style.modal.pix";
import InputFieldComponent from "@/components/InputFieldComponent";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import ModalSuccess from "./ModalSuccess";
import { useNavigation } from "expo-router";
import { NavigationProp, useRoute } from "@react-navigation/native";

import * as SQLite from "expo-sqlite";
import { RootStackParamList } from "@/types/types";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";
import { ModalSubtitle } from "./style.modal.billing";
import { formatCurrency } from "@/helpers";
import { calcularValorTotalProdutosFlat } from "@/helpers/calcularValorTotalProdutos";
const db = SQLite.openDatabaseSync("user_data.db");

interface PixModalEditarPedidoAbertoProps {
  visible: boolean;
  onClose: () => void;
  freteByClient: number;
}

interface RouteParams {
  pedidoId: number | string;
  clienteId: number | string;
  cpfCnpj: number | string;
}

const PixModalEditarPedidoAberto: React.FC<PixModalEditarPedidoAbertoProps> = ({
  visible,
  onClose,
  freteByClient,
}) => {
  const [transactionProof, setTransactionProof] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);

  const [valorTotalCalculado, setValorTotalCalculado] = useState(0);
  const [freteCalculado, setFreteCalculado] = useState(0);
  const [valorTotaldoPedidoComFrete, setValorTotaldoPedidoComFrete] =
    useState(0);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId, cpfCnpj } = (route.params as RouteParams) || {};

  const { carrinho, setCarrinho } = useEditarPedidoAberto();

  useEffect(() => {
    const loadPedido = async () => {
      if (!carrinho || carrinho.length === 0) return;

      // Calcula o valor total do carrinho
      const totalCarrinho = calcularValorTotalProdutosFlat(carrinho);

      console.log("Total Carrinho - Pix Modal Editar Pedido:", totalCarrinho);
      setValorTotalCalculado(totalCarrinho);

      // Calcula o frete baseado no percentual fornecido
      const frete = (Number(totalCarrinho) * Number(freteByClient)) / 100;
      setFreteCalculado(frete);

      // Define o valor total do pedido com o frete
      setValorTotaldoPedidoComFrete(totalCarrinho + frete);
    };

    loadPedido();
  }, []);

  const handleSaveCart = async () => {
    try {
      if (!pedidoId) {
        Alert.alert("Erro", "Pedido não encontrado.");
        return;
      }

      if (!carrinho || carrinho.length === 0) {
        Alert.alert("Erro", "Carrinho vazio ou não carregado.");
        return;
      }

      const meiosPagamento = JSON.stringify([
        {
          tipoPagamento: 1,
          formaPagamento: "",
          pixComprovanteTransacao: transactionProof,
          quantidadeDuplicata: 0,
          diasPrimeiroVencimento: 0,
          local: "",
          cartaoBandeira: "",
          cartaoParcela: 0,
          cartaoValor: 0,
          pedidoContaEOrdem: false,
          informacaoComplementar: "",
          percentualDeFrete: 0,
          percentualDeDesconto: 0,
          freteDoPedido: freteCalculado,
        },
      ]);
      console.log("Meios de Pagamento a serem salvos:", meiosPagamento);
      // setCarrinho((prevCarrinho) =>
      //   prevCarrinho.map((item, index) => {
      //     if (index === 0) {
      //       return {
      //         ...item,
      //         meiosPagamento,
      //       };
      //     }
      //     return item;
      //   })
      // );
      setCarrinho((prev) =>
        prev.map((item) => ({
          ...item,
          meiosPagamento: meiosPagamento,
        }))
      );
    } catch (error) {
      console.error("Erro ao finalizar pedidos por pix:", error);
    } finally {
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.goBack();

        onClose();
      }, 2000);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <ModalContainer>
          <ModalContent>
            {/* Título */}
            <ContainerTitle>
              <ModalTitle>
                Alterando Opção de Pagamento do Pedido para: Pix
              </ModalTitle>
            </ContainerTitle>

            {/* Informações com Valores do Pedido */}
            <ContainerBody>
              <ModalSubtitle>Total do Pedido</ModalSubtitle>
              <ContainerValorPedido>
                <ContainerValor>
                  <TitleValor>Valor Pedido</TitleValor>
                  <AmoutValor>{formatCurrency(valorTotalCalculado)}</AmoutValor>
                </ContainerValor>
                <ContainerValor>
                  <TitleValor>Frete</TitleValor>
                  <AmoutValor>{formatCurrency(freteCalculado)}</AmoutValor>
                </ContainerValor>
                <ContainerValor>
                  <TitleValor>Valor Total Pedido</TitleValor>
                  <AmoutValor>
                    {formatCurrency(valorTotaldoPedidoComFrete)}
                  </AmoutValor>
                </ContainerValor>
              </ContainerValorPedido>
            </ContainerBody>

            {/* Comprovante de Transação */}
            <ContainerBody>
              <CardSection>
                <InputFieldComponent
                  label="Comprovante de Transação"
                  placeholder="Ex: EAS78D8AW8SD6W98D76S"
                  value={transactionProof}
                  onChangeText={setTransactionProof}
                />
              </CardSection>
            </ContainerBody>

            {/* Botões */}
            <ButtonContainer>
              <ConfirmacaoModalButton
                text="Cancelar"
                variant="exit"
                onPress={onClose}
              />
              <ConfirmacaoModalButton
                text="Salvar"
                onPress={() => {
                  if (!transactionProof || transactionProof === "") {
                    Alert.alert("Erro", "Informe o comprovante de transação.");
                    return;
                  }
                  handleSaveCart();
                }}
              />
            </ButtonContainer>
          </ModalContent>
        </ModalContainer>
      </Modal>

      {modalVisible && (
        <ModalSuccess
          visible={modalVisible}
          text="Pedido Pix Realizado com Sucesso"
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default PixModalEditarPedidoAberto;
