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
} from "./style";
import CreditCardModal from "./Modais/CreditCardModal";
import BillingModal from "./Modais/BillingModal";
import PixModal from "./Modais/PixModal";
import { Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import { useRoute } from "@react-navigation/native";
import { UserData } from "../../context/interfaces/UserData";
import AuthContext from "@/context/AuthContext";
import { PedidoItem } from "@/context/interfaces/PedidoItem";
import { FreteItem } from "@/context/interfaces/FreteItem";
import { RepresentanteItem } from "@/context/interfaces/RepresentanteItem";
import { PagamentoClienteItem } from "@/context/interfaces/PagamentoClienteItem";
import { PagamentoItem } from "@/context/interfaces/PagamentoItem";

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

const calcularValorTotalPedido = (lojas: any[]): number => {
  return lojas.reduce((accLojas, loja) => {
    const produtos = loja.produtos ?? [];
    const subtotalLoja = produtos.reduce((accProdutos, p) => {
      if (p.tipo === "E") return accProdutos; // Ignora expositores
      const preco =
        p.precoUnitarioComIPI > 0 ? p.precoUnitarioComIPI : p.precoUnitario;
      const quantidade = p.quantidade ?? 0;
      return accProdutos + preco * quantidade;
    }, 0);
    return accLojas + subtotalLoja;
  }, 0);
};

const PagamentoCard: React.FC = () => {
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

  const route = useRoute();
  const { cpfCnpj, clienteId } = route.params as RouteParams;

  const options = [
    { id: "credit", label: "Cartão de Crédito" },
    { id: "billing", label: "Faturamento" },
    { id: "pix", label: "Pix" },
  ];

  const fetchPedidos = async () => {
    try {
      const query = `SELECT * FROM NovoPedido WHERE cpfCnpj = ?;`;
      const result = await db.getAllAsync(query, [cpfCnpj]);

      if (result.length > 0) {
        const pedido = result[0] as PedidoItem;

        const produtosParsed = JSON.parse(pedido.produtos || "[]");

        setPedidos([
          {
            ...pedido,
            produtos: produtosParsed, // Agora o campo 'enderecoEntrega' estará disponível se estiver salvo no banco
          },
        ]);

        // Calcula o valor total do pedido somando os preços dos produtos
        const valorTotalCalculado = calcularValorTotalPedido(produtosParsed);

        setValorTotalPedido(valorTotalCalculado);
      } else {
        console.warn("Nenhum pedido encontrado para o cliente.");
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      Alert.alert("Erro", "Falha ao carregar pedidos.");
    }
  };

  const fetchFreteByCliente = async (
    cpfCnpj: string,
    valorTotalPedido: number,
    representanteId: string
  ) => {
    try {
      const queryFreteByFilial = `
      SELECT * FROM Frete 
      WHERE filialRepresentante IN (
        SELECT filialRepresentanteCodigoFilialRepresentante 
        FROM Representante 
        WHERE representanteId = ? LIMIT 1
      );`;
      const resultFreteByFilial = (await db.getAllAsync(queryFreteByFilial, [
        representanteId,
      ])) as FreteItem[];

      if (!resultFreteByFilial.length) {
        console.warn("⚠️ Nenhum frete encontrado pela filial.");
        return;
      }

      const freteFilial = resultFreteByFilial[0];

      // 1️⃣ Primeiro: valor abaixo do mínimo? Usa percentualFretePedidoMinimo
      if (
        freteFilial.valorFretePedidoMinimo &&
        valorTotalPedido <= freteFilial.valorFretePedidoMinimo
      ) {
        setFreteByClient(freteFilial.percentualFretePedidoMinimo);

        return;
      }

      // 2️⃣ Segundo: buscar por código do coligado
      const queryFreteByCodigoColigado = `
      SELECT * FROM Frete 
      WHERE codigoColigado IN (
        SELECT codigoColigado 
        FROM CarteiraCliente 
        WHERE cpfCnpj = ? LIMIT 1
      );`;
      const resultFreteByCodigoColigado = await db.getAllAsync(
        queryFreteByCodigoColigado,
        [cpfCnpj]
      );

      if (
        resultFreteByCodigoColigado &&
        resultFreteByCodigoColigado.length > 0
      ) {
        setFreteByClient(
          (resultFreteByCodigoColigado as FreteItem[])[0].valorFrete
        );
      } else {
        // 3️⃣ Terceiro: usa o fretePadrao da filial

        setFreteByClient(resultFreteByFilial[0]?.fretePadrao);
      }
    } catch (error) {
      console.warn("❌ Frete não encontrado.", error);
    }
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
    fetchPedidos();
    fetchFormaDePagamentoByCnpj();
  }, []);

  useEffect(() => {
    if (valorTotalPedido) {
      fetchFreteByCliente(
        cpfCnpj as string,
        valorTotalPedido,
        representanteId as string
      );
    }
  }, [valorTotalPedido]);

  return (
    <Container>
      <Title>Escolha a Forma de Pagamento</Title>
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
        <CreditCardModal
          freteByClient={freteByClient}
          visible={creditCardModalVisible}
          onClose={() => setCreditCardModalVisible(false)}
        />
      )}
      {billingModalVisible && (
        <BillingModal
          freteByClient={freteByClient}
          formaDePagamento={formaDePagamento}
          visible={billingModalVisible}
          onClose={() => setBillingModalVisible(false)}
        />
      )}
      {pixModalVisible && (
        <PixModal
          freteByClient={freteByClient}
          visible={pixModalVisible}
          onClose={() => setPixModalVisible(false)}
        />
      )}
    </Container>
  );
};

export default PagamentoCard;
