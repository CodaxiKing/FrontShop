import React, { useContext, useEffect, useState } from "react";
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
import AuthContext from "@/context/AuthContext";
import { formatCorrectLocalTime } from "@/helpers/formatCorrectLocalTime";

import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { FormaDePagamentoProps } from "../PagamentoCard";
import { getBrazilianTimestamp } from "@/helpers/getBrazilianTimestanp";
import BreakOrderModal from "./BreakOrderModal";
import { useMenuContext } from "@/context/MenuProvider";
import {
  calcularValorDevidoDeFrete,
  calcularValorTotalProdutos,
} from "@/helpers/calcularValorTotalProdutos";
const db = SQLite.openDatabaseSync("user_data.db");

interface BillingModalProps {
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

const BillingModal: React.FC<BillingModalProps> = ({
  visible,
  onClose,
  freteByClient,
  formaDePagamento,
}) => {
  const [selectedRadio, setSelectedRadio] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  // const [freteValue, setFreteValue] = useState(freteByClient);
  const [pedidoInternoValue, setPedidoInternoValue] = useState("");
  const [dadosComplementaresValue, setDadosComplementaresValue] = useState("");

  const [motivoBonificacao, setMotivoBonificacao] = useState("");
  const [descricaoMotivoBonificacao, setDescricaoMotivoBonificacao] =
    useState("");

  const [localEventoSelecionado, setLocalEventoSelecionado] = useState(
    LocalEventoOptions[0]?.value || ""
  );
  const [formaPagamentoSelecionado, setFormaPagamentoSelecionado] =
    useState<string>("");
  const [duplicatasSelecionado, setDuplicatasSelecionado] = useState(0);
  const [diasVencimentoSelecionado, setDiasVencimentoSelecionado] = useState();

  // #TODO: Implementar desconto futuramente
  const [porcentagemDescontoText, setPorcentagemDescontoText] = useState("");
  const [freteCalculado, setFreteCalculado] = useState(0);
  const [valorTotalCalculado, setValorTotalCalculado] = useState(0);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId } = route.params as { pedidoId: number };

