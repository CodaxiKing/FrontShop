import React, { useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
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
import IconesCardCarrinho from "./IconesCardCarrinho";
import { calcularSubtotalDetalhePedido } from "@/utils/subtotalComDescontoDetalhePedido";
import { formatarEnderecoCompleto } from "../../utils/formatEndereco";
import { getFretePercentualPorCliente } from "@/helpers/frete/getFretePercentualPorCliente";
import { hasValue } from "@/helpers/hasValue";

const db = SQLite.openDatabaseSync("user_data.db");

const CardDetalhePedidoEmAberto: React.FC = () => {
  const route = useRoute();
  const { pedidoId }: any = route.params || {};
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [visibleEmpresas, setVisibleEmpresas] = useState<any[]>([]);
  const [quantidades, setQuantidades] = useState<number[][]>([]);
  const [freteDoPedido, setFreteDoPedido] = useState(0);
  const [isCalculandoFrete, setIsCalculandoFrete] = useState(false);

  useEffect(() => {
    fetchPedidoById(pedidoId);
  }, [pedidoId]);

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
  const determinePaymentMethod = (
    paymentInfo: any,
    motivoBonificacao?: any
  ) => {
    // console.log("💧 Determining payment method (paymentInfo)...:", paymentInfo);
    // Caso 1: Cartão de Crédito

    if (
      hasValue(paymentInfo.cartaoBandeira) &&
      paymentInfo.tipoPagamento === 1
    ) {
      return "Cartão de Crédito";
    } else if (
      // Caso 2: Pix
      hasValue(paymentInfo.pixComprovanteTransacao) &&
      paymentInfo.tipoPagamento === 1
    ) {
      return "Pix";
    } else if (
      // Caso 3: Bonificação
      hasValue(motivoBonificacao) &&
      paymentInfo.tipoPagamento === 1
    ) {
      return "Bonificação";
    } else if (paymentInfo.tipoPagamento === 2) {
      // Caso 4: Faturamento
      return "Faturamento";
    }

    return "Forma de pagamento desconhecida";
  };

  const fetchPedidoById = async (id: number) => {
    try {
      const pedidoQuery = `SELECT * FROM Pedido WHERE id = ?;`;
      const pedidoResult = await db.getAllAsync(pedidoQuery, [id]);

      if (!pedidoResult || pedidoResult.length === 0) {
        return null;
      }

      const pedido: {
        produtos?: string;
        razaoSocial?: string;
        motivoBonificacao?: string;
        meiosPagamento?: string;
        enderecoEntrega?: string;
        numeroEntrega?: string;
        complementoEntrega?: string;
        bairroEntrega?: string;
        municipioEntrega?: string;
        estadoEntrega?: string;
        cepEntrega?: string;
      } = pedidoResult[0] || {};

      const enderecoFormatado = {
        endereco: pedido.enderecoEntrega || "",
        numero: pedido.numeroEntrega || "s/n",
        complemento: pedido.complementoEntrega || "",
        bairro: pedido.bairroEntrega || "",
        municipio: pedido.municipioEntrega || "",
        estado: pedido.estadoEntrega || "",
        cep: pedido.cepEntrega || "",
      };
      // Verificar e converter "meiosPagamento" de string JSON para array
      let meiosPagamento: any[] = [];

      if (Array.isArray(pedido.meiosPagamento)) {
        // Já é array
        meiosPagamento = pedido.meiosPagamento;
      } else if (typeof pedido.meiosPagamento === "string") {
        let raw = pedido.meiosPagamento.trim();

        // Caso comum aqui: veio duplamente encodado → "\"[{\\"tipoPagamento\\":1,...}]\""
        if (raw.startsWith('"') && raw.endsWith('"')) {
          try {
            raw = JSON.parse(raw); // primeira “descascada”
          } catch {
            // segue o fluxo, vamos tentar parsear logo abaixo
          }
        }

        // Tenta parse normal agora
        try {
          meiosPagamento = JSON.parse(raw || "[]");
        } catch {
          // Fallback apenas para este caso: formato com "=" e sem aspas nas chaves
          try {
            const fixed = raw
              .replace(/=/g, ":") // troca "=" por ":"
              .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // adiciona aspas nas chaves
            meiosPagamento = JSON.parse(fixed || "[]");
          } catch (e) {
            console.error("Falha ao parsear meiosPagamento (tela atual):", e);
            meiosPagamento = [];
          }
        }
      } else {
        meiosPagamento = [];
      }

      // Verificar motivoBonificacao
      const motivoBonificacao = pedido.motivoBonificacao;

      // Determinar a forma de pagamento
      const formaDePagamento = determinePaymentMethod(
        meiosPagamento[0],
        motivoBonificacao
      );

      setFreteDoPedido(meiosPagamento?.[0]?.freteDoPedido || 0);

      const produtos = JSON.parse(pedido.produtos || "[]");
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

            const obterUrlImagem = (
              imagem: string | number | { uri: string } | null | undefined
            ) => {
              // Se imagem for nulo ou typeof number, retorna undefined
              if (!imagem || typeof imagem === "number") {
                return undefined;
              }
              // Se for um objeto com a chave uri
              if (typeof imagem === "object" && "uri" in imagem && imagem.uri) {
                return imagem.uri;
              }
              // Se for uma URL direta
              return imagem;
            };

            const imagemObtida = obterUrlImagem(prod.imagem);
            // const imagemObtida = getImageSource(prod.imagem);

            const produtoCatalogo =
              catalogoResult.length > 0
                ? (catalogoResult[0] as { nomeEcommerce?: string })
                : {};

            const precoOriginalSemDescontoQuery = `SELECT precoUnitarioComIPI FROM Catalogo WHERE codigo = ?;`;
            const precoOriginalSemDescontoResult = await db.getAllAsync(
              precoOriginalSemDescontoQuery,
              [prod.codigo]
            );

            precoOriginalSemDesconto =
              precoOriginalSemDescontoResult[0]?.precoUnitarioComIPI || 0;

            return {
              codigo: prod.codigo,
              nome:
                produtoCatalogo.nomeEcommerce ||
                prod.nome ||
                "Produto sem nome",
              imagem: imagemObtida,
              // imagem:
              //   prod.imagem ? prod.imagem
              //   (typeof prod.imagem === "string" && prod.imagem.uri),
              quantidade: prod.quantidade,
              valorProduto: prod.precoUnitarioComIPI || prod.precoUnitario,
              precoOriginalSemDesconto,
              percentualDesconto: prod.percentualDesconto || 0,
            };
          } catch (error) {
            console.error(
              `Erro ao buscar detalhes do produto ${prod.referencia}:`,
              error
            );
            return {
              codigo: prod.codigo,
              nome: prod.nome || "Produto sem nome",
              imagem: require("@/assets/images/sem-imagem.png"), // Imagem padrão caso ocorra um erro
              // imagem: prod.imagem, // Imagem padrão caso ocorra um erro
              valorProduto: prod.precoUnitarioComIPI || prod.precoUnitario,
              quantidade: prod.quantidade,
            };
          }
        })
      );

      const empresa = {
        id: 1,
        nome: pedido.razaoSocial || "Nome não disponível",
        endereco: enderecoFormatado || "Endereço não disponível",
        produtos: produtosComDetalhes,
        formaDepagamento: formaDePagamento,
      };

      setPedidoSelecionado({
        ...pedido,
        empresas: [empresa],
      });

      // Se já vier valor de frete salvo no banco, usamos ele.
      // Senão, calculamos com base nos produtos.
      if (meiosPagamento?.[0]?.freteDoPedido) {
        setFreteDoPedido(meiosPagamento[0].freteDoPedido);
      } else {
        await calcularFreteDoPedido(pedido, produtosComDetalhes);
      }

      return {
        ...pedido,
        empresas: [empresa],
      };
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      return null;
    }
  };

  const calcularFreteDoPedido = async (
    pedido: any,
    produtosComDetalhes: any[]
  ) => {
    try {
      setIsCalculandoFrete(true);

      const clienteId = pedido?.clienteId;
      const representanteId = pedido?.representanteId;

      if (!clienteId || !representanteId) return;

      const valorSemFrete = produtosComDetalhes.reduce(
        (acc: number, p: any) => {
          const preco = p.valorProduto || 0;
          const desconto = (p.percentualDesconto || 0) / 100;
          return acc + p.quantidade * preco * (1 - desconto);
        },
        0
      );

      const percentualFrete = await getFretePercentualPorCliente(
        clienteId,
        valorSemFrete,
        Number(representanteId)
      );

      const freteCalculado =
        percentualFrete !== undefined && percentualFrete !== null
          ? (valorSemFrete * percentualFrete) / 100
          : 0;

      setFreteDoPedido(freteCalculado);
    } catch (error) {
      console.error("Erro ao calcular o frete:", error);
    } finally {
      setIsCalculandoFrete(false);
    }
  };

  if (!pedidoSelecionado || !pedidoSelecionado.empresas) {
    return (
      <ScrollView>
        <Text style={{ margin: 20 }}>Não há dados para exibir.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <ContainerCardEmpresa>
        {visibleEmpresas.map((empresa, empresaIndex) => {
          const totalEmpresa = empresa.produtos.reduce(
            (total: number, produto: any, produtoIndex: number) => {
              const quantidade = quantidades[empresaIndex][produtoIndex];
              return total + produto.valorProduto * quantidade;
            },
            0
          );

          const produtosExibir = empresa.produtos;
          const endereco = empresa.endereco;
          const formaDePagamento = empresa.formaDepagamento;

          return (
            <React.Fragment key={empresa.id}>
              <ContentCardEmpresa>
                <HeaderCardEmpresa>
                  <ContainerNomeEmpresa>
                    <TextEmpresa fontSize={16} weight={700}>
                      {empresa.nome || "N/A"}
                    </TextEmpresa>
                    <TextEmpresa fontSize={14} weight={400}>
                      {formatarEnderecoCompleto(endereco)}
                    </TextEmpresa>
                    <TextEmpresa fontSize={14} weight={400}>
                      Forma de Pagamento: {formaDePagamento}
                    </TextEmpresa>
                  </ContainerNomeEmpresa>
                  {route.name !== "DetalhePedidoAberto" &&
                    route.name !== "DetalhePedidoSicronizado" && (
                      <IconesCardCarrinho />
                    )}
                </HeaderCardEmpresa>
                <ContainerPedido>
                  {produtosExibir.map((produto: any, produtoIndex: number) => (
                    <ItemPedido key={`${produto.codigo}-${produtoIndex}`}>
                      <ImagemProdutoContainer>
                        <ImagemProduto
                          source={
                            produto.imagem === undefined
                              ? require("@/assets/images/sem-imagem.png")
                              : { uri: produto.imagem }
                          }
                        />
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
                                      quantidades[empresaIndex][produtoIndex] ||
                                        1
                                    ).length *
                                      20
                                ),
                              }}
                            />
                            <Text style={{ fontSize: 18 }}>
                              {(
                                produto.valorProduto *
                                (quantidades[empresaIndex][produtoIndex] || 1)
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
                  ))}
                </ContainerPedido>
              </ContentCardEmpresa>
              <ContainerFooterCard>
                <TextEmpresa fontSize={17} weight={600}>
                  Subtotal:{" "}
                  {totalEmpresa.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TextEmpresa>
                <TextEmpresa fontSize={17} weight={600}>
                  Total:{" "}
                  {isCalculandoFrete ||
                  freteDoPedido === null ||
                  freteDoPedido === undefined
                    ? "Calculando..."
                    : (
                        calcularSubtotalDetalhePedido(
                          produtosExibir,
                          quantidades[empresaIndex]
                        ) + Number(freteDoPedido)
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  {/* {(
                    calcularSubtotalDetalhePedido(
                      produtosExibir,
                      quantidades[empresaIndex]
                    ) + Number(freteDoPedido)
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })} */}
                </TextEmpresa>
              </ContainerFooterCard>
            </React.Fragment>
          );
        })}
      </ContainerCardEmpresa>
    </ScrollView>
  );
};

export default CardDetalhePedidoEmAberto;
