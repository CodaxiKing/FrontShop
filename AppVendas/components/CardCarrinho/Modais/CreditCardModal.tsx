import React, { useContext, useState, useEffect } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ModalContainer,
  ModalTitle,
  Label,
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
  ContainerValorPedido,
  ContainerValor,
  TitleValor,
  AmoutValor,
  ContainerCondicaoPagamento,
  ContainerValorSubtitle,
  AddOrRemoveCardButtonContainer,
  AddCardButton,
  CardRemoveButton,
} from "./style.modal.credit";
import InputFieldComponent from "@/components/InputFieldComponent";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useNavigation } from "expo-router";
import ModalSuccess from "./ModalSuccess";

import { NavigationProp, useRoute } from "@react-navigation/native";

import * as SQLite from "expo-sqlite";
import { RootStackParamList } from "@/types/types";
import * as Crypto from "expo-crypto";
import AuthContext from "@/context/AuthContext";
import { getBrazilianTimestamp } from "@/helpers/getBrazilianTimestanp";
import SelectFieldDropdown from "@/components/SelectFieldDropdown";
import { TextInputMask } from "react-native-masked-text";
import styled from "styled-components/native";
import SelectFieldComponent from "@/components/SelectFieldComponent";
import BreakOrderModal from "./BreakOrderModal";
import { formatCurrency } from "@/helpers";
import { useMenuContext } from "@/context/MenuProvider";
import {
  calcularValorDevidoDeFrete,
  calcularValorTotalProdutos,
} from "@/helpers/calcularValorTotalProdutos";

interface RouteParams {
  pedidoId: number | string;
  clienteId: number | string;
  cpfCnpj: number | string;
}

interface CreditCardModalProps {
  visible: boolean;
  onClose: () => void;
  freteByClient: string | number;
}

const db = SQLite.openDatabaseSync("user_data.db");