  const { userData, setUserData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;
  const representanteCreateId = userData?.representanteCreateId;

  const { limparLojasSelecionadas } = useMenuContext();

  const dataCriacao = new Date().toLocaleString("pt-BR");
  let percentualDeDesconto = 0;
  let enderecoEntrega = "";
  let numeroEntrega = "";
  let cepEntrega = "";
  let bairroEntrega = "";
  let complementoEntrega = "";
  let estadoEntrega = "";
  let ufEntrega = "";
  let municipioEntrega = "";
  let percentualDeFrete = parseFloat(freteByClient.toString()) || 0;

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

  const fetchPedidoBase = async () => {
    const pedidoBase = await db.getAllAsync(
      `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ?;`,
      [pedidoId, representanteId]
    );
    return pedidoBase;
  };

  // Função para atualizar o valor total com base no JSON de produtos
  const atualizarValorTotalComJSON = (jsonProdutos: string) => {
    const novoValorTotal = calcularValorTotalProdutos(
      jsonProdutos,
      freteByClient
    );
    setValorTotalCalculado(novoValorTotal);
    return novoValorTotal;
  };

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
          atualizarValorTotalComJSON(produtosString);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar produtos do pedido:", error);
    }
  };

  const criarPedidoUnico = async (pedidoBase: any[]) => {
    try {
      if (!pedidoId) {
        Alert.alert("Erro", "Pedido não encontrado.");
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

      percentualDeDesconto = parseFloat(porcentagemDescontoText) || 0;

      const meiosPagamento = JSON.stringify([
        {
          tipoPagamento: 2,
          tipoPedido: "P",
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
          percentualDeFrete,
          pedidoInterno: pedidoInternoValue,
          percentualDeDesconto: percentualDeDesconto,
          freteDoPedido: freteCalculado.toFixed(2),
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
        // const valorTotal = loja.produtos.reduce(
        //   (acc: any, p: any) =>
        //     acc + p.quantidade * p.quantidade * p.precoUnitarioComIPI,
        //   0
        // );

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

        const tabelaDePrecoObj = pedidoBase[0]?.selectedTabelaPreco
          ? JSON.parse(pedidoBase[0]?.selectedTabelaPreco)
          : null;

        // converte texto pra número
        percentualDeDesconto = parseFloat(porcentagemDescontoText) || 0;

        const isLojaPrincipal = loja.cpfCnpj === pedidoBase[0].cpfCnpj;

        if (isLojaPrincipal) {
          // Endereço da loja principal (vem do pedidoBase)
          bairroEntrega = pedidoBase[0].bairroEntrega || "";
          cepEntrega = pedidoBase[0].cepEntrega || "";
          complementoEntrega = pedidoBase[0].complementoEntrega || "";
          enderecoEntrega = pedidoBase[0].enderecoEntrega || "";
          estadoEntrega = pedidoBase[0].ufEntrega || "";
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
          estadoEntrega, // estadoEntrega
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
      console.error("Erro ao finalizar pedidos por Faturamento:", error);
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

  const criarPedidosQuebrados = async (pedidoBase: any[]) => {
    try {
      if (!pedidoId) {
        Alert.alert("Erro", "Pedido não encontrado.");
        return;
      }

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
          tipoPagamento: 2,
          tipoPedido: "P",
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
          freteDoPedido: freteCalculado.toFixed(2),
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
          estadoEntrega = pedidoBase[0].ufEntrega || "";
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
          // const quantidadeItens = normalProducts.reduce(
          //   (acc, p) => acc + p.quantidade,
          //   0
          // );
          const quantidadeItens = normalProducts.filter(
            (p) => p.tipo !== "E"
          ).length;
          const valorTotal = normalProducts.reduce((acc: any, p: any) => {
            if (p.tipo === "E") return acc; // Ignora expositores
            const precoBase =
              p.precoUnitarioComIPI > 0
                ? p.precoUnitarioComIPI
                : p.precoUnitario;
            return acc + (p.quantidade ?? 0) * precoBase;
          }, 0);

          // Pedido Quebrado Não deve ir com frete, pois o valor do frete é calculado no pedido principal
          // const frete = calcularValorDevidoDeFrete(valorTotal);
          // const valorTotaldoPedido = valorTotal + frete;

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
            0, // percentualDeFrete
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
            estadoEntrega, // estadoEntrega
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
            0, // percentualDeFrete
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
      console.error("Erro ao finalizar pedidos por faturamento:", error);
    } finally {
      //Deleta o registro da tabela e atualiza o representanteCreateId do usuário para o representanteId que logoou inicialmente.
      const deleteQuery = `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`;
      await db.runAsync(deleteQuery, [pedidoId, representanteId]);
      if (representanteId) {
        setUserData({ ...userData, representanteCreateId: representanteId });
      }
      limparLojasSelecionadas(); // limpa as lojas selecionadas ao fechar o pedido
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
    const pedidoBase = await fetchPedidoBase(); // pega do banco

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
  };

  // Chamado pelo BreakOrderModal:
  const onBreakSelect = async (choice: "sim" | "não") => {
    setShowBreakModal(false);
    const pedidoBase = await fetchPedidoBase();

    if (choice === "sim") {
      // executa o particionamento
      await criarPedidosQuebrados(pedidoBase);
    } else {
      // cria um único pedido
      await criarPedidoUnico(pedidoBase);
    }
    onClose();
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
                          setDuplicatasSelecionado(Number(itemValue) || 0)
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
                          const regex = /^(1[0-9]{0,2}|[1-9]?[0-9])$/;
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
                        value={porcentagemDescontoText}
                        onChangeText={(text) => {
                          const regex = /^\d{0,2}(\.\d{0,2})?$/;
                          if (regex.test(text)) {
                            setPorcentagemDescontoText(text);
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
                    startSave();
                  }}
                />
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

export default BillingModal;
