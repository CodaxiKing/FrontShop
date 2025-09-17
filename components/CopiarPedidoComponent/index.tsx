import React, { useContext, useState } from "react";

import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ButtonContainer, Container } from "./style";
import { RootStackParamList } from "@/types/types";
import { useNavigation, router } from "expo-router";
import ModalRepresentante from "@/modal/ModalRepresentante";
import { ListaClientes } from "../ListaClientes";
import { useRoute, RouteProp } from "@react-navigation/native";
import { PedidoItem } from "../../context/interfaces/PedidoItem";

import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import AuthContext from "@/context/AuthContext";
import { ModalCopiaPedidoConfirmacao } from "@/modal/ModalCopiaPedidoConfirmacao";
import { calcularValorDevidoDeFrete } from "@/helpers/calcularValorTotalProdutos";
import { getFretePercentualPorCliente } from "@/helpers/frete/getFretePercentualPorCliente";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CopiarPedidoComponent: React.FC = () => {
  const [representanteModalVisible, setRepresentanteModalVisible] =
    useState(false);
  const [openCopiaConfirmationModal, setOpenCopiaConfirmationModal] =
    useState(false);
  const [clientesSelecionados, setClientesSelecionados] = useState<any[]>([]);

  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;
  const representanteCreateId = userData?.representanteCreateId;

  const dataCriacao = new Date().toLocaleString("pt-BR");

  type RouteParams = {
    params: {
      pedidoSelecionado?: PedidoItem;
    };
  };

  const route = useRoute<RouteProp<RouteParams, "params">>();

  const db = SQLite.openDatabaseSync("user_data.db");

  const { pedidoSelecionado } = route.params || {}; // Pegando o pedido vindo da navegação
  const navigation = useNavigation<NavigationProp>();

  /**
   * @function handleConfirmarCopia
   * @description
   * Copia um pedido existente para os clientes selecionados, criando um novo registro de pedido para cada cliente.
   * Para cada cliente:
   * - Busca dados atualizados na `CarteiraCliente`
   * - Recalcula o valor total, frete e quantidade de itens
   * - Gera novo `codigoMobile` e marca como pedido aberto
   *
   * Utilizado em ações de "Copiar Pedido", preparando novos pedidos prontos para edição ou sincronização.
   */
  const handleConfirmarCopia = async () => {
    if (!pedidoSelecionado || clientesSelecionados.length === 0) {
      alert("Selecione pelo menos um cliente para copiar o pedido!");
      return;
    }

    try {
      for (const cliente of clientesSelecionados) {
        // Buscar dados atualizados do cliente
        const dadosClienteQuery = `SELECT * FROM CarteiraCliente WHERE cpfCnpj = ? LIMIT 1`;
        const dadosCliente = await db.getFirstAsync(dadosClienteQuery, [
          cliente.cpfCnpj,
        ]);

        if (!dadosCliente) {
          console.warn(`⚠️ Cliente não encontrado na base: ${cliente.cpfCnpj}`);
          continue;
        }

        const produtos = JSON.parse(pedidoSelecionado.produtos || "[]");

        // Parse de endereços
        const enderecos = JSON.parse(cliente.enderecos || "[]");
        const enderecoPrincipal =
          enderecos.find((e) => e.tipo === 1) || enderecos[0] || {};

        // Dados de endereço
        const enderecoEntrega = enderecoPrincipal.endereco ?? "";
        const numeroEntrega = enderecoPrincipal.numero ?? "s/n"; // se quiser extrair número separado
        const bairroEntrega = enderecoPrincipal.bairro ?? "";
        const municipioEntrega = enderecoPrincipal.municipio ?? "";
        const estadoEntrega = enderecoPrincipal.estado ?? "";
        const cepEntrega = enderecoPrincipal.cep ?? "";
        const complementoEntrega = enderecoPrincipal.complemento ?? "";

        const quantidadePecas = produtos.length;
        const quantidadeItens = produtos.reduce(
          (acc, p) => acc + (p.quantidade || 0),
          0
        );

        const valorTotal = produtos.reduce((acc, p) => {
          if (p.tipo === "E") return acc;
          const precoBase = p.precoUnitarioComIPI ?? p.precoUnitario ?? 0;
          const desconto = p.percentualDesconto ?? 0;
          const precoFinal = precoBase * (1 - desconto / 100);
          return acc + (p.quantidade ?? 0) * precoFinal;
        }, 0);

        // 🔁 Calcular frete baseado no cliente
        const freteByClient = await getFretePercentualPorCliente(
          cliente.clienteId,
          valorTotal,
          Number(representanteId)
        );

        const frete = calcularValorDevidoDeFrete(
          valorTotal,
          freteByClient ?? 0
        );

        const valorTotalComFrete = valorTotal + frete;

        const query = `
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

        await db.runAsync(query, [
          Crypto.randomUUID(), // codigoMobile
          cliente.razaoSocial,
          "", // numeroPedido
          "", // pedidoTechnosPlus
          "", // pedidoInterno
          "App", // plataforma
          dadosCliente.clienteId, // clienteId
          cliente.cpfCnpj, // cpfCnpj
          representanteId, // representanteId
          representanteCreateId, // representanteCreateId
          quantidadeItens, // quantidadeItens
          quantidadePecas, // quantidadePecas
          valorTotalComFrete, // valorTotal
          0, // valorTotalComIPI
          0, // valorTotalDescontos
          pedidoSelecionado.formaPagamento,
          pedidoSelecionado.diasPrimeiroVencimento,
          pedidoSelecionado.quantidadeDuplicata ?? 0, // quantidadeDuplicata
          pedidoSelecionado.informacaoComplementar ?? "", // informacaoComplementar
          freteByClient ?? 0, // percentualDeFrete
          pedidoSelecionado.percentualDeDesconto ?? 0, // percentualDeDesconto
          pedidoSelecionado.tipoPagamento ?? "", // tipoPagamento
          pedidoSelecionado.local ?? "", // local
          pedidoSelecionado.dataPedidoSaldo ?? "", // dataPedidoSaldo
          pedidoSelecionado.quebraPreVenda ?? 0, // quebraPreVenda
          pedidoSelecionado.dataPrevistaPA ?? null, // dataPrevistaPA
          pedidoSelecionado.tipoPedido ?? "", // tipoPedido
          enderecoEntrega, // enderecoEntrega
          numeroEntrega, // numeroEntrega
          cepEntrega, // cepEntrega
          bairroEntrega, // bairroEntrega
          complementoEntrega, // complementoEntrega
          pedidoSelecionado.alterarEnderecoDeEntrega ?? 0, // alterarEnderecoDeEntrega
          pedidoSelecionado.tipoLogradouroEntrega ?? null, // tipoLogradouroEntrega
          estadoEntrega,
          municipioEntrega,
          JSON.stringify(pedidoSelecionado.tabelaDePrecoId?.toString()),
          1, // status
          "Em Aberto", // statusDescricao
          "", // ganhadores
          0, // pedidoSaldo
          dataCriacao, // dataCriacao
          JSON.stringify(produtos), // produtos
          pedidoSelecionado.meiosPagamento, // meiosPagamento
        ]);
      }

      alert("Pedido copiado com sucesso para os clientes selecionados!");
      navigation.navigate("PedidosEmAberto");
    } catch (error) {
      console.error("Erro ao copiar pedido:", error);
      alert("Erro ao copiar pedido.");
    }
  };

  const handleOpenCopiaConfirmationModal = () => {
    setOpenCopiaConfirmationModal(true);
  };

  const handleRepresentanteSelection = () => {
    setRepresentanteModalVisible(true);
  };

  return (
    <>
      <Container>
        <ListaClientes setClientesSelecionados={setClientesSelecionados} />
      </Container>
      <ButtonContainer>
        <ConfirmacaoModalButton
          text="Copiar"
          onPress={() => setOpenCopiaConfirmationModal(true)}
        />
      </ButtonContainer>

      {openCopiaConfirmationModal && (
        <ModalCopiaPedidoConfirmacao
          visible={openCopiaConfirmationModal}
          onClose={() => setOpenCopiaConfirmationModal(false)}
          onConfirm={handleConfirmarCopia}
        />
      )}

      {representanteModalVisible && (
        <ModalRepresentante
          isVisible={representanteModalVisible}
          onClose={() => setRepresentanteModalVisible(false)}
          onConfirm={() => setRepresentanteModalVisible(false)}
        />
      )}
    </>
  );
};
