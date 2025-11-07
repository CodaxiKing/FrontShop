import React, { useContext, useState, useEffect } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ModalContainer,
  ModalTitle,
  ModalSubtitle,
  Label,
  Button,
  ButtonText,
  CardSection,
  FlexRow,
  RadioContainer,
  RadioLabel,
  RadioButton,
  ModalContent,
  ContainerTitle,
  ContainerBody,
  FlexColumn,
  CheckBoxSection,
  ButtonContainer,
  RemoveButton,
  ContainerCondicaoPagamento,
  ContainerValorSubtitle,
  ContainerValorPedido,
  ContainerValor,
  TitleValor,
  AmoutValor,
} from "./style.modal.credit";
import InputFieldComponent from "@/components/InputFieldComponent";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useNavigation } from "expo-router";
import ModalSuccess from "./ModalSuccess";

import { NavigationProp, useRoute } from "@react-navigation/native";

import * as SQLite from "expo-sqlite";
import { RootStackParamList } from "@/types/types";
import AuthContext from "@/context/AuthContext";
import { TextInputMask } from "react-native-masked-text";
import styled from "styled-components/native";
import SelectFieldComponent from "@/components/SelectFieldComponent";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";
import { formatCurrency } from "@/helpers";
import { calcularValorTotalProdutosFlat } from "@/helpers/calcularValorTotalProdutos";

interface RouteParams {
  pedidoId: number | string;
  clienteId: number | string;
  cpfCnpj: number | string;
}

interface CreditCardModalEditarPedidoAbertoProps {
  visible: boolean;
  onClose: () => void;
  freteByClient: string | number;
}

const CreditCardModalEditarPedidoAberto: React.FC<
  CreditCardModalEditarPedidoAbertoProps
