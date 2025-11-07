import React, { useContext, useEffect, useState } from "react";
import { Alert, Modal } from "react-native";
import BreakOrderModal from "@/components/CardCarrinho/Modais/BreakOrderModal";
import {
  ModalContainer,
  ModalTitle,
  CardSection,
  ModalContent,
  ContainerTitle,
  ContainerBody,
  ButtonContainer,
  ModalSubtitle,
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
import { getBrazilianTimestamp } from "@/helpers/getBrazilianTimestanp";

import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { RootStackParamList } from "@/types/types";
import AuthContext from "@/context/AuthContext";
import { PedidoItem } from "@/context/interfaces/PedidoItem";
import { Container } from "../style";
import { useMenuContext } from "@/context/MenuProvider";
import {
  calcularValorDevidoDeFrete,
  calcularValorTotalProdutos,
} from "@/helpers/calcularValorTotalProdutos";

const db = SQLite.openDatabaseSync("user_data.db");

interface PixModalProps {
  visible: boolean;
  onClose: () => void;
  freteByClient: string | number;
}

interface RouteParams {
  pedidoId: number | string;
  clienteId: number | string;
  cpfCnpj: number | string;
}

interface ProdutoLoja {
  dataPrevistaPA?: string;
  [key: string]: any;
}

const PixModal: React.FC<PixModalProps> = ({
  visible,
  onClose,
  freteByClient,
}) => {
  const [transactionProof, setTransactionProof] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [valorTotalCalculado, setValorTotalCalculado] = useState<number>(0);
  const [freteCalculado, setFreteCalculado] = useState<number>(0);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { pedidoId } = (route.params as RouteParams) || {};

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

  // Função para buscar pedidoBase e calcular o valor total dos produtos
  useEffect(() => {
    // Verifica se o pedidoId está disponível
    if (pedidoId) {
      fetchPedidoBase();
    } else {
      console.warn("ID do pedido não disponível");
    }
  }, [pedidoId]);

  useEffect(() => {
    const frete = calcularValorDevidoDeFrete(
      valorTotalCalculado,
      freteByClient
    );
    setFreteCalculado(frete);
  }, [valorTotalCalculado]);

  const fetchPedidoBase = async () => {
    if (pedidoId == null || representanteId == null) {
      Alert.alert("Erro", "ID do pedido ou representante não disponível.");
      return [];
    }
    const pedidoBase = await db.getAllAsync(
      `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ?;`,
      [pedidoId, representanteId]
    );

    if (pedidoBase.length === 0) {
      Alert.alert("Erro", "Pedido não encontrado.");
      return [];
    }

    const pedido = pedidoBase[0] as { produtos?: string };
    if (pedido && pedido.produtos !== undefined) {
      const produtos = JSON.parse(pedido.produtos);
      if (produtos && produtos.length > 0) {
        const produtosJSON = JSON.stringify(produtos);
        const valorTotal = calcularValorTotalProdutos(
          produtosJSON,
          freteByClient
        );
        setValorTotalCalculado(valorTotal);
      }
    } else {
      console.warn("Campo produtos não encontrado no pedido.");
    }
    return pedidoBase;
  };

  // Função para calcular o valor total + o valor devido de frete
  const calcularValorTotalComFrete = (valorTotal: number): number => {
    if (freteCalculado) {
      return valorTotal + freteCalculado;
    }
    return valorTotal;
  };

  const criarPedidoUnico = async (pedidoBase: any[]) => {
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

      if (pedidoBase[0] && pedidoBase[0].percentualDeDesconto !== null) {
        percentualDeDesconto = pedidoBase[0].percentualDeDesconto || 0;
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
          percentualDeFrete,
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
        //   (acc: any, p: any) => acc + p.quantidade * p.precoUnitarioComIPI,
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

        // Verifica se selectedTabelaPreco existe e é uma string JSON
        const tabelaDePrecoObj = pedidoBase[0]?.selectedTabelaPreco
          ? JSON.parse(pedidoBase[0]?.selectedTabelaPreco)
          : null;

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
          "", // tipoPedido
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
          percentualDeDesconto: percentualDeDesconto,
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
          // const valorTotal = normalProducts.reduce(
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
            false /* quebraPreVenda */,
            null /* dataPrevistaPA */,
            "" /* tipoPedido */,
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
            "" /* tipoPedido */,
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
    const pedidoBase = await fetchPedidoBase();
    const produtosLojas = JSON.parse(pedidoBase[0].produtos)[0].produtos;

    // verifica se existe data futura
    const today = new Date();

    const produtosLojasTyped: ProdutoLoja[] = produtosLojas;
    const hasFuture: boolean = produtosLojasTyped.some((p: ProdutoLoja) => {
      const dp: string | undefined = p.dataPrevistaPA;
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

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <ModalContainer>
          <ModalContent>
            {/* Título */}
            <ContainerTitle>
              <ModalTitle>Opção de Pagamento Selecionada: Pix</ModalTitle>
            </ContainerTitle>

            {/* Informações com Valores do Pedido */}
            <ContainerBody>
              <ModalSubtitle>Total do Pedido</ModalSubtitle>
              <ContainerValorPedido>
                <ContainerValor>
                  <TitleValor>Valor Pedido</TitleValor>
                  <AmoutValor>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valorTotalCalculado)}
                  </AmoutValor>
                </ContainerValor>
                <ContainerValor>
                  <TitleValor>Frete</TitleValor>
                  <AmoutValor>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
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
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(calcularValorTotalComFrete(valorTotalCalculado))}
                  </AmoutValor>
                </ContainerValor>
              </ContainerValorPedido>
            </ContainerBody>

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
                  startSave();
                  // handleSaveCart();
                  // onClose();
                }}
              />
            </ButtonContainer>
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

export default PixModal;
