/**
 * PagamentoCard Component
 *
 * Este componente exibe as opções de forma de pagamento disponíveis para o pedido em aberto,
 * permitindo que o usuário selecione entre "Cartão de Crédito", "Faturamento" e "Pix". Além disso,
 * ele busca os dados do pedido (como valor total) e a forma de pagamento cadastrada para o cliente,
 * utilizando o SQLite para acesso local ao banco.
 *
 * Lógica de cálculo do frete (fetchFreteByCliente):
 *   1. Primeiro, o componente busca o frete associado à filial do representante, utilizando a
 *      coluna "filialRepresentanteCodigoFilialRepresentante" da tabela Representante.
 *   2. Se o valor total do pedido for menor ou igual ao "valorFretePedidoMinimo" do frete encontrado,
 *      utiliza-se o "percentualFretePedidoMinimo".
 *   3. Caso contrário, é realizada uma busca pelo código do coligado do cliente (na tabela CarteiraCliente)
 *      para tentar encontrar um registro de frete. Se for encontrado, utiliza-se o "valorFrete" desse registro.
 *   4. Se não houver registro para o coligado, o componente utiliza o "fretePadrao" do registro obtido
 *      pela busca do frete por filial.
 *
 * O componente também gerencia a exibição de modais específicos (CreditCardModal, BillingModal, PixModal)
 * de acordo com a opção de pagamento selecionada. O contexto AuthContext é utilizado para obter informações
 * do usuário, e os dados são carregados e atualizados via SQLite.
 */

import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Title,
  Subtitle,
  OptionContainer,
  RadioButton,
  RadioSelected,
  OptionText,
} from "../CardCarrinho/style";

import { Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import { useRoute } from "@react-navigation/native";
import AuthContext from "@/context/AuthContext";
import { PedidoItem } from "@/context/interfaces/PedidoItem";
import { FreteItem } from "@/context/interfaces/FreteItem";
import CreditCardModalEditarPedidoAberto from "./Modais/CreditCardModalEditarPedidoAberto";
import BillingModalEditarPedidoAberto from "./Modais/BillingModalEditarPedidoAberto";
import PixModalEditarPedidoAberto from "./Modais/PixModalEditarPedidoAberto";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";

// Conecta com o banco SQLite
const db = SQLite.openDatabaseSync("user_data.db");

interface RouteParams {
  pedidoId: number | string;
  clienteId: number | string;
  cpfCnpj: number | string;
}

export interface FormaDePagamentoProps {
  codigo: string;
  descricao: string;
  filial?: string;
}

const EditarPagamentoPedidoAbertoCard: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [creditCardModalVisible, setCreditCardModalVisible] =
    useState<boolean>(false);
  const [billingModalVisible, setBillingModalVisible] =
    useState<boolean>(false);
  const [pixModalVisible, setPixModalVisible] = useState<boolean>(false);
  const [freteByClient, setFreteByClient] = useState(0);
  const [formaDePagamento, setFormaDePagamento] =
    useState<FormaDePagamentoProps[]>();

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [valorTotalPedido, setValorTotalPedido] = useState(0);

  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  const { carrinho } = useEditarPedidoAberto();

  const route = useRoute();
  const { cpfCnpj, clienteId } = route.params as RouteParams;

  const options = [
    { id: "credit", label: "Cartão de Crédito" },
    { id: "billing", label: "Faturamento" },
    { id: "pix", label: "Pix" },
  ];

  const fetchFreteByCliente = async (
    clienteId: string,
    valorTotalPedido: number,
    representanteId: string
  ) => {
    try {
      const queryFreteByFilial = `
      SELECT * FROM Frete 
      WHERE filialRepresentante 
      IN(SELECT filialRepresentanteCodigoFilialRepresentante FROM Representante WHERE representanteId = ? LIMIT 1);`;
      const resultFreteByFilial = (await db.getAllAsync(queryFreteByFilial, [
        representanteId,
      ])) as FreteItem[];

      const queryFreteByCodigoColigado = `
      SELECT * FROM Frete 
      WHERE codigoColigado 
        IN(SELECT codigoColigado FROM CarteiraCliente 
          WHERE clienteId = ? LIMIT 1
          );`;
      const resultFreteByCodigoColigado = await db.getAllAsync(
        queryFreteByCodigoColigado,
        [clienteId]
      );

      if (valorTotalPedido <= resultFreteByFilial[0]?.valorFretePedidoMinimo) {
        setFreteByClient(resultFreteByFilial[0]?.percentualFretePedidoMinimo);
      } else if (
        resultFreteByCodigoColigado &&
        resultFreteByCodigoColigado.length > 0
      ) {
        setFreteByClient(
          (resultFreteByCodigoColigado as FreteItem[])[0].valorFrete
        );
      } else {
        setFreteByClient(resultFreteByFilial[0]?.fretePadrao);
      }
    } catch (error) {
      console.warn("❌ Frete não encontrado.", error);
    }
  };

  const calcularValorTotalDoCarrinho = () => {
    if (!Array.isArray(carrinho)) return;

    const total = carrinho.reduce((acc, produto) => {
      const preco =
        produto.precoUnitarioComIPI > 0
          ? produto.precoUnitarioComIPI
          : produto.precoUnitario;
      const desconto = produto.percentualDesconto ?? 0;
      const quantidade = produto.quantidade ?? 1;
      return acc + preco * quantidade * (1 - desconto / 100);
    }, 0);

    setValorTotalPedido(total);
  };

  const fetchFormaDePagamentoByCnpj = async () => {
    try {
      const query = `SELECT * FROM Pagamento;`;
      const result = (await db.getAllAsync(query)) as FormaDePagamentoProps[];

      if (result && result.length > 0) {
        setFormaDePagamento([
          { descricao: "Selecione uma opção", codigo: "" }, // Placeholder
          ...result,
        ]);
      } else {
        setFormaDePagamento([{ descricao: "Não encontrado", codigo: "0" }]);
      }
    } catch (error) {
      console.error("Erro ao buscar Forma de Pagamento:", error);
      Alert.alert("Erro", "Falha ao carregar Forma de Pagamento.");
    }
  };

  const handleOptionPress = (id: string) => {
    setSelectedOption(id);
    if (id === "credit") {
      setCreditCardModalVisible(true);
    } else if (id === "billing") {
      setBillingModalVisible(true);
    } else if (id === "pix") {
      setPixModalVisible(true);
    }
  };

  useEffect(() => {
    calcularValorTotalDoCarrinho();
    fetchFormaDePagamentoByCnpj();
  }, []);

  useEffect(() => {
    calcularValorTotalDoCarrinho();
  }, [carrinho]);

  useEffect(() => {
    if (valorTotalPedido) {
      fetchFreteByCliente(
        clienteId as string,
        valorTotalPedido,
        representanteId as string
      );
    }
  }, [valorTotalPedido]);

  return (
    <Container>
      <Title>Escolha a Forma de Pagamento do Pedido Aberto</Title>
      <Subtitle>
        As informações devem ser inseridas após selecionar a forma de pagamento
      </Subtitle>

      {options.map((option) => (
        <OptionContainer
          key={option.id}
          onPress={() => handleOptionPress(option.id)}
        >
          <RadioButton selected={selectedOption === option.id}>
            {selectedOption === option.id && <RadioSelected />}
          </RadioButton>
          <OptionText>{option.label}</OptionText>
        </OptionContainer>
      ))}

      {/* Modais */}
      {creditCardModalVisible && (
        <CreditCardModalEditarPedidoAberto
          freteByClient={freteByClient}
          visible={creditCardModalVisible}
          onClose={() => setCreditCardModalVisible(false)}
        />
      )}
      {billingModalVisible && (
        <BillingModalEditarPedidoAberto
          freteByClient={freteByClient}
          formaDePagamento={formaDePagamento}
          visible={billingModalVisible}
          onClose={() => setBillingModalVisible(false)}
        />
      )}
      {pixModalVisible && (
        <PixModalEditarPedidoAberto
          visible={pixModalVisible}
          onClose={() => setPixModalVisible(false)}
          valorTotalPedido={valorTotalPedido}
          freteByClient={freteByClient}
        />
      )}
    </Container>
  );
};

export default EditarPagamentoPedidoAbertoCard;