> = ({ visible, onClose, freteByClient }) => {
  const [cards, setCards] = useState([
    { id: 1, bandeira: "", valor: "", parcela: "" },
  ]);
  const [selectedRadio, setSelectedRadio] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoInternoValue, setPedidoInternoValue] = useState("");
  // const [freteValue, setFreteValue] = useState(freteByClient);
  const [dadosComplementaresValue, setDadosComplementaresValue] = useState("");
  const [produtosJson, setProdutosJson] = useState<string>("");
  const [valorTotalCalculado, setValorTotalCalculado] = useState<number>(0);
  const [valorDistribuidoCorretamente, setValorDistribuidoCorretamente] =
    useState(true);
  // Estado para o valor bruto (sem formatação)
  const [valor, setValor] = useState<string>(0); // valor bruto
  const [freteCalculado, setFreteCalculado] = useState<number>(0);
  const [valorTotaldoPedidoComFrete, setValorTotaldoPedidoComFrete] =
    useState<number>(0);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId, cpfCnpj } = (route.params as RouteParams) || {};

  const { carrinho, setCarrinho } = useEditarPedidoAberto();

  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const loadPedido = async () => {
      if (!carrinho || carrinho.length === 0) return;

      // Calcula o valor total do carrinho
      const totalCarrinho = calcularValorTotalProdutosFlat(carrinho);

      setValorTotalCalculado(totalCarrinho);

      // Calcula o frete baseado no percentual fornecido
      const frete = (Number(totalCarrinho) * Number(freteByClient)) / 100;
      setFreteCalculado(frete);

      // Define o valor total do pedido com o frete
      setValorTotaldoPedidoComFrete(totalCarrinho + frete);

      // Inicializa o primeiro cartão com o valor total do pedido com frete
      const valorDoPedidoComFrete = totalCarrinho + frete;
      const valorCartaoFormatado =
        "R$ " + valorDoPedidoComFrete.toFixed(2).replace(".", ",");

      setCards([
        {
          id: 1,
          bandeira: "",
          valor: valorCartaoFormatado,
          parcela: `12 x R$ ${(valorDoPedidoComFrete / 12)
            .toFixed(2)
            .replace(".", ",")}`,
        },
      ]);
    };

    loadPedido();
  }, []);

  const handleSaveCart = async () => {
    if (cards.some((card) => !card.bandeira || !card.valor || !card.parcela)) {
      Alert.alert("Erro", "Preencha todos os campos de cada cartão.");
      return;
    }

    if (!carrinho || carrinho.length === 0) {
      console.warn("Carrinho está vazio ou não carregado.");
      return [];
    }
    const pedidoBase = carrinho;

    if (
      !pedidoBase ||
      pedidoBase.length === 0 ||
      typeof pedidoBase[0] !== "object"
    ) {
      console.error("Erro: pedidoBase inválido ou vazio.");
      return;
    }

    // validação caso o valor total do pedido com frete seja diferente do valor distribuído entre os cartões
    const totalDistribuido = cards.reduce(
      (acc, card) =>
        acc +
        parseFloat(
          card.valor
            .replace("R$", "")
            .replace(/\./g, "") // remove ponto de milhar
            .replace(",", ".")
            .trim()
        ),
      0
    );

    const totalDistribuidoArredondado = parseFloat(totalDistribuido.toFixed(2));
    const totalEsperadoArredondado = parseFloat(
      valorTotaldoPedidoComFrete.toFixed(2)
    );

    if (totalDistribuidoArredondado !== totalEsperadoArredondado) {
      Alert.alert(
        "Erro",
        "O valor distribuído entre os cartões não corresponde ao total do pedido."
      );
      return;
    }

    try {
      const meiosPagamento = JSON.stringify(
        cards.map((card) => ({
          tipoPagamento: 1,
          formaPagamento: "",
          pixComprovanteTransacao: "",
          quantidadeDuplicata: 0,
          diasPrimeiroVencimento: 0,
          local: "",
          cartaoBandeira: card.bandeira,
          cartaoParcela: parseInt(card.parcela, 10),
          cartaoValor: parseFloat(
            card.valor.replace("R$", "").replace(/\s/g, "").replace(",", ".")
          ),
          // cartaoValor: parseFloat(card.valor.replace(",", ".")),
          pedidoContaEOrdem: selectedRadio,
          informacaoComplementar: dadosComplementaresValue,
          percentualDeFrete: parseFloat(freteByClient.toString()) || 0,
          pedidoInterno: pedidoInternoValue,
          freteDoPedido: freteCalculado,
        }))
      );

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
      console.error("Erro ao finalizar pedidos por Cartão de Crédito:", error);
    } finally {
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.goBack();

        removeCard();
        onClose();
      }, 2000);
    }
  };

  const addCard = () => {
    // Calcula o total já distribuído nos cartões existentes

    const valorJaDistribuidoEntreCartoes = cards.reduce((total, card) => {
      return (
        total +
        (parseFloat(
          card.valor.replace("R$", "").replace(/\s/g, "").replace(",", ".")
        ) || 0)
      );
    }, 0);

    // Calcula o valor restante a ser pago
    const valorRestante = parseFloat(
      (valorTotaldoPedidoComFrete - valorJaDistribuidoEntreCartoes).toFixed(2)
    );

    const valorFormatado = valorRestante.toFixed(2).replace(".", ",");
    const parcelaInicial = gerarParcelasDisponiveis(valorRestante)[0].value;

    if (valorRestante <= 0) {
      Alert.alert("Erro", "Não há valor restante para adicionar outro cartão.");
      return;
    }

    // Adiciona um novo cartão com o valor restante
    setCards((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        bandeira: "",
        valor: `R$ ${valorFormatado}`,
        parcela: parcelaInicial,
      },
    ]);
  };

  const updateCard = (
    index: number,
    field: keyof (typeof cards)[0],
    value: string | number
  ) => {
    const updatedCards = [...cards];

    if (field === "valor") {
      const novoValor =
        parseFloat(
          value.replace("R$", "").replace(/\s/g, "").replace(",", ".")
        ) || 0;
      updatedCards[index].valor =
        "R$ " + novoValor.toFixed(2).replace(".", ",");

      // Atualiza as parcelas disponíveis para esse cartão
      updatedCards[index].parcela = `12 x R$ ${(novoValor / 12)
        .toFixed(2)
        .replace(".", ",")}`;
    } else {
      updatedCards[index] = {
        ...updatedCards[index],
        [field]: value,
      };
    }

    // Recalcula o valor total dos cartões
    const somaTotal = updatedCards.reduce((total, card) => {
      return (
        total +
        (parseFloat(
          card.valor.replace("R$", "").replace(/\s/g, "").replace(",", ".")
        ) || 0)
      );
    }, 0);

    // Se o total for menor que o valor total do pedido, avisa o usuário
    setValorDistribuidoCorretamente(somaTotal === valorTotalCalculado);

    setCards(updatedCards);
  };

  const removeCard = () => {
    setCards([{ id: 1, bandeira: "", valor: "", parcela: "" }]);
  };

  const removeLastCard = () => {
    if (cards.length > 1) {
      const cartaoRemovido = cards[cards.length - 1];

      // Obtém o valor do cartão removido
      const valorRemovido =
        parseFloat(
          cartaoRemovido.valor
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(",", ".")
        ) || 0;

      // Remove o último cartão
      const cartoesRestantes = cards.slice(0, -1);

      if (cartoesRestantes.length === 1) {
        // Se sobrar apenas um cartão, ele assume o valor total da compra
        cartoesRestantes[0].valor =
          "R$ " + valorTotaldoPedidoComFrete.toFixed(2).replace(".", ",");
        cartoesRestantes[0].parcela = `12 x R$ ${(
          valorTotaldoPedidoComFrete / 12
        )
          .toFixed(2)
          .replace(".", ",")}`;
      } else {
        // Se houver mais de um cartão, o último cartão da lista recebe o valor do removido
        const ultimoCartao = cartoesRestantes[cartoesRestantes.length - 1];

        // Obtém o valor do último cartão antes da redistribuição
        const valorUltimoCartao =
          parseFloat(
            ultimoCartao.valor
              .replace("R$", "")
              .replace(/\s/g, "")
              .replace(",", ".")
          ) || 0;

        // Define o novo valor para o último cartão, garantindo que não ultrapasse o total
        const novoValorUltimoCartao = Math.min(
          valorUltimoCartao + valorRemovido,
          valorTotaldoPedidoComFrete
        );

        ultimoCartao.valor =
          "R$ " + novoValorUltimoCartao.toFixed(2).replace(".", ",");
        ultimoCartao.parcela = `12 x R$ ${(novoValorUltimoCartao / 12)
          .toFixed(2)
          .replace(".", ",")}`;
      }

      setCards(cartoesRestantes);
    }
  };

  const handleChange = (text: string, index: number) => {
    // Remove todos os caracteres não numéricos para obter o valor bruto
    const valorLimpo = text.replace(/[^\d]/g, "");

    // Se o valor estiver vazio, não fazemos nada
    if (!valorLimpo) return;

    // Converte para um número em centavos
    const novoValorEmCentavos = parseInt(valorLimpo, 10);

    // Atualiza o valor no estado com a formatação correta
    const valorFormatado =
      "R$ " + (novoValorEmCentavos / 100).toFixed(2).replace(".", ",");

    // Atualiza o valor do cartão no estado
    updateCard(index, "valor", valorFormatado);

    // Atualiza o valor no estado de forma que o valor formatado seja exibido
    setValor(valorFormatado);

    // Atualiza a parcela (dividindo o valor por 12 para simular o parcelamento)
    const valorParcela = novoValorEmCentavos / 12 / 100;
    const parcelaFormatada = `12 x R$ ${valorParcela
      .toFixed(2)
      .replace(".", ",")}`;

    // Atualiza a parcela do cartão
    updateCard(index, "parcela", parcelaFormatada);
  };

  const gerarParcelasDisponiveis = (valor: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const parcelas = i + 1;
      return {
        label: `${parcelas} x R$ ${(valor / parcelas)
          .toFixed(2)
          .replace(".", ",")}`,
        value: `${parcelas} x R$ ${(valor / parcelas)
          .toFixed(2)
          .replace(".", ",")}`,
      };
    });
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <ModalContainer>
          <ModalContent>
            <ScrollView>
              {/* Título */}
              <ContainerTitle>
                <ModalTitle>
                  Opção de Pagamento Selecionada: Cartão de Crédito
                </ModalTitle>
              </ContainerTitle>

              {/* Informações adicionais */}
              <ContainerBody>
                <CardSection>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: -30,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        flex: 1,
                        marginRight: 20,
                      }}
                    >
                      <InputFieldComponent
                        disabled
                        label="% Frete"
                        placeholder="Digite o percentual de frete"
                        value={freteByClient + ` %`}
                        keyboardType="numeric"
                      />

                      <InputFieldComponent
                        label="Pedido Interno"
                        placeholder="Digite o pedido interno"
                        value={pedidoInternoValue}
                        onChangeText={setPedidoInternoValue}
                      />

                      <View>
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
                              onPress={() => setSelectedRadio(true)}
                            >
                              <RadioButton selected={selectedRadio === false} />
                              <RadioLabel>Não</RadioLabel>
                            </TouchableOpacity>
                          </RadioContainer>
                        </CheckBoxSection>
                      </View>
                    </View>

                    {/* Coluna 2: Condição de Pagamento */}
                    <View
                      style={{
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <ContainerCondicaoPagamento>
                        <ContainerValorSubtitle>
                          Total do Pedido
                        </ContainerValorSubtitle>

                        <ContainerValorPedido>
                          <ContainerValor>
                            <TitleValor>Valor Pedido</TitleValor>
                            <AmoutValor>
                              {formatCurrency(valorTotalCalculado)}
                            </AmoutValor>
                          </ContainerValor>
                          <ContainerValor>
                            <TitleValor>Frete</TitleValor>
                            <AmoutValor>
                              {formatCurrency(freteCalculado)}
                            </AmoutValor>
                          </ContainerValor>
                          <ContainerValor>
                            <TitleValor>Valor Total Pedido</TitleValor>
                            <AmoutValor>
                              {formatCurrency(
                                valorTotalCalculado + freteCalculado
                              )}
                            </AmoutValor>
                          </ContainerValor>
                        </ContainerValorPedido>
                      </ContainerCondicaoPagamento>

                      <View style={{ marginTop: 40 }}>
                        <InputFieldComponent
                          label="Dados Complementares"
                          placeholder="(máx 500 caracteres)"
                          value={dadosComplementaresValue}
                          onChangeText={setDadosComplementaresValue}
                          height="100px"
                        />
                      </View>
                    </View>
                  </View>
                </CardSection>
              </ContainerBody>

              {/* Condição de Pagamento */}
              <ContainerBody>
                <ModalSubtitle>Condição de Pagamento</ModalSubtitle>

                <FlexColumn>
                  <CardSection>
                    {/* <FlexRow> */}
                    {cards.map((card, index) => (
                      <FlexRow
                        key={card.id}
                        style={{ width: "100%", alignItems: "center" }}
                      >
                        {/* Coluna Label */}
                        <View
                          style={{
                            width: 20,
                            alignItems: "center",
                          }}
                        >
                          <Label
                            style={{
                              fontSize: 14,
                              fontWeight: "bold",
                            }}
                          >
                            #{index + 1}
                          </Label>
                        </View>

                        {/* "Coluna" 1: Label + Input Bandeira */}
                        <View style={{ flex: 1 }}>
                          <InputFieldComponent
                            label="Bandeira"
                            placeholder=""
                            value={card.bandeira}
                            onChangeText={(text) =>
                              updateCard(index, "bandeira", text)
                            }
                          />
                        </View>

                        {/* "Coluna" 2: Input Valor */}
                        <View style={{ flex: 1, marginBottom: 15 }}>
                          <Text style={{ marginBottom: 5 }}>Valor</Text>
                          <TextInputMask
                            type={"money"}
                            value={card.valor}
                            onChangeText={(text) => handleChange(text, index)}
                            placeholder="R$ 0,00"
                            style={{
                              height: 50,
                              padding: 10,
                              borderWidth: 1,
                              borderColor: "#ddd",
                              borderRadius: 8,
                              backgroundColor: "#fff",
                            }}
                          />
                        </View>

                        {/* "Coluna" 3: Input Parcela */}
                        <View style={{ flex: 1 }}>
                          <SelectFieldComponent
                            label="Parcelas"
                            selectedValue={card.parcela}
                            onValueChange={(itemValue) =>
                              updateCard(index, "parcela", itemValue.toString())
                            }
                            options={gerarParcelasDisponiveis(
                              parseFloat(
                                card.valor
                                  .replace("R$", "")
                                  .replace(/\s/g, "")
                                  .replace(",", ".")
                              ) || 0
                            )}
                            height="50px"
                            margin="-2px"
                          />
                        </View>
                      </FlexRow>
                    ))}
                    {/* </FlexRow> */}
                  </CardSection>
                </FlexColumn>

                <TouchableOpacity onPress={addCard}>
                  <Button>
                    <ButtonText>Adicionar Outro Cartão</ButtonText>
                  </Button>
                </TouchableOpacity>

                {/* Só mostra o botão de remover se houver mais de um cartão */}
                {cards.length > 1 && (
                  <TouchableOpacity onPress={removeLastCard}>
                    <RemoveButton>
                      <ButtonText>Remover Último Cartão</ButtonText>
                    </RemoveButton>
                  </TouchableOpacity>
                )}
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
                  onPress={handleSaveCart}
                />
              </ButtonContainer>
            </ScrollView>
          </ModalContent>
        </ModalContainer>
      </Modal>
      {modalVisible && (
        <ModalSuccess
          visible={modalVisible}
          text="Pedido Cartão Realizado com Sucesso"
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default CreditCardModalEditarPedidoAberto;
