import React, { useContext, useEffect, useState } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity, View } from "react-native";
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
} from "./style.modal.bonificacao";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import InputFieldComponent from "@/components/InputFieldComponent";
import { useNavigation } from "expo-router";
import ModalSuccess from "./ModalSuccess";
import { NavigationProp, useRoute } from "@react-navigation/native";

import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { RootStackParamList } from "@/types/types";

import SelectFieldDropdown from "@/components/SelectFieldDropdown";
import { formatCorrectLocalTime } from "@/helpers/formatCorrectLocalTime";
import AuthContext from "@/context/AuthContext";
import { getBrazilianTimestamp } from "@/helpers/getBrazilianTimestanp";
const db = SQLite.openDatabaseSync("user_data.db");

interface BonificacaoModalProps {
  visible: boolean;
  onClose: () => void;
}

const motivoPorBonificacao: Record<string, string[]> = {
  "Sell Out": [
    "Campanha de Vendas com Consumidor Final",
    "Incentivo a Balconista",
    "Markdown - Demarcação de Preço",
  ],
  "Sell In": ["Termo e Condição Lojista"],
  Qualidade: ["Defeito de Fabricação"],
  "Falta de Peças": ["Pedido Recebido com Falta de Peças"],
  AST: ["AST - Estoque Clientes", "AST - Outros", "AST - Retorno com Defeito"],
};

const bonificacaoOptions = [
  { label: "Sell Out", value: "Sell Out" },
  { label: "Sell In", value: "Sell In" },
  { label: "Qualidade", value: "Qualidade" },
  { label: "Falta de Peças", value: "Falta de Peças" },
  { label: "AST", value: "AST" },
];

const motivoBonificacaoOptions = [
  {
    label: "Campanha de Vendas com Consumidor Final",
    value: "Campanha de Vendas com Consumidor Final",
  },
  {
    label: "Incentivo a Balconista",
    value: "Incentivo a Balconista",
  },
  {
    label: "Markdown - Demarcação de Preço",
    value: "Markdown - Demarcação de Preço",
  },
  { label: "Termo e Condição Lojista", value: "Termo e Condição Lojista" },
  { label: "Defeito de Fabricação", value: "Defeito de Fabricação" },
  {
    label: "Pedido Recebido com Falta de Peças",
    value: "Pedido Recebido com Falta de Peças",
  },
  { label: "AST - Estoque Clientes", value: "AST - Estoque Clientes" },
  { label: "AST - Outros", value: "AST - Outros" },
  { label: "AST - Retorno com Defeito", value: "AST - Retorno com Defeito" },
];

