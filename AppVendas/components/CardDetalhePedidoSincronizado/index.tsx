import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  ContainerCardEmpresa,
  ContainerFooterCard,
  ContainerNomeEmpresa,
  ContainerPedido,
  ContainerQuantidade,
  ContainerTextItemPedido,
  ContentCardEmpresa,
  DetalhesPedido,
  HeaderCardEmpresa,
  ImagemProduto,
  ImagemProdutoContainer,
  InputQuantidade,
  ItemPedido,
  TextEmpresa,
} from "./style";

// Importe a função de busca do pedido (caso esteja em outro arquivo)
import { PedidoSincronizadoItem } from "@/context/interfaces/PedidoSincronizadoItem";
import * as SQLite from "expo-sqlite";
import { formatCurrency } from "@/helpers";
import { calcularSubtotalDetalhePedido } from "@/utils/subtotalComDescontoDetalhePedido";

const db = SQLite.openDatabaseSync("user_data.db");

const CardDetalhePedidoSincronizado: React.FC = () => {
  const route = useRoute();
  const { pedidoSincronizadoSelecionado } = route.params as {
    pedidoSincronizadoSelecionado: PedidoSincronizadoItem;
  };

  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>();
  const [visibleEmpresas, setVisibleEmpresas] = useState<any[]>([]);
  const [quantidades, setQuantidades] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);
  const [valorTotalPedido, setValorTotalPedido] = useState(0);
  const [orientation, setOrientation] = useState(
    Dimensions.get("window").width > Dimensions.get("window").height
      ? "landscape"
      : "portrait"
  );

  // Atualizar o estado quando a orientação mudar
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        Dimensions.get("window").width > Dimensions.get("window").height
          ? "landscape"
          : "portrait"
      );
    };

    const subscription = Dimensions.addEventListener(
      "change",
      handleOrientationChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Carregar pedido ao montar
  useEffect(() => {
    async function loadPedido() {
      if (pedidoSincronizadoSelecionado) {
        setLoading(true);
        const pedidoBuscado = await fetchAndAdaptPedidoSelecionado(
          pedidoSincronizadoSelecionado
        );
        setPedidoSelecionado(pedidoBuscado);

        setLoading(false);
      } else {
        console.error("pedidoSincronizadoSelecionado é undefined ou null!");
      }
    }

    loadPedido();
  }, [pedidoSincronizadoSelecionado]);

  // Quando o pedido é carregado, inicializar a lista de empresas e quantidades
  useEffect(() => {
    if (pedidoSelecionado && pedidoSelecionado.empresas) {
      setVisibleEmpresas(pedidoSelecionado.empresas);

      const initialQuantidades = pedidoSelecionado.empresas.map(
        (empresa: any) =>
          empresa.produtos.map((produto: any) => produto.quantidade || 1)
      );
      setQuantidades(initialQuantidades);
    }
  }, [pedidoSelecionado]);

  // Função para determinar a forma de pagamento
  const determinePaymentMethod = (paymentInfo: any, motivoBonificacao: any) => {
    // Caso 1: Cartão de Crédito
    if (paymentInfo.tipoPagamento === 1 && paymentInfo.cartaoBandeira) {
      return "Cartão de Crédito";
    }

    // Caso 2: Pix
    if (
      paymentInfo.tipoPagamento === 1 &&
      paymentInfo.pixComprovanteTransacao
    ) {
      return "Pix";
    }

    // Caso 3: Bonificação
    if (paymentInfo.tipoPagamento === 1 && motivoBonificacao) {
      return "Bonificação";
    }

    // Caso 4: Faturamento
    if (paymentInfo.tipoPagamento === 2) {
      return "Faturamento";
    }

    return "Forma de pagamento desconhecida";
  };

  const fetchAndAdaptPedidoSelecionado = async (pedidoSelecionado: any) => {
    try {
      const pedido = pedidoSelecionado || {};

      setValorTotalPedido(pedido.valorTotal || 0);

      // Verifique se "produtos" realmente está sendo recuperado
      let produtos = pedidoSelecionado.produtos || [];

      if (typeof produtos === "string") {
        produtos = JSON.parse(produtos); // Converter string JSON em array
      }

      if (!Array.isArray(produtos)) {
        console.error("Produtos não são um array válido!");
      }

      // Verificar e converter "meiosPagamento" de string JSON para array
      let meiosPagamento = [];
      if (typeof pedidoSelecionado.meiosPagamento === "string") {
        meiosPagamento = JSON.parse(pedidoSelecionado.meiosPagamento); // Converter para array
      } else {
        meiosPagamento = pedidoSelecionado.meiosPagamento || [];
      }

      // Verificar motivoBonificacao
      const motivoBonificacao = pedidoSelecionado.motivoBonificacao;

      // Determinar a forma de pagamento
      const formaDePagamento = determinePaymentMethod(
        meiosPagamento[0],
        motivoBonificacao
      );

      // Adaptar produtos e adicionar detalhes do catálogo
      const produtosComDetalhes = await Promise.all(
        produtos.map(async (prod: any) => {
          let catalogoResult: any[] = [];
          let precoOriginalSemDesconto: number | null = 0;
          // Verifica o tipo do produto e retorna os detalhes
          try {
            if (prod.tipo === "E") {
              const catalogoQuery = `SELECT nomeEcommerce, imagens FROM Expositor WHERE codigo = ?;`;
              catalogoResult = await db.getAllAsync(catalogoQuery, [
                prod.codigo,
              ]);
            } else {
              const catalogoQuery = `SELECT nomeEcommerce, imagens FROM Catalogo WHERE codigo = ?;`;
              catalogoResult = await db.getAllAsync(catalogoQuery, [
                prod.codigo,
              ]);
            }

            const produtoCatalogo =
              catalogoResult.length > 0
                ? (catalogoResult[0] as {
                    nomeEcommerce?: string;
                    imagens?: string;
                  })
                : {};

            // Parse do campo 'imagens' para um array de objetos
            const imagensArray = produtoCatalogo.imagens
              ? JSON.parse(produtoCatalogo.imagens)
              : [];

            // Acessa a primeira imagem (imagemUrl) ou define uma imagem padrão
            const imagemUrl =
              imagensArray.length > 0 ? imagensArray[0].imagemUrl : "";

            const precoOriginalSemDescontoQuery = `SELECT precoUnitario FROM Catalogo WHERE codigo = ?;`;
            const precoOriginalSemDescontoResult = await db.getAllAsync(
              precoOriginalSemDescontoQuery,
              [prod.codigo]
            );

            // variável apenas para exibir o preço original sem desconto
            precoOriginalSemDesconto =
              precoOriginalSemDescontoResult[0]?.precoUnitario || 0;

            const valorProduto = prod.precoUnitarioComIPI || prod.precoUnitario;
            const percentualDesconto = prod.percentualDesconto || 0;

            const valorComDesconto =
              percentualDesconto > 0
                ? valorProduto - valorProduto * (percentualDesconto / 100)
                : valorProduto;

            return {
              codigo: prod.codigo,
              nome:
                produtoCatalogo.nomeEcommerce ||
                prod.nome ||
                "Produto sem nome",
              imagem: imagemUrl || "",
              valorProduto, // valor cheio
              valorComDesconto, // valor com desconto aplicado
              precoOriginalSemDesconto,
              quantidade: prod.quantidade,
              percentualDesconto,
            };
          } catch (error) {
            console.error(
              `Erro ao buscar detalhes do produto ${prod.referencia}:`,
              error
            );
            return {
              codigo: prod.codigo,
              nome: prod.nome || "Produto sem nome",
              imagem: "", // Fallback para imagem vazia
              valorProduto: prod.precoUnitarioComIPI || prod.precoUnitario,
              precoOriginalSemDesconto,
              quantidade: prod.quantidade,
              percentualDesconto: prod.percentualDesconto || 0,
            };
          }
        })
      );

      const empresa = {
        id: 1,
        nome: pedido.razaoSocial || "Nome não disponível",
        endereco: pedido.enderecoEntrega || "Endereço não disponível",
        produtos: produtosComDetalhes,
        formaDePagamento: formaDePagamento,
      };

      return {
        ...pedido,
        empresas: [empresa],
      };
    } catch (error) {
      console.error("Erro ao adaptar pedido selecionado:", error);
      return {}; // Garantir que sempre retorne um objeto, não undefined
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <ActivityIndicator size={32} color="#0000ff" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#555" }}>
          Carregando pedido...
        </Text>
      </View>
    );
  }

  // Caso não encontre dados
  if (!pedidoSincronizadoSelecionado) {
    return (
      <ScrollView>
        <Text style={{ margin: 20 }}>Não há dados para exibir.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <ContainerCardEmpresa>
        {!visibleEmpresas ||
          (visibleEmpresas.length === 0 && (
            <Text style={{ margin: 20 }}>Não há dados para exibir.</Text>
          ))}

        {visibleEmpresas &&
          visibleEmpresas.length > 0 &&
          visibleEmpresas.map((empresa, empresaIndex) => {
            const totalEmpresa = empresa.produtos.reduce(
              (total: number, produto: any, produtoIndex: number) => {
                const quantidade = quantidades[empresaIndex][produtoIndex];
                return total + produto.valorProduto * quantidade;
              },
              0
            );

            const produtosExibir =
              route.name === "PedidoEmAberto"
                ? empresa.produtos.slice(0, 4)
                : empresa.produtos;

            return (
              <React.Fragment key={empresa.id}>
                <ContentCardEmpresa>
                  <HeaderCardEmpresa>
                    <ContainerNomeEmpresa>
                      <TextEmpresa fontSize={16} weight={700}>
                        {empresa.nome || "N/A"}
                      </TextEmpresa>
                      <TextEmpresa fontSize={14} weight={400}>
                        {empresa.endereco}
                      </TextEmpresa>
                      <TextEmpresa fontSize={14} weight={400}>
                        Forma de Pagamento:{" "}
                        {pedidoSelecionado.empresas[0].formaDePagamento}
                      </TextEmpresa>
                    </ContainerNomeEmpresa>
                  </HeaderCardEmpresa>
                  <ContainerPedido>
                    {produtosExibir.map(
                      (produto: any, produtoIndex: number) => (
                        <ItemPedido key={`${produto.codigo}-${produtoIndex}`}>
                          <ImagemProdutoContainer>
                            <ImagemProduto source={{ uri: produto.imagem }} />
                          </ImagemProdutoContainer>
                          <DetalhesPedido>
                            <ContainerTextItemPedido>
                              <TextEmpresa fontSize={14} weight={600}>
                                {produto.codigo}
                              </TextEmpresa>
                              <TextEmpresa fontSize={14} weight={400}>
                                {produto.nome}
                              </TextEmpresa>
                            </ContainerTextItemPedido>
                            <ContainerTextItemPedido>
                              <ContainerQuantidade>
                                <InputQuantidade
                                  value={String(
                                    quantidades[empresaIndex][produtoIndex] || 1
                                  )}
                                  editable
                                  style={{
                                    width: Math.max(
                                      50,
                                      20 +
                                        String(
                                          quantidades[empresaIndex][
                                            produtoIndex
                                          ] || 1
                                        ).length *
                                          20
                                    ),
                                  }}
                                />
                                <Text style={{ fontSize: 18 }}>
                                  {(
                                    produto.valorProduto *
                                    (quantidades[empresaIndex][produtoIndex] ||
                                      1)
                                  ).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </Text>
                                <Text>
                                  {produto.percentualDesconto > 0 && (
                                    <Text
                                      style={{
                                        fontSize: 10,
                                        color: "#FF0000",
                                      }}
                                    >
                                      {` (-${produto.percentualDesconto}%)`}
                                    </Text>
                                  )}
                                </Text>
                              </ContainerQuantidade>
                            </ContainerTextItemPedido>
                          </DetalhesPedido>
                        </ItemPedido>
                      )
                    )}
                  </ContainerPedido>
                </ContentCardEmpresa>
                <ContainerFooterCard>
                  <TextEmpresa fontSize={17} weight={600}>
                    Subtotal: {formatCurrency(totalEmpresa)}
                  </TextEmpresa>
                  <TextEmpresa fontSize={17} weight={600}>
                    Total: {formatCurrency(valorTotalPedido)}
                  </TextEmpresa>
                </ContainerFooterCard>
              </React.Fragment>
            );
          })}

        {/* aqui vai a tabela */}
        {/* <HeaderLabel>
          <HeaderText>Pedido Quebrado por Saldo</HeaderText>
        </HeaderLabel>
        <TablePedidoSicronizadoQuebrado /> */}
      </ContainerCardEmpresa>
    </ScrollView>
  );
};

export default CardDetalhePedidoSincronizado;
