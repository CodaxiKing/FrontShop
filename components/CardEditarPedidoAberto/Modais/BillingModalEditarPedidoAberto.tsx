import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ModalContainer,
  ModalTitle,
  Label,
  CardSection,
  FlexRow,
  ButtonContainer,
  CheckBoxSection,
  ContainerBody,
  ContainerTitle,
  ModalContent,
  RadioButton,
  RadioContainer,
  RadioLabel,
} from "./style.modal.billing";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import InputFieldComponent from "@/components/InputFieldComponent";
import { useNavigation } from "expo-router";
import ModalSuccess from "./ModalSuccess";
import { NavigationProp, useRoute } from "@react-navigation/native";

import { RootStackParamList } from "@/types/types";

import SelectFieldDropdown from "@/components/SelectFieldDropdown";

import * as SQLite from "expo-sqlite";
import { FormaDePagamentoProps } from "../EditarPagamentoPedidoAbertoCard";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";
import { calcularValorTotalProdutosFlat } from "@/helpers/calcularValorTotalProdutos";
const db = SQLite.openDatabaseSync("user_data.db");

interface BillingModalEditarPedidoAbertoProps {
  visible: boolean;
  onClose: () => void;
  freteByClient: string | number;
  formaDePagamento?: FormaDePagamentoProps[];
}

const LocalEventoOptions = [
  // { label: "Selecione uma opção", value: "" },
  { label: "Campo", value: "Campo" },
  { label: "Feira", value: "Feira" },
  { label: "Vendedor Remoto", value: "Vendedor Remoto" },
  { label: "Evento Pré-Venda", value: "Evento Pré-Venda" },
  { label: "Outros", value: "Outros" },
];