const BonificacaoModal: React.FC<BonificacaoModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedRadio, setSelectedRadio] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  // const [freteValue, setFreteValue] = useState(freteByClient);
  const [pedidoInternoValue, setPedidoInternoValue] = useState("");
  const [dadosComplementaresValue, setDadosComplementaresValue] = useState("");

  const [motivoBonificacao, setMotivoBonificacao] = useState(
    bonificacaoOptions[0].value
  );
  const [descricaoMotivoBonificacao, setDescricaoMotivoBonificacao] =
    useState("");

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId } = route?.params as { pedidoId: number };

  const { userData, setUserData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;
  const representanteCreateId = userData?.representanteCreateId;

  const dataCriacao = getBrazilianTimestamp();
  const lojasSelecionadas: string | any[] = [];

  useEffect(() => {
    if (motivoBonificacao && motivoPorBonificacao[motivoBonificacao]) {
      setDescricaoMotivoBonificacao(motivoPorBonificacao[motivoBonificacao][0]);
    } else {
      setDescricaoMotivoBonificacao(""); // limpa caso não tenha opções
    }
  }, [motivoBonificacao]);

  const handleSaveCart = async () => {
    if (!descricaoMotivoBonificacao) {
      Alert.alert(
        "Aviso",
        "Selecione uma descrição para o motivo da bonificação."
      );
      return;
    }

    try {
      const pedidoBase = await db.getAllAsync(
        `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ?;`,
        [pedidoId, representanteId]
      );

      if (pedidoBase.length === 0) {
        Alert.alert("Erro", "Pedido base não encontrado.");
        return;
      }

      if (
        !pedidoBase ||
        pedidoBase.length === 0 ||
        typeof pedidoBase[0] !== "object"
      ) {
        console.error("Erro: pedidoBase inválido ou vazio.");
        return;
      }

      const meiosPagamento = JSON.stringify([
        {
          tipoPagamento: 1,
          formaPagamento: "",
          pixComprovanteTransacao: "",
          quantidadeDuplicata: 0,
          diasPrimeiroVencimento: 0,
          local: "",
          cartaoBandeira: "",
          cartaoParcelas: 0,
          cartaoValor: 0,
          pedidoContaEOrdem: selectedRadio,
          informacaoComplementar: "",
          motivoBonificacao,
          descricaoMotivoBonificacao,
          percentualDeFrete: 0,
          pedidoInterno: pedidoInternoValue,
        },
      ]);

      const produtosLojas = pedidoBase[0]
        ? JSON.parse(pedidoBase[0].produtos)
        : [];

      const queryInsertPedido = `
      INSERT INTO Pedido (
        codigoMobile,
        razaoSocial,
        numeroPedido,
        pedidoTechnosPlus,
        pedidoInterno,
        plataforma,
        clienteId,
        cpfCnpj,
        representanteId,
        representanteCreateId,
        quantidadeItens,
        quantidadePecas,
        valorTotal,
        valorTotalComIPI,
        valorTotalDescontos,
        formaPagamento,
        diasPrimeiroVencimento,
        quantidadeDuplicata,
        informacaoComplementar,
        percentualDeFrete,
        percentualDeDesconto,
        tipoPagamento,
        local,
        dataPedidoSaldo,
        quebraPreVenda,
        dataPrevistaPA,
        tipoPedido,
        motivoBonificacao,
        descricaoMotivoBonificacao,
        enderecoEntrega,
        numeroEntrega,
        cepEntrega,
        bairroEntrega,
        complementoEntrega,
        alterarEnderecoDeEntrega,
        tipoLogradouroEntrega,
        estadoEntrega,
        municipioEntrega,
        tabelaDePrecoId,
        status,
        statusDescricao,
        ganhadores,
        pedidoSaldo,
        dataCriacao,
        produtos,
        meiosPagamento
      )
      VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

      for (const loja of produtosLojas) {
        const quantidadePecas = loja.produtos.length;
        const quantidadeTotal = loja.produtos.reduce(
          (acc: any, p: any) => acc + p.quantidade,
          0
        );
        const valorTotal = loja.produtos.reduce(
          (acc: any, p: any) => acc + p.quantidade * p.precoUnitario,
          0
        );
        let lojaSelecionadaQuery = `SELECT * FROM CarteiraCliente WHERE cpfCnpj = ?;`;
        const lojaSelecionada = await db.getAllAsync(lojaSelecionadaQuery, [
          loja.cpfCnpj,
        ]);

        await db.runAsync(queryInsertPedido, [
          `${Crypto.randomUUID()}`, // codigoMobile
          lojaSelecionada[0].razaoSocial, // razaoSocial
          "", // numeroPedido
          "", // pedidoTechnosPlus
          "", // pedidoInterno
          "App", // plataforma
          lojaSelecionada[0].clienteId, // clienteId
          loja.cpfCnpj, // cpfCnpj
          representanteId, // representanteId
          representanteCreateId, // representanteCreateId
          quantidadeTotal, // quantidadeItens
          quantidadePecas, // quantidadePecas
          valorTotal, // valorTotal
          0, // valorTotalComIPI
          0, // valorTotalDescontos
          null, // formaPagamento
          null, // diasPrimeiroVencimento
          0, // quantidadeDuplicata
          "", // informacaoComplementar
          0, // percentualDeFrete
          0, // percentualDeDesconto
          "", // tipoPagamento
          "", // local
          null, // dataPedidoSaldo
          false, // quebraPreVenda
          null, // dataPrevistaPA
          "", // tipoPedido
          motivoBonificacao, // motivoBonificacao
          descricaoMotivoBonificacao, // descricaoMotivoBonificacao
          "", // enderecoEntrega
          "", // numeroEntrega
          "", // cepEntrega
          "", // bairroEntrega
          "", // complementoEntrega
          0, // alterarEnderecoDeEntrega (boolean)
          "", // tipoLogradouroEntrega
          "", // estadoEntrega
          "", // municipioEntrega
          pedidoBase[0].tabelaDePrecoId, // tabelaDePrecoId
          1, // status
          "Em Aberto", // statusDescricao
          "", // ganhadores
          "", // pedidoSaldo
          dataCriacao, // dataCriacao
          JSON.stringify(loja.produtos), // produtos
          meiosPagamento, // meiosPagamento
        ]);
      }

      // Remove o pedido da tabela NovoPedido após transferir
    } catch (error) {
      console.error("Erro ao finalizar pedidos por bonificação:", error);
    } finally {
      const deleteQuery = `DELETE FROM NovoPedido WHERE id = ?;`;
      await db.runAsync(deleteQuery, [pedidoId]);

      if (representanteId) {
        setUserData({ ...userData, representanteCreateId: representanteId });
      }

      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate("PedidosEmAberto");
        onClose();
      }, 2000);
    }
  };

  const motivoBonificacaoOptionsFiltrados = motivoBonificacaoOptions.filter(
    (opcao) => motivoPorBonificacao[motivoBonificacao]?.includes(opcao.value)
  );

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <ModalContainer>
          <ModalContent>
            <ScrollView>
              {/* Título */}
              <ContainerTitle>
                <ModalTitle>
                  Opção de Pagamento Selecionada: Bonificação
                </ModalTitle>
              </ContainerTitle>

              {/* Informações adicionais */}
              <ContainerBody>
                <CardSection>
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <SelectFieldDropdown
                        label="Motivo Bonificação"
                        selectedValue={motivoBonificacao}
                        onValueChange={(itemValue) =>
                          setMotivoBonificacao(String(itemValue))
                        }
                        options={bonificacaoOptions}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SelectFieldDropdown
                        label="Descrição Motivo"
                        selectedValue={descricaoMotivoBonificacao}
                        onValueChange={(itemValue) =>
                          setDescricaoMotivoBonificacao(String(itemValue))
                        }
                        options={motivoBonificacaoOptionsFiltrados}
                      />
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
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
                    </View>
                  </View>
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
                    handleSaveCart();
                    // onClose();
                  }}
                />
              </ButtonContainer>
            </ScrollView>
          </ModalContent>
        </ModalContainer>
      </Modal>

      <ModalSuccess
        visible={modalVisible}
        text="Pedido Realizado com Sucesso"
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default BonificacaoModal;