const CreditCardModal: React.FC<CreditCardModalProps> = ({
  visible,
  onClose,
  freteByClient,
}) => {
  const [cards, setCards] = useState([
    { id: 1, bandeira: "", valor: "", parcela: "" },
  ]);
  const [selectedRadio, setSelectedRadio] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId } = (route.params as RouteParams) || {};
  const lojasSelecionadas: string[] = [];

  const { userData, setUserData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;
  const representanteCreateId = userData?.representanteCreateId;

  const { limparLojasSelecionadas } = useMenuContext();

  const dataCriacao = new Date().toLocaleString("pt-BR");
  let percentualDeDesconto = 0;
  let tabelaDePrecoId = "";
  let enderecoEntrega = "";
  let numeroEntrega = "";
  let cepEntrega = "";
  let bairroEntrega = "";
  let complementoEntrega = "";
  let estadoEntrega = "";
  let ufEntrega = "";
  let municipioEntrega = "";

  let percentualDeFrete = parseFloat(freteByClient.toString()) || 0;

  const parseCurrencyToFloat = (valor: string): number => {
    return (
      parseFloat(
        valor
          .replace("R$", "")
          .replace(/\./g, "")
          .replace(/\s/g, "")
          .replace(",", ".")
      ) || 0
    );
  };
  // Busca os produtos quando o modal é aberto
  useEffect(() => {
    if (visible) {
      buscarProdutosDoPedido();
    }
  }, [visible]);
  useEffect(() => {
    const frete = calcularValorDevidoDeFrete(
      valorTotalCalculado,
      freteByClient
    );
    setFreteCalculado(frete);
  }, [valorTotalCalculado]);

  useEffect(() => {
    const totalComFrete = valorTotalCalculado + freteCalculado;
    const updatedCards = [...cards];
    if (updatedCards.length > 0) {
      updatedCards[0].valor = formatCurrency(totalComFrete);
      updatedCards[0].parcela = `12 x ${formatCurrency(totalComFrete / 12)}`;

      setCards(updatedCards);
    }
  }, [freteCalculado]);

  const fetchPedidoBase = async () => {
    if (pedidoId === undefined || representanteId === undefined) {
      throw new Error("pedidoId ou representanteId está indefinido.");
    }
    const pedidoBase = await db.getAllAsync(
      `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ?;`,
      [pedidoId, representanteId]
    );
    return pedidoBase;
  };

  // Função para calcular o valor total + o valor devido de frete
  const calcularValorTotalComFrete = (valorTotal: number): number => {
    if (freteCalculado) {
      return valorTotal + freteCalculado;
    }
    return valorTotal;
  };

  const valorTotalComFrete = valorTotalCalculado + freteCalculado;
  // const valorTotalComFrete = calcularValorTotalComFrete(valorTotalCalculado);

  // Função para atualizar o valor total com base no JSON de produtos
  const atualizarValorTotalComJSON = (jsonProdutos: string) => {
    const novoValorTotal = calcularValorTotalProdutos(
      jsonProdutos,
      freteByClient
    );
    setValorTotalCalculado(novoValorTotal);
    return novoValorTotal;
  };

  // Função para buscar os produtos do pedido
  const buscarProdutosDoPedido = async () => {
    try {
      if (!pedidoId) {
        console.warn("ID do pedido não disponível");
        return;
      }

      const query = `SELECT produtos FROM NovoPedido WHERE id = ?;`;
      const result = await db.getAllAsync(query, [pedidoId]);

      if (
        result &&
        result.length > 0 &&
        result[0] &&
        typeof result[0] === "object"
      ) {
        const produtosString = result[0]?.produtos as string;
        if (produtosString) {
          setProdutosJson(produtosString);
          const valorTotal = atualizarValorTotalComJSON(produtosString);

          // Atualiza o valor e parcela do primeiro cartão automaticamente
          const updatedCards = [...cards];
          if (updatedCards.length > 0) {
            // Preenche o valor total
            // updatedCards[0].valor = formatCurrency(
            //   calcularValorTotalComFrete(valorTotal)
            // );

            // Calcula e preenche o valor das parcelas (dividido por 12)
            const valorParcela = valorTotalComFrete / 12;
            updatedCards[0].parcela = `12 x ${formatCurrency(valorParcela)}`;

            setCards(updatedCards);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar produtos do pedido:", error);
    }
  };

  const criarPedidoUnico = async (pedidoBase: any[]) => {
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

    if (pedidoBase[0] && pedidoBase[0].percentualDeDesconto !== null) {
      percentualDeDesconto = pedidoBase[0].percentualDeDesconto || 0;
    }

    try {
      const meiosPagamento = JSON.stringify(
        cards.map((card) => ({
          tipoPagamento: 1,
          tipoPedido: "P",
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
          percentualDeFrete,
          percentualDeDesconto,
          pedidoInterno: pedidoInternoValue,
          freteDoPedido: freteCalculado.toFixed(2),
        }))
      );

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
      VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

      for (const loja of produtosLojas) {
        const quantidadePecas = loja.produtos.length;
        // const quantidadeTotal = loja.produtos.reduce(
        //   (acc: any, p: any) => acc + p.quantidade,
        //   0
        // );
        const quantidadeItens = loja.produtos.filter(
          (p) => p.tipo !== "E"
        ).length;
        const valorTotal = loja.produtos.reduce((acc: any, p: any) => {
          if (p.tipo === "E") return acc; // Ignora expositores

          const precoBase =
            p.precoUnitarioComIPI > 0 ? p.precoUnitarioComIPI : p.precoUnitario;
          const desconto = p.percentualDesconto ?? 0;

          const precoFinal = precoBase * (1 - desconto / 100);
          const subtotal = (p.quantidade ?? 0) * precoFinal;

          return acc + subtotal;
        }, 0);

        const frete = calcularValorDevidoDeFrete(valorTotal, freteByClient);
        const valorTotaldoPedido = valorTotal + frete;

        let lojaSelecionadaQuery = `SELECT * FROM CarteiraCliente WHERE cpfCnpj = ?;`;
        const lojaSelecionada = await db.getAllAsync(lojaSelecionadaQuery, [
          loja.cpfCnpj,
        ]);

        const produtosComImagem = loja.produtos.map((produto) => {
          if (
            produto.imagem &&
            typeof produto.imagem === "object" &&
            produto.imagem.uri
          ) {
            produto.imagem = produto.imagem.uri; // Acessando o campo 'uri' que contém a URL da imagem
          }
          return produto;
        });

        // Verifica se selectedTabelaPreco existe e é uma string JSON
        const tabelaDePrecoObj = pedidoBase[0]?.selectedTabelaPreco
          ? JSON.parse(pedidoBase[0]?.selectedTabelaPreco)
          : null;

        if (pedidoBase[0] && pedidoBase[0].percentualDeDesconto !== null) {
          percentualDeDesconto = pedidoBase[0].percentualDeDesconto || 0;
        }

        const isLojaPrincipal = loja.cpfCnpj === pedidoBase[0].cpfCnpj;

        if (isLojaPrincipal) {
          // Endereço da loja principal (vem do pedidoBase)
          bairroEntrega = pedidoBase[0].bairroEntrega || "";
          cepEntrega = pedidoBase[0].cepEntrega || "";
          complementoEntrega = pedidoBase[0].complementoEntrega || "";
          enderecoEntrega = pedidoBase[0].enderecoEntrega || "";
          estadoEntrega = pedidoBase[0].ufEntrega || ""; // alterado para ufEntrega
          municipioEntrega = pedidoBase[0].municipioEntrega || "";
          numeroEntrega = pedidoBase[0].numeroEntrega || "s/n";
        } else {
          // Endereço da loja coligada (vem de loja.enderecoEntrega)
          const endereco =
            loja.enderecoEntrega && typeof loja.enderecoEntrega === "object"
              ? loja.enderecoEntrega
              : {};

          bairroEntrega = endereco.bairro || "";
          cepEntrega = endereco.cep || "";
          complementoEntrega = endereco.complemento || "";
          enderecoEntrega = endereco.endereco || "";
          estadoEntrega = endereco.ufEntrega || ""; // alterado para ufEntrega
          municipioEntrega = endereco.municipio || "";
          numeroEntrega = endereco.numero || "s/n";
        }

        const alterarEnderecoDeEntrega =
          pedidoBase[0]?.alterarEnderecoDeEntrega !== null
            ? pedidoBase[0]?.alterarEnderecoDeEntrega
            : 0;

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
          quantidadeItens, // quantidadeItens
          quantidadePecas, // quantidadePecas
          valorTotaldoPedido, // valorTotal
          0, // valorTotalComIPI
          0, // valorTotalDescontos
          null, // formaPagamento
          null, // diasPrimeiroVencimento
          0, // quantidadeDuplicata
          "", // informacaoComplementar
          percentualDeFrete, // percentualDeFrete
          percentualDeDesconto, // percentualDeDesconto
          "", // tipoPagamento
          "", // local
          null, // dataPedidoSaldo
          false, // quebraPreVenda
          null, // dataPrevistaPA
          "P", // tipoPedido
          enderecoEntrega, // enderecoEntrega
          numeroEntrega, // numeroEntrega
          cepEntrega, // cepEntrega
          bairroEntrega, // bairroEntrega
          complementoEntrega, // complementoEntrega
          alterarEnderecoDeEntrega, // alterarEnderecoDeEntrega (boolean)
          null, // tipoLogradouroEntrega
          estadoEntrega, // estadoEntrega "UF"
          municipioEntrega, // municipioEntrega
          JSON.stringify(tabelaDePrecoObj?.toString()), // tabelaDePrecoId
          1, // status
          "Em Aberto", // statusDescricao
          "", // ganhadores
          "", // pedidoSaldo
          dataCriacao, // dataCriacao
          JSON.stringify(produtosComImagem), // produtos
          meiosPagamento, // meiosPagamento
        ]);
      }
    } catch (error) {
      console.error("Erro ao finalizar pedidos por Cartão de Crédito:", error);
    } finally {
      //Deleta o registro da tabela e atualiza o representanteCreateId do usuário para o representanteId que logoou inicialmente.
      const deleteQuery = `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`;
      await db.runAsync(deleteQuery, [pedidoId, representanteId]);
      if (representanteId) {
        setUserData({ ...userData, representanteCreateId: representanteId });
      }
      limparLojasSelecionadas(); // limpa lojas coligadas selecionadas ao fechar pedido
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate("PedidosEmAberto");
        removeCard();
        onClose();
      }, 2000);
    }
  };

  const criarPedidosQuebrados = async (pedidoBase: any[]) => {
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

    if (pedidoBase[0] && pedidoBase[0].percentualDeDesconto !== null) {
      percentualDeDesconto = pedidoBase[0].percentualDeDesconto || 0;
    }

    try {
      const meiosPagamento = JSON.stringify(
        cards.map((card) => ({
          tipoPagamento: 1,
          tipoPedido: "P",
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
          percentualDeFrete,
          percentualDeDesconto,
          pedidoInterno: pedidoInternoValue,
          freteDoPedido: freteCalculado.toFixed(2),
        }))
      );

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
          VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

      for (const loja of produtosLojas) {
        // 1) Ajusta as imagens
        const produtosComImagem = loja.produtos.map((prod) => {
          if (prod.imagem?.uri) prod.imagem = prod.imagem.uri;
          return prod;
        });

        // 2) Particiona em normal vs pré-venda
        const today = new Date();
        const normalProducts: typeof produtosComImagem = [];
        const futureGroups: Record<string, typeof produtosComImagem> = {};

        produtosComImagem.forEach((prod) => {
          const dp = prod.dataPrevistaPA;
          const dpDate = dp ? new Date(dp) : null;
          if (dp && dpDate > today) {
            // agrupa por dataPrevistaPA
            if (!futureGroups[dp]) futureGroups[dp] = [];
            futureGroups[dp].push(prod);
          } else {
            normalProducts.push(prod);
          }
        });

        let lojaSelecionadaQuery = `SELECT * FROM CarteiraCliente WHERE cpfCnpj = ?;`;
        const lojaSelecionada = await db.getAllAsync(lojaSelecionadaQuery, [
          loja.cpfCnpj,
        ]);

        // Verifica se tabelaDePrecoId existe e é uma string JSON
        const tabelaDePrecoObj = pedidoBase[0]?.selectedTabelaPreco
          ? JSON.parse(pedidoBase[0]?.selectedTabelaPreco)
          : null;

        if (pedidoBase[0] && pedidoBase[0].percentualDeDesconto !== null) {
          percentualDeDesconto = pedidoBase[0].percentualDeDesconto || 0;
        }

        const isLojaPrincipal = loja.cpfCnpj === pedidoBase[0].cpfCnpj;

        if (isLojaPrincipal) {
          // Endereço da loja principal (vem do pedidoBase)
          bairroEntrega = pedidoBase[0].bairroEntrega || "";
          cepEntrega = pedidoBase[0].cepEntrega || "";
          complementoEntrega = pedidoBase[0].complementoEntrega || "";
          enderecoEntrega = pedidoBase[0].enderecoEntrega || "";
          estadoEntrega = pedidoBase[0].ufEntrega || ""; // alterado para ufEntrega
          municipioEntrega = pedidoBase[0].municipioEntrega || "";
          numeroEntrega = pedidoBase[0].numeroEntrega || "s/n";
        } else {
          // Endereço da loja coligada (vem de loja.enderecoEntrega)
          const endereco =
            loja.enderecoEntrega && typeof loja.enderecoEntrega === "object"
              ? loja.enderecoEntrega
              : {};

          bairroEntrega = endereco.bairro || "";
          cepEntrega = endereco.cep || "";
          complementoEntrega = endereco.complemento || "";
          enderecoEntrega = endereco.endereco || "";
          estadoEntrega = endereco.ufEntrega || "";
          municipioEntrega = endereco.municipio || "";
          numeroEntrega = endereco.numero || "s/n";
        }

        const alterarEnderecoDeEntrega =
          pedidoBase[0]?.alterarEnderecoDeEntrega !== null
            ? pedidoBase[0]?.alterarEnderecoDeEntrega
            : 0;

        // 3) Gera o pedido “Em Aberto” (se tiver produtos normais)
        if (normalProducts.length > 0) {
          const quantidadePecas = normalProducts.length;
          const quantidadeItens = normalProducts.filter(
            (p) => p.tipo !== "E"
          ).length;
          const valorTotal = normalProducts.reduce((acc: any, p: any) => {
            if (p.tipo === "E") return acc; // Ignora expositores

            const precoBase =
              p.precoUnitarioComIPI > 0
                ? p.precoUnitarioComIPI
                : p.precoUnitario;
            const desconto = p.percentualDesconto ?? 0;

            const precoFinal = precoBase * (1 - desconto / 100);
            const subtotal = (p.quantidade ?? 0) * precoFinal;

            return acc + subtotal;
          }, 0);

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
            quantidadeItens,
            quantidadePecas,
            valorTotal, // valorTotal
            0, // valorTotalComIPI
            0, // valorTotalDescontos
            null, // formaPagamento
            null, // diasPrimeiroVencimento
            0, // quantidadeDuplicata
            "", // informacaoComplementar
            percentualDeFrete, // percentualDeFrete
            percentualDeDesconto,
            "", // tipoPagamento
            "", // local
            null, // dataPedidoSaldo
            false /* quebraPreVenda */,
            null /* dataPrevistaPA */,
            "P" /* tipoPedido */,
            enderecoEntrega, // enderecoEntrega
            numeroEntrega, // numeroEntrega
            cepEntrega, // cepEntrega
            bairroEntrega, // bairroEntrega
            complementoEntrega, // complementoEntrega
            alterarEnderecoDeEntrega, // alterarEnderecoDeEntrega (boolean)
            null, // tipoLogradouroEntrega
            estadoEntrega, // estadoEntrega "UF"
            municipioEntrega, // municipioEntrega
            JSON.stringify(tabelaDePrecoObj?.toString()), // tabelaDePrecoId
            1, // status
            "Em Aberto" /* statusDescricao */,
            "", // ganhadores
            "", // pedidoSaldo
            dataCriacao, // dataCriacao
            JSON.stringify(normalProducts) /* produtos */,
            meiosPagamento /* meiosPagamento */,
          ]);
        }

        // 4) Gera um pedido “Pré Venda” para cada data distinta
        for (const dataPrev in futureGroups) {
          const group = futureGroups[dataPrev];
          const quantidadePecas = group.length;
          // const quantidadeItens = group.reduce(
          //   (acc, p) => acc + p.quantidade,
          //   0
          // );
          const quantidadeItens = group.filter((p) => p.tipo !== "E").length;
          const valorTotal = group.reduce((acc: any, p: any) => {
            if (p.tipo === "E") return acc; // Ignora expositores
            const precoBase =
              p.precoUnitarioComIPI > 0
                ? p.precoUnitarioComIPI
                : p.precoUnitario;
            return acc + (p.quantidade ?? 0) * precoBase;
          }, 0);
          // const valorTotal = group.reduce(
          //   (acc, p) => acc + p.quantidade * p.precoUnitarioComIPI,
          //   0
          // );

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
            quantidadeItens,
            quantidadePecas,
            valorTotal,
            0, // valorTotalComIPI
            0, // valorTotalDescontos
            null, // formaPagamento
            null, // diasPrimeiroVencimento
            0, // quantidadeDuplicata
            "", // informacaoComplementar
            percentualDeFrete, // percentualDeFrete
            percentualDeDesconto,
            "", // tipoPagamento
            "", // local
            null, // dataPedidoSaldo
            true /* quebraPreVenda */,
            null /* dataPrevistaPA */,
            "P" /* tipoPedido */,
            enderecoEntrega, // enderecoEntrega
            numeroEntrega, // numeroEntrega
            cepEntrega, // cepEntrega
            bairroEntrega, // bairroEntrega
            complementoEntrega, // complementoEntrega
            alterarEnderecoDeEntrega, // alterarEnderecoDeEntrega (boolean)
            null, // tipoLogradouroEntrega
            estadoEntrega, // estadoEntrega
            municipioEntrega, // municipioEntrega
            JSON.stringify(tabelaDePrecoObj?.toString()), // tabelaDePrecoId
            3, // status
            "Pré Venda" /* statusDescricao */,
            "", // ganhadores
            "", // pedidoSaldo
            dataCriacao, // dataCriacao
            JSON.stringify(group) /* produtos */,
            meiosPagamento /* meiosPagamento */,
          ]);
        }
      }
    } catch (error) {
      console.error("Erro ao finalizar pedidos por pix:", error);
    } finally {
      //Deleta o registro da tabela e atualiza o representanteCreateId do usuário para o representanteId que logoou inicialmente.
      const deleteQuery = `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`;
      await db.runAsync(deleteQuery, [pedidoId, representanteId]);
      if (representanteId) {
        setUserData({ ...userData, representanteCreateId: representanteId });
      }
      limparLojasSelecionadas(); // limpa lojas coligadas selecionadas ao fechar pedido
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate("PedidosEmAberto");
        onClose();
      }, 2000);
    }
  };

  // Função que inicia o fluxo de salvar:
  const startSave = async () => {
    if (cards.some((card) => !card.bandeira || !card.valor || !card.parcela)) {
      Alert.alert("Erro", "Preencha todos os campos de cada cartão.");
      return;
    }

    const valorDistribuido = cards.reduce(
      (acc, card) => acc + parseCurrencyToFloat(card.valor),
      0
    );

    // Arredondamento de segurança

    const valorDistribuidoArredondado = parseFloat(valorDistribuido.toFixed(2));
    const valorTotalArredondado = parseFloat(valorTotalComFrete.toFixed(2));

    // validação caso o valor total do pedido seja diferente do valor total calculado
    if (valorDistribuidoArredondado !== valorTotalArredondado) {
      Alert.alert(
        "Erro",
        "O valor distribuído entre os cartões não corresponde ao total do pedido."
      );

      return;
    }

    const pedidoBase = await fetchPedidoBase();
    const produtosLojas = JSON.parse(pedidoBase[0].produtos)[0].produtos;

    // verifica se existe data futura
    const today = new Date();
    const hasFuture = produtosLojas.some((p) => {
      const dp = p.dataPrevistaPA;
      return dp && new Date(dp) > today;
    });

    if (hasFuture) {
      // pergunta ao usuário se deseja quebrar o pedido
      setShowBreakModal(true);
    } else {
      // não tem data futura: cria um pedido único
      await criarPedidoUnico(pedidoBase);
      onClose();
    }

    const somaCartoes = cards.reduce(
      (acc, card) =>
        acc +
        parseFloat(
          card.valor.replace("R$", "").replace(/\s/g, "").replace(",", ".")
        ),
      0
    );
  };

  // Chamado pelo BreakOrderModal:
  const onBreakSelect = async (choice: "sim" | "não") => {
    setShowBreakModal(false);
    // const pedidoBase = pedidoBaseMock; // Mock para teste
    const pedidoBase = await fetchPedidoBase(); // pega do banco

    if (choice === "sim") {
      // executa o particionamento
      await criarPedidosQuebrados(pedidoBase);
    } else {
      // cria um único pedido
      await criarPedidoUnico(pedidoBase);
    }
    onClose();
  };

  const addCard = () => {
    // Calcula o total já distribuído nos cartões existentes
    const valorJaDistribuido = cards.reduce((total, card) => {
      return total + parseCurrencyToFloat(card.valor);
    }, 0);

    // Calcula o valor restante a ser pago
    const valorRestante = valorTotalComFrete - valorJaDistribuido;

    if (valorRestante <= 0) {
      Alert.alert("Erro", "Não há valor restante para adicionar outro cartão.");
      return;
    }

    // Adiciona um novo cartão com o valor restante
    setCards([
      ...cards,
      {
        id: cards.length + 1,
        bandeira: "",
        valor: formatCurrency(valorRestante),
        parcela: `12 x ${formatCurrency(valorRestante / 12)}`,
      },
    ]);
  };

  const updateCard = (
    index: number,
    field: keyof (typeof cards)[0],
    value: string | number
  ) => {
    const updatedCards = [...cards];

    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    };

    setCards(updatedCards);

    // Recalcula o valor total dos cartões
    const somaTotal = updatedCards.reduce((total, card) => {
      return total + parseCurrencyToFloat(card.valor);
    }, 0);

    // Se o total for menor que o valor total do pedido, avisa o usuário
    setValorDistribuidoCorretamente(somaTotal === valorTotalComFrete);
  };

  const removeCard = () => {
    setCards([{ id: 1, bandeira: "", valor: "", parcela: "" }]);
  };

  const removeLastCard = () => {
    if (cards.length > 1) {
      const cartaoRemovido = cards[cards.length - 1];

      // Obtém o valor do cartão removido
      const valorRemovido = parseCurrencyToFloat(cartaoRemovido.valor);

      // Remove o último cartão
      const cartoesRestantes = cards.slice(0, -1);

      if (cartoesRestantes.length === 1) {
        // Se sobrar apenas um cartão, ele assume o valor total da compra
        cartoesRestantes[0].valor = formatCurrency(valorTotalComFrete);
        cartoesRestantes[0].parcela = `12 x ${formatCurrency(
          valorTotalComFrete / 12
        )}`;
      } else {
        // Se houver mais de um cartão, o último cartão da lista recebe o valor do removido
        const ultimoCartao = cartoesRestantes[cartoesRestantes.length - 1];

        // Obtém o valor do último cartão antes da redistribuição
        const valorUltimoCartao = parseCurrencyToFloat(ultimoCartao.valor);

        // Define o novo valor para o último cartão, garantindo que não ultrapasse o total

        const novoValorUltimoCartao = Math.min(
          valorUltimoCartao + valorRemovido,
          valorTotalCalculado
        );

        ultimoCartao.valor = formatCurrency(novoValorUltimoCartao);
        ultimoCartao.parcela = `12 x ${formatCurrency(
          novoValorUltimoCartao / 12
        )}`;
      }

      setCards(cartoesRestantes);
    }
  };

  const handleChange = (text: string, index: number) => {
    const valorLimpo = text.replace(/[^\d]/g, "");
    const novoValor = parseInt(valorLimpo || "0", 10) / 100;

    // Calcula quanto os outros cartões já somaram
    const outrosCartoes = cards.filter((_, i) => i !== index);
    const somaOutros = outrosCartoes.reduce((total, card) => {
      return total + parseCurrencyToFloat(card.valor);
    }, 0);

    const maxPermitido = valorTotalComFrete - somaOutros;

    // Aplica o limite se ultrapassar o máximo permitido
    const valorFinal = novoValor > maxPermitido ? maxPermitido : novoValor;

    // Atualiza o estado 'cards' com o valor bruto e o formatado
    const updatedCards = [...cards];

    updatedCards[index].valor = formatCurrency(valorFinal);
    updatedCards[index].parcela = `12 x ${formatCurrency(valorFinal / 12)}`;

    setCards(updatedCards);
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
                              {formatCurrency(
                                calcularValorDevidoDeFrete(
                                  valorTotalCalculado,
                                  freteByClient
                                )
                              )}
                            </AmoutValor>
                          </ContainerValor>
                          <ContainerValor>
                            <TitleValor>Valor Total Pedido</TitleValor>
                            <AmoutValor>
                              {formatCurrency(
                                calcularValorTotalComFrete(valorTotalCalculado)
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

              {/* Secção de Cartão */}
              <ContainerBody>
                <ContainerTitle style={{ marginTop: -20, marginBottom: 0 }}>
                  <ModalTitle>Condição de Pagamento</ModalTitle>
                </ContainerTitle>
                <FlexColumn>
                  <CardSection>
                    {/* <FlexRow> */}
                    {cards.map((card, index) => {
                      // Calcula o valor máximo permitido para o cartão atual
                      const somaOutros = cards
                        .filter((_, i) => i !== index)
                        .reduce(
                          (total, c) => total + parseCurrencyToFloat(c.valor),
                          0
                        );

                      const maxPermitido = valorTotalComFrete - somaOutros;
                      return (
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

                            <TextInput
                              value={card.valor}
                              onChangeText={(text) => handleChange(text, index)}
                              keyboardType="numeric"
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

                            {/* <TextInputMask
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
                          /> */}
                          </View>

                          {/* "Coluna" 3: Input Parcela */}
                          <View style={{ flex: 1 }}>
                            <SelectFieldComponent
                              label="Parcelas"
                              selectedValue={card.parcela}
                              onValueChange={(itemValue: string | number) => {
                                updateCard(
                                  index,
                                  "parcela",
                                  itemValue.toString()
                                );
                              }}
                              options={gerarParcelasDisponiveis(
                                parseCurrencyToFloat(card.valor)
                              )}
                              // options={parcelasDisponiveis}
                              height="50px"
                              margin="-2px"
                            />
                          </View>
                        </FlexRow>
                      );
                    })}
                    {/* </FlexRow> */}
                  </CardSection>
                </FlexColumn>

                <AddOrRemoveCardButtonContainer>
                  {/* Só mostra o botão de remover se houver mais de um cartão */}
                  {cards.length > 1 && (
                    <CardRemoveButton onPress={removeLastCard}>
                      <ButtonText>Remover Último Cartão</ButtonText>
                    </CardRemoveButton>
                  )}

                  <AddCardButton onPress={addCard}>
                    <ButtonText>Adicionar Outro Cartão</ButtonText>
                  </AddCardButton>
                </AddOrRemoveCardButtonContainer>
              </ContainerBody>

              {/* Botões */}
              <ButtonContainer>
                <ConfirmacaoModalButton
                  text="Cancelar"
                  variant="exit"
                  onPress={onClose}
                />
                <ConfirmacaoModalButton text="Salvar" onPress={startSave} />
              </ButtonContainer>
            </ScrollView>
          </ModalContent>
        </ModalContainer>
      </Modal>

      {showBreakModal && (
        <BreakOrderModal
          visible={showBreakModal}
          pedidoNumber={pedidoId}
          onCancel={() => setShowBreakModal(false)}
          onSelect={onBreakSelect}
        />
      )}

      {modalVisible && (
        <ModalSuccess
          visible={modalVisible}
          text="Pedido Realizado com Sucesso"
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default CreditCardModal;