const duplicatasOptions = [
  { label: "Selecione uma opção", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
];

const BillingModalEditarPedidoAberto: React.FC<
  BillingModalEditarPedidoAbertoProps
> = ({ visible, onClose, freteByClient, formaDePagamento }) => {
  const [selectedRadio, setSelectedRadio] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoInternoValue, setPedidoInternoValue] = useState("");
  const [dadosComplementaresValue, setDadosComplementaresValue] = useState("");

  const [localEventoSelecionado, setLocalEventoSelecionado] = useState(
    LocalEventoOptions[0]?.value || ""
  );
  const [formaPagamentoSelecionado, setFormaPagamentoSelecionado] =
    useState<string>("");
  const [duplicatasSelecionado, setDuplicatasSelecionado] = useState(0);
  const [diasVencimentoSelecionado, setDiasVencimentoSelecionado] = useState();

  // #TODO: Implementar desconto futuramente
  const [porcentagemDesconto, setPorcentagemDesconto] = useState("");
  const [freteCalculado, setFreteCalculado] = useState(0);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId, cpfCnpj } = route.params as any;

  const { carrinho, setCarrinho } = useEditarPedidoAberto();

  useEffect(() => {
    const loadPedido = async () => {
      if (!carrinho || carrinho.length === 0) return;

      // Calcula o valor total do carrinho
      const totalCarrinho = calcularValorTotalProdutosFlat(carrinho);

      // Calcula o frete baseado no percentual fornecido
      const frete = (Number(totalCarrinho) * Number(freteByClient)) / 100;
      setFreteCalculado(frete);
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
          tipoPagamento: 2,
          formaPagamento: formaPagamentoSelecionado || "",
          pixComprovanteTransacao: "",
          quantidadeDuplicata: duplicatasSelecionado,
          diasPrimeiroVencimento: diasVencimentoSelecionado,
          local: localEventoSelecionado,
          cartaoBandeira: "",
          cartaoParcelas: 0,
          cartaoValor: 0,
          pedidoContaEOrdem: selectedRadio,
          informacaoComplementar: dadosComplementaresValue,
          percentualDeFrete: parseFloat(freteByClient.toString()) || 0,
          pedidoInterno: pedidoInternoValue,
          freteDoPedido: freteCalculado,
        },
      ]);

      setCarrinho((prevCarrinho) =>
        prevCarrinho.map((item, index) => {
          if (index === 0) {
            return {
              ...item,
              meiosPagamento,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Erro ao finalizar pedidos por Faturamento:", error);
    } finally {
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.goBack();

        onClose();
      }, 2000);
    }
  };

  const formaPagamentoOptions = Array.isArray(formaDePagamento)
    ? formaDePagamento
        .sort((a, b) => a.descricao.localeCompare(b.descricao))
        .map((item) => ({
          label: item.descricao,
          value: item.codigo,
        }))
    : [];

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <ModalContainer>
          <ModalContent>
            <ScrollView>
              {/* Título */}
              <ContainerTitle>
                <ModalTitle>
                  Opção de Pagamento Selecionada: Faturamento
                </ModalTitle>
              </ContainerTitle>

              {/* Informações adicionais */}
              <ContainerBody>
                <CardSection>
                  <FlexRow>
                    <InputFieldComponent
                      disabled
                      label="% Frete"
                      placeholder="Digite o percentual de frete"
                      value={freteByClient + `%`}
                      keyboardType="numeric"
                    />
                    <InputFieldComponent
                      label="Pedido Interno"
                      placeholder="Digite o pedido interno"
                      value={pedidoInternoValue}
                      onChangeText={setPedidoInternoValue}
                    />
                  </FlexRow>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 20 }}>
                      <SelectFieldDropdown
                        label="Forma de Pagamento"
                        selectedValue={formaPagamentoSelecionado}
                        onValueChange={(itemValue) =>
                          setFormaPagamentoSelecionado(String(itemValue ?? ""))
                        }
                        options={formaPagamentoOptions}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SelectFieldDropdown
                        label="Local Evento"
                        selectedValue={localEventoSelecionado}
                        onValueChange={(itemValue) =>
                          setLocalEventoSelecionado(String(itemValue))
                        }
                        options={LocalEventoOptions}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 20 }}>
                      <SelectFieldDropdown
                        label="Duplicatas"
                        selectedValue={duplicatasSelecionado}
                        onValueChange={(itemValue) =>
                          setDuplicatasSelecionado(Number(itemValue))
                        }
                        options={duplicatasOptions}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InputFieldComponent
                        label="Dias 1º Vencimento"
                        placeholder="Digite um número de 1 a 200"
                        value={diasVencimentoSelecionado}
                        onChangeText={(text) => {
                          const regex = /^(1[0-9]{0,2}|[1-9][0-9]{0,1}|[1-9])$/;
                          if (regex.test(text)) {
                            setDiasVencimentoSelecionado(Number(text));
                          }
                        }}
                        validateRange={true} // Ativa a validação de intervalo
                      />
                    </View>
                  </View>

                  <FlexRow style={{ width: "100%" }}>
                    <InputFieldComponent
                      label="Dados Complementares"
                      placeholder="(máx 500 caracteres)"
                      value={dadosComplementaresValue}
                      onChangeText={setDadosComplementaresValue}
                      height="60px"
                    />
                  </FlexRow>
                  <FlexRow
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <CheckBoxSection>
                      <Label>Pedido Conta e Ordem?</Label>
                      <RadioContainer>
                        <TouchableOpacity
                          onPress={() => setSelectedRadio(true)}
                        >
                          <RadioButton selected={selectedRadio === true} />
                          <RadioLabel>Sim</RadioLabel>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setSelectedRadio(false)}
                        >
                          <RadioButton selected={selectedRadio === false} />
                          <RadioLabel>Não</RadioLabel>
                        </TouchableOpacity>
                      </RadioContainer>
                    </CheckBoxSection>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Label>(%)</Label>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          borderRadius: 10,
                          padding: 5,
                          width: 100,
                          height: 50,
                          textAlign: "center",
                        }}
                        value={porcentagemDesconto.toString()}
                        onChangeText={(text) => {
                          const regex = /^\d{0,2}(\.\d{0,2})?$/;
                          if (regex.test(text)) {
                            setPorcentagemDesconto(text);
                          }
                        }}
                        keyboardType="decimal-pad"
                        maxLength={5}
                      />
                    </View>
                  </FlexRow>
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
                    if (
                      !formaPagamentoSelecionado ||
                      formaPagamentoSelecionado === ""
                    ) {
                      Alert.alert(
                        "Erro",
                        "Por favor, selecione uma forma de pagamento válida."
                      );
                      return;
                    }
                    if (
                      !localEventoSelecionado ||
                      localEventoSelecionado === ""
                    ) {
                      Alert.alert(
                        "Erro",
                        "Por favor, selecione um local de evento válido."
                      );
                      return;
                    }
                    if (!duplicatasSelecionado || duplicatasSelecionado === 0) {
                      Alert.alert(
                        "Erro",
                        "Por favor, selecione uma quantidade de duplicatas válida."
                      );
                      return;
                    }
                    if (
                      !diasVencimentoSelecionado ||
                      diasVencimentoSelecionado === 0
                    ) {
                      Alert.alert(
                        "Erro",
                        "Por favor, selecione uma quantidade de dias de vencimento válida."
                      );
                      return;
                    }
                    handleSaveCart();
                  }}
                />
              </ButtonContainer>
            </ScrollView>
          </ModalContent>
        </ModalContainer>
      </Modal>

      {modalVisible && (
        <ModalSuccess
          visible={modalVisible}
          text="Pedido Faturamento Realizado com Sucesso"
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default BillingModalEditarPedidoAberto;
