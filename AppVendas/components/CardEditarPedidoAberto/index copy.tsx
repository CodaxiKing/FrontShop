import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  ButtonCancel,
  ButtonConfirm,
  ButtonText,
  ButtonTextBlue,
  ContainerButtonsFooter,
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
  InputQuantidade,
  ItemPedido,
  TextEmpresa,
} from "./style";
import { ProdutoPedido } from "@/context/interfaces/NovoPedidoItem";
import { Endereco } from "@/context/interfaces/CarteiraClienteItem";
import * as SQLite from "expo-sqlite";
import ErroAdicao from "./ErrosCarrinho/ErroAdicao";
import { IProdutoLoja } from "../CardProdutoCatalogo/index";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import AuthContext from "@/context/AuthContext";
import { useTopContext } from "@/context/TopContext";
import { useMenuContext } from "@/context/MenuProvider";
import { ImagemProdutoContainer } from "../CardDetalhePedidoEmAberto/style";
import { RootStackParamList } from "@/types/types";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import IconesCardEditarPedidoAberto from "./IconesCardEditarPedidoAberto";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";

const db = SQLite.openDatabaseSync("user_data.db");

interface CardEditarPedidoAbertoRouteParams {
  pedidoId?: number;
  cpfCnpj?: string;
}

export const CardEditarPedidoAberto: React.FC = ({}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { cpfCnpj, pedidoId } =
    route.params as CardEditarPedidoAbertoRouteParams;
  const {
    carrinho,
    atualizarQuantidade,
    carregarCarrinho,
    removerProduto,
    removerProdutoSemAviso,
    validarEReajustarExpositores,
  } = useEditarPedidoAberto();
  const [carrinhoInfo, setCarrinhoInfo] = useState<any>([]);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { userData } = useContext(AuthContext);
  const { selectedTabelaPrecoContext } = useClientInfoContext();
  const representanteId = userData?.representanteId;
  const { lojasSelecionadas } = useMenuContext();
  const [dadosLojas, setDadosLojas] = useState<{
    [key: string]: { razaoSocial: string; enderecoEntrega: string };
  }>({});
  const [deveAtualizarCarrinho, setDeveAtualizarCarrinho] = useState(false);
  const [jaCarregado, setJaCarregado] = useState(false);

  const carrinhosAgrupadosPorCnpj = useMemo(() => {
    return carrinho.reduce((acc, produto) => {
      const cnpj = produto.cpfCnpj || "CNPJ_INDEFINIDO";
      if (!acc[cnpj]) acc[cnpj] = [];
      acc[cnpj].push(produto);
      return acc;
    }, {} as Record<string, IProdutoLoja[]>);
  }, [carrinho]);

  // Dispara **somente** quando alguma quantidade de relógio mudar
  const qtdRelogiosPorProduto = useMemo(
    () =>
      carrinho
        .filter((p) => p.tipo === "R")
        .map((p) => p.quantidade)
        .join(","),
    [carrinho]
  );

  // // 1️⃣ UseEffect que dispara sempre que o carrinho mudar
  // useEffect(() => {
  //   adjustExpositores();
  // }, [qtdRelogiosPorProduto]);

  // useEffect(() => {
  //   if (!jaCarregado) {
  //     // primeira vez: só marca como carregado, não chama adjustExpositores
  //     console.log(
  //       "Primeira vez que carrega o carrinho, não chama ajuste de expositores."
  //     );
  //     setJaCarregado(true);
  //     return;
  //   }
  //   // a partir da segunda vez (ou seja, quando o usuário realmente alterar
  //   // o relógio), aí sim chama a sincronização automática
  //   console.log("Chamando ajuste de expositores após alteração no carrinho.");
  //   adjustExpositores();
  // }, [qtdRelogiosPorProduto]);

  useEffect(() => {
    if (representanteId && cpfCnpj && pedidoId && deveAtualizarCarrinho) {
      fetchPedidoData(representanteId, pedidoId);
      fetchDadosLoja(cpfCnpj);
      setDeveAtualizarCarrinho(false); // reseta após atualizar
    }
  }, [representanteId, cpfCnpj]);

  useEffect(() => {
    if (pedidoId && representanteId) {
      refreshCarrinhoData();
    } else {
      setIsLoading(false);
      Alert.alert(
        "Erro",
        "Nenhum carrinho/CNPJ foi encontrado para este cliente."
      );
      navigation.goBack();
    }
  }, [lojasSelecionadas, refreshKey]);

  // Função auxiliar para completar dados de produto
  const preencherDadosProduto = async (produto) => {
    let catalogo: any[] = [];
    let imagemUrl = null;
    let precoOriginalSemDesconto: number | null = 0;

    try {
      // if (produto.nomeEcommerce && produto.imagem) return produto;

      if (produto.tipo === "E") {
        const catalogoQuery = `SELECT nomeEcommerce, imagens, codigoMarca FROM Expositor WHERE codigo = ?;`;
        catalogo = await db.getAllAsync(catalogoQuery, [produto.codigo]);
      } else {
        const catalogoQuery = `SELECT nomeEcommerce, imagens, codigoMarca FROM Catalogo WHERE codigo = ?;`;
        catalogo = await db.getAllAsync(catalogoQuery, [produto.codigo]);
      }

      const imagens = JSON.parse(catalogo[0].imagens || "[]");
      imagemUrl = imagens[0]?.imagemUrl || "";

      // console.log("== Produto encontrado:", catalogo);

      // Resgata o preço original sem desconto do produto para usar no cálculo do total
      const precoOriginalSemDescontoQuery = `SELECT precoUnitario FROM Catalogo WHERE codigo = ?;`;
      const precoOriginalSemDescontoResult = await db.getAllAsync(
        precoOriginalSemDescontoQuery,
        [produto.codigo]
      );

      precoOriginalSemDesconto =
        precoOriginalSemDescontoResult[0]?.precoUnitario || 0;

      // console.log("=== precoOriginalSemDesconto", precoOriginalSemDesconto);

      return {
        ...produto,
        nomeEcommerce: catalogo.nomeEcommerce || produto.nomeEcommerce,
        codigoMarca: catalogo[0].codigoMarca || produto.codigoMarca,
        imagem: imagemUrl ? { uri: imagemUrl } : "",
        precoOriginalSemDesconto,
      };
    } catch (e) {
      console.warn("Erro ao parsear imagens do catalogo", e);
    }
  };

  const fetchPedidoData = async (representanteId: string, pedidoId: number) => {
    setIsLoading(true);
    try {
      const query = `SELECT * FROM Pedido WHERE id = ? AND representanteId = ?;`;
      const result = await db.getAllAsync(query, [pedidoId, representanteId]);
      if (result.length > 0) {
        const pedidoData = result[0];
        setCarrinhoInfo(pedidoData);
        let produtos = [];
        try {
          produtos = JSON.parse(pedidoData.produtos || "[]");
        } catch (error) {
          console.error("Erro ao parsear produtos:", error);
        }
        const produtosCompletos = await Promise.all(
          produtos.map(async (produto) => {
            const completo = await preencherDadosProduto(produto);

            return {
              ...completo,
              cpfCnpj: pedidoData.cpfCnpj, // sempre injeta o cpfCnpj
            };
          })
        );

        await carregarCarrinho(produtosCompletos);

        // ✅ Chama o fetchDadosLoja usando o CPF/CNPJ que vem do banco
        fetchDadosLoja(pedidoData.cpfCnpj);
      } else {
        setCarrinhoInfo([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("Dados do pedido:", carrinhoInfo);

  const fetchDadosLoja = async (cpfCnpj: string) => {
    try {
      const clienteQuery = `SELECT enderecos, razaoSocial FROM CarteiraCliente WHERE cpfCnpj = ?;`;
      const clienteResult: { enderecos?: string; razaoSocial?: string }[] =
        await db.getAllAsync(clienteQuery, [cpfCnpj]);

      if (clienteResult.length > 0) {
        const enderecos = JSON.parse(clienteResult[0]?.enderecos || "[]");

        // Pega o endereço do tipo 1, se houver, senão o primeiro
        const enderecoPrincipal =
          enderecos.find((e: any) => e.tipo === 1) || enderecos[0];

        const enderecoFormatado = enderecoPrincipal
          ? `${enderecoPrincipal.endereco}, ${
              enderecoPrincipal.complemento ?? ""
            }, ${enderecoPrincipal.bairro ?? ""} - ${
              enderecoPrincipal.municipio ?? ""
            } / ${enderecoPrincipal.estado ?? ""}`
          : "Endereço não disponível";

        setDadosLojas((prev) => ({
          ...prev,
          [cpfCnpj]: {
            razaoSocial: clienteResult[0].razaoSocial || "Loja não encontrada",
            enderecoEntrega: enderecoFormatado,
          },
        }));
      } else {
        setEnderecosCliente([]);
      }
    } catch (error) {
      console.error("Erro ao buscar endereços do cliente:", error);
    }
  };

  const refreshCarrinhoData = () => {
    setIsLoading(true);
    if (pedidoId && representanteId) {
      fetchPedidoData(representanteId, pedidoId);
    } else {
      setIsLoading(false);
    }
  };

  // 2️⃣ Função de ajuste de expositores
  const adjustExpositores = async () => {
    // 1.1) separa expositores e relógios
    const expositores = carrinho.filter((p) => p.tipo === "E");
    const relogios = carrinho.filter((p) => p.tipo === "R");
    if (!expositores.length || !relogios.length) return;

    // 1.2) busca marca de cada expositor
    const expPlaceholders = expositores.map(() => "?").join(",");
    const expRows: any[] = await db.getAllAsync(
      `SELECT codigo, codigoMarca FROM Expositor WHERE codigo IN (${expPlaceholders})`,
      expositores.map((e) => e.codigo)
    );
    const mapExpoMarca = new Map(expRows.map((r) => [r.codigo, r.codigoMarca]));

    // 1.3) busca marca de cada relógio
    const relPlaceholders = relogios.map(() => "?").join(",");
    const relRows: any[] = await db.getAllAsync(
      `SELECT codigo, codigoMarca FROM Catalogo WHERE codigo IN (${relPlaceholders})`,
      relogios.map((r) => r.codigo)
    );
    const mapRelMarca = new Map(relRows.map((r) => [r.codigo, r.codigoMarca]));

    // 1.4) busca marcas que o cliente já comprou
    const comprouRows: any[] = await db.getAllAsync(
      `SELECT DISTINCT codigoMarca FROM QuemComprouCliente WHERE cpfCnpj = ?`,
      [cpfCnpj]
    );
    const marcasCompradas = new Set(comprouRows.map((r) => r.codigoMarca));

    // 1.5) para cada expositor, soma só os relógios da mesma marca e aplica limite
    for (const expo of expositores) {
      const marcaExpo = mapExpoMarca.get(expo.codigo)!;
      // soma só onde o código bate
      const totalRelogiosMarca = relogios
        .filter((r) => mapRelMarca.get(r.codigo) === marcaExpo)
        .reduce((sum, r) => sum + r.quantidade, 0);

      const limite = marcasCompradas.has(marcaExpo)
        ? Math.round(totalRelogiosMarca * 0.7)
        : totalRelogiosMarca;

      // “quero sincronizar o expositor sempre que o relógio mudar"
      if (expo.quantidade !== limite) {
        atualizarQuantidade(expo.codigo, limite);
      }
      // “só sincronizo quando o expositor estiver acima do limite”
      // if (expo.quantidade > limite) {
      //   atualizarQuantidade(expo.codigo, limite);
      // }

      // else {
      //   Alert.alert(
      //     "Limite de expositores",
      //     `Você atingiu o limite de expositores.`
      //   );
      // }
    }
  };

  const incrementQuantity = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo);
    if (item) {
      // 1) atualiza o relógio
      atualizarQuantidade(codigo, item.quantidade + 1);

      // 2) espera o React aplicar o estado
      await new Promise((resolve) => setTimeout(resolve, 0));

      // 3) só então reajusta os expositores com o novo estado
      // adjustExpositores();
    }
  };

  const incrementQuantityExpositor = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo && p.tipo === "E");
    if (item) {
      // Aplica a regra de 70% ou 100% ao incrementar a quantidade
      const qtdRelogios = carrinho
        .filter((p) => p.tipo === "R")
        .reduce((acc, p) => acc + p.quantidade, 0);

      // console.log("Quantidade de relógios:", qtdRelogios);

      // Buscando as marcas dos relógios no carrinho
      const marcasRelogiosNoCarrinho = carrinho
        .filter((produto) => produto.tipo === "R") // Filtra apenas os relógios
        .map((produto) => produto.codigoMarca); // Pega as marcas dos relógios

      // console.log("Marcas dos relógios no carrinho:", marcasRelogiosNoCarrinho);

      // Buscando as marcas compradas pelo cliente
      const queryQuemComprou = `
        SELECT DISTINCT codigoMarca FROM QuemComprouCliente 
        WHERE cpfCnpj = ?
      `;
      const resultQuemComprou = await db.getAllAsync(queryQuemComprou, [
        cpfCnpj || "",
      ]);
      const marcasCompradas = resultQuemComprou.map((r: any) => r.codigoMarca);

      // console.log("Marcas compradas:", marcasCompradas);

      // Verificando se a marca do expositor está entre as marcas compradas
      const limite = marcasCompradas.includes(item.codigoMarca)
        ? Math.round(qtdRelogios * 0.7)
        : qtdRelogios;

      // console.log("Limite Calculado: ", limite);
      // console.log("Quantidade Atual do Expositor: ", item.quantidade);

      // Buscando a descrição da marca para exibir no alerta
      const queryDescricaoMarca = `
        SELECT descricaoMarca FROM Expositor WHERE codigo = ?
      `;
      const resultDescricaoMarca = await db.getFirstAsync(queryDescricaoMarca, [
        item.codigo,
      ]);
      const descricaoMarca =
        resultDescricaoMarca?.descricaoMarca || "Marca desconhecida";

      // Verificando se a quantidade do expositor não ultrapassa o limite
      if (item.quantidade < limite) {
        atualizarQuantidade(codigo, item.quantidade + 1);
      }
      // else {
      //   Alert.alert(
      //     "Limite Excedido",
      //     `Você atingiu o limite de expositores para a marca ${descricaoMarca}.`
      //   );
      // }

      // Após o incremento ou decremento, ajusta os expositores se necessário
      // adjustExpositores();
    }
  };

  const decrementQuantity = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo);
    if (item && item.quantidade > 0) {
      atualizarQuantidade(codigo, item.quantidade - 1);
      await new Promise((resolve) => setTimeout(resolve, 0));
      // adjustExpositores();
    } else {
      removerProduto(codigo);
    }
  };

  // Função para decrementar a quantidade do expositor diretamente
  const decrementQuantityExpositor = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo && p.tipo === "E");
    if (!item || item.quantidade === 0) {
      return Alert.alert("Erro", "Não é possível diminuir mais a quantidade.");
    }
    // só decrementa aqui
    atualizarQuantidade(codigo, item.quantidade - 1);

    // Após o decremento, verifica se o expositor ainda está dentro do limite
    // await adjustExpositores();
  };

  const buscarMarcaPorCodigoExpositor = async (codigoExpositor: string) => {
    try {
      const result = await db.getFirstAsync(
        "SELECT descricaoMarca FROM Expositor WHERE codigo = ?",
        [codigoExpositor]
      );
      return result?.descricaoMarca || "Marca desconhecida";
    } catch {
      return "Marca desconhecida";
    }
  };

  const validarLimiteExpositoresEditarPedido = async (
    carrinhoContexto: ProdutoPedido[],
    cpfCnpj: string
  ): Promise<{ valido: boolean; mensagem?: string }> => {
    try {
      const produtosCarrinho = carrinhoContexto;
      if (produtosCarrinho.length === 0) {
        // console.log("🟢 Carrinho vazio. Liberação automática.");
        return { valido: true };
      }

      const codigosUnicos = new Set(produtosCarrinho.map((p) => p.codigo));

      const queryCatalogo = `
      SELECT codigo, codigoMarca FROM Catalogo 
      WHERE codigo IN (${[...codigosUnicos].map((c) => `'${c}'`).join(",")})
    `;
      const resultCatalogo = await db.getAllAsync(queryCatalogo);

      const mapCodigoMarca = new Map<string, string>();
      resultCatalogo.forEach((item: any) => {
        mapCodigoMarca.set(item.codigo, item.codigoMarca);
      });

      const codigosSemMarca = [...codigosUnicos].filter(
        (codigo) => !mapCodigoMarca.has(codigo)
      );

      if (codigosSemMarca.length > 0) {
        const queryExpositor = `
        SELECT codigo, codigoMarca FROM Expositor 
        WHERE codigo IN (${codigosSemMarca.map((c) => `'${c}'`).join(",")})
      `;
        const resultExpositor = await db.getAllAsync(queryExpositor);
        resultExpositor.forEach((item: any) => {
          mapCodigoMarca.set(item.codigo, item.codigoMarca);
        });
      }

      const queryDescricaoMarca = `
      SELECT DISTINCT codigoMarca, descricaoMarca FROM Expositor
    `;
      const resultDescricaoMarca = await db.getAllAsync(queryDescricaoMarca);
      const mapDescricaoMarca = new Map<string, string>();
      resultDescricaoMarca.forEach((item: any) => {
        mapDescricaoMarca.set(item.codigoMarca, item.descricaoMarca);
      });

      const queryQuemComprou = `
      SELECT DISTINCT codigoMarca FROM QuemComprouCliente 
      WHERE cpfCnpj = ?
    `;
      const resultQuemComprou = await db.getAllAsync(queryQuemComprou, [
        cpfCnpj,
      ]);
      const marcasCompradas = resultQuemComprou.map((r: any) => r.codigoMarca);

      const relogiosPorMarca = new Map<string, number>();
      const expositoresPorCodigo = new Map<string, number>();

      produtosCarrinho.forEach((p) => {
        const marca = mapCodigoMarca.get(p.codigo);
        if (!marca) return;

        const qtd = p.quantidade || 0;

        if (p.tipo === "R") {
          relogiosPorMarca.set(marca, (relogiosPorMarca.get(marca) || 0) + qtd);
        } else if (p.tipo === "E") {
          expositoresPorCodigo.set(p.codigo, qtd);
        }
      });

      // Validação dos expositores
      for (const [codigoExpositor, qtdExpositor] of expositoresPorCodigo) {
        const codigoMarca = mapCodigoMarca.get(codigoExpositor);
        const nomeMarca =
          mapDescricaoMarca.get(codigoMarca || "") || codigoMarca;

        const qtdRelogios = relogiosPorMarca.get(codigoMarca || "") || 0;
        const limite =
          marcasCompradas.includes(codigoMarca) && qtdRelogios > 0
            ? Math.round(qtdRelogios * 0.7)
            : qtdRelogios;

        if (qtdExpositor > limite) {
          const excesso = qtdExpositor - limite;

          return {
            valido: false,
            mensagem:
              `A marca ${nomeMarca} excedeu o limite de expositores.\n\n` +
              `🕒 Relógios no carrinho: ${qtdRelogios}\n🎁 Expositores: ${qtdExpositor}\n` +
              `📉 Limite permitido: ${limite}\n🚫 Excesso: ${excesso}\n\n` +
              `⚠️ Ajuste a quantidade de expositores para continuar.`,
          };
        }
      }

      return { valido: true };
    } catch (error) {
      console.error("❌ Erro ao validar limite de expositores:", error);
      return {
        valido: false,
        mensagem: "Erro inesperado ao validar limite de expositores.",
      };
    }
  };

  const handleRemoverProduto = async (codigoProduto: string) => {
    const itemRemovido = carrinho.find((p) => p.codigo === codigoProduto);
    if (!itemRemovido) return;

    // console.log("Item Removido:", itemRemovido);

    // Se for um relógio, e este for o último da sua marca, remove também todos os expositores daquela marca de uma vez
    if (itemRemovido.tipo === "R") {
      const aindaTemRelogioMesmaMarca = carrinho.some(
        (p) =>
          p.tipo === "R" &&
          p.codigoMarca === itemRemovido.codigoMarca &&
          p.codigo !== codigoProduto
      );

      // Se não houver mais relógios da mesma marca
      if (!aindaTemRelogioMesmaMarca) {
        const expositorParaRemover = carrinho
          .filter(
            (p) => p.tipo === "E" && p.codigoMarca === itemRemovido.codigoMarca
          )
          .map((p) => p.codigo);

        // const expositorParaRemover = carrinho
        //   .filter((p) => p.tipo === "E" && p.codigo === itemRemovido.codigo)
        //   .map((p) => p.codigo);

        // console.log("Expositores para remover:", expositorParaRemover);
        if (expositorParaRemover.length) {
          return Alert.alert(
            "Remover Produto",
            `Você tem certeza que deseja remover o produto do pedido?\n` +
              `O(s) expositor(res) correspondente(s) será(ão) removido(s)!`,
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "OK",
                onPress: () => {
                  // remove o relógio
                  removerProdutoSemAviso(codigoProduto);
                  // remove todos os expositores da marca de uma vez
                  expositorParaRemover.forEach((cod) =>
                    removerProdutoSemAviso(cod)
                  );
                  // Atualiza o carrinho após a remoção
                  const novoCarrinho = carrinho.filter(
                    (p) =>
                      p.codigo !== codigoProduto &&
                      !expositorParaRemover.includes(p.codigo)
                  );
                  // Se depois disso, não restar mais nada no carrinho, exclui pedido
                  if (novoCarrinho.length === 0 && carrinhoInfo?.id) {
                    Alert.alert(
                      "Removendo pedido",
                      "Este é o último produto do pedido. Excluindo pedido.",
                      [
                        {
                          text: "Ok",
                          style: "destructive",
                          onPress: async () => {
                            // Exclui o pedido no banco
                            try {
                              await db.runAsync(
                                `DELETE FROM Pedido WHERE id = ?`,
                                [carrinhoInfo.id]
                              );
                            } catch (e) {
                              console.error("Erro ao excluir pedido:", e);
                              Alert.alert(
                                "Erro",
                                "Não foi possível excluir o pedido."
                              );
                            }
                            // Navega de volta
                            navigation.navigate("PedidosEmAberto");
                          },
                        },
                      ]
                    );
                  }
                },
              },
            ]
          );
        }
      }
    }

    // Se depois de remover o item não restar mais nada no carrinho, pergunta se exclui o pedido
    const novoCarrinho = carrinho.filter((p) => p.codigo !== codigoProduto);
    // console.log("Chegou no novo carrinho:", novoCarrinho);
    if (novoCarrinho.length === 0) {
      return Alert.alert(
        "Remover último produto",
        "Este é o último produto do pedido. Excluindo pedido.",
        [
          {
            text: "Ok",
            style: "destructive",
            onPress: async () => {
              // Exclui o pedido no banco
              try {
                await db.runAsync(`DELETE FROM Pedido WHERE id = ?`, [
                  carrinhoInfo.id,
                ]);
              } catch (e) {
                console.error("Erro ao excluir pedido:", e);
                Alert.alert("Erro", "Não foi possível excluir o pedido.");
              }
              // Navega de volta
              navigation.navigate("PedidosEmAberto");
            },
          },
        ]
      );
    }

    // Caso contrário, apenas remove o item normalmente
    removerProduto(codigoProduto);
  };

  // const handleRemoverProduto = async (codigoProduto: string) => {
  //   const novoCarrinho = carrinho.filter((p) => p.codigo !== codigoProduto);

  //   const isUltimoProduto = novoCarrinho.length === 0;

  //   if (isUltimoProduto) {
  //     Alert.alert(
  //       "Remover último produto",
  //       "Este é o último produto do pedido. Deseja realmente remover e excluir o pedido?",
  //       [
  //         {
  //           text: "Cancelar",
  //           style: "cancel",
  //         },
  //         {
  //           text: "Remover e excluir pedido",
  //           style: "destructive",
  //           onPress: async () => {
  //             removerProduto(codigoProduto);
  //             if (carrinhoInfo?.id) {
  //               try {
  //                 await db.runAsync(`DELETE FROM Pedido WHERE id = ?`, [
  //                   carrinhoInfo.id,
  //                 ]);
  //                 Alert.alert(
  //                   "Pedido excluído",
  //                   "Todos os produtos foram removidos. O pedido foi excluído."
  //                 );
  //                 navigation.navigate("PedidosEmAberto");
  //               } catch (error) {
  //                 console.error("Erro ao excluir pedido:", error);
  //                 Alert.alert("Erro", "Não foi possível excluir o pedido.");
  //               }
  //             }
  //           },
  //         },
  //       ]
  //     );
  //   } else {
  //     // Não é o último produto, pode remover direto
  //     removerProduto(codigoProduto);
  //   }
  // };

  const salvarCarrinhoNoBanco = async () => {
    const isValid = await validarEReajustarExpositores();

    if (isValid === undefined || isValid === false) {
      // Verifica expositores em excesso
      const expositoresComExcesso = carrinho.filter((produto) => {
        return produto.tipo === "E" && produto.quantidade < 0;
      });

      if (expositoresComExcesso.length > 0) {
        let mensagem =
          "Os seguintes expositores estão com quantidade em excesso:\n\n";

        for (const expositor of expositoresComExcesso) {
          const nomeMarca = await buscarMarcaPorCodigoExpositor(
            expositor.codigo
          );
          mensagem += `• ${nomeMarca}: ${Math.abs(
            expositor.quantidade
          )} excedente\n`;
        }

        Alert.alert("Ajuste necessário", mensagem);
      }

      return undefined;
    }

    try {
      const produtosFiltrados = carrinho.map((produto) => ({
        codigo: produto.codigo,
        nomeEcommerce: produto.nomeEcommerce,
        quantidade: produto.quantidade,
        precoUnitario: produto.precoUnitario,
        tipo: produto.tipo,
        imagem: produto.imagem,
        cpfCnpj: produto.cpfCnpj,
      }));

      const quantidadeItens = produtosFiltrados
        .filter((p) => p.tipo === "R")
        .reduce((acc, p) => acc + p.quantidade, 0);

      const quantidadePecas = produtosFiltrados.reduce(
        (acc, p) => acc + p.quantidade,
        0
      );

      const valorTotal = produtosFiltrados.reduce(
        (acc, p) => acc + p.quantidade * p.precoUnitario,
        0
      );

      const produtosJson = JSON.stringify(produtosFiltrados);

      await db.runAsync(
        `UPDATE Pedido SET produtos = ?, quantidadeItens = ?, quantidadePecas = ?, valorTotal = ? WHERE id = ?;`,
        [
          produtosJson,
          quantidadeItens,
          quantidadePecas,
          valorTotal,
          carrinhoInfo.id,
        ]
      );

      // console.log("Pedido salvo com sucesso no banco!");
      return true;
    } catch (error) {
      console.error("Erro ao salvar pedido no banco:", error);
      return false;
    }
  };

  const LoadingComponent = () => (
    <View
      style={{
        flex: 1,
        height: 400,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 15, fontSize: 16 }}>Carregando dados...</Text>
    </View>
  );

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LoadingComponent />
      </ScrollView>
    );
  }

  if (!carrinhoInfo || carrinho.length === 0) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ErroAdicao />
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      {Object.entries(carrinhosAgrupadosPorCnpj).map(
        ([cpfCnpj, produtosLoja], index) => {
          const dadosLoja = dadosLojas[cpfCnpj] || {
            razaoSocial: "Loja não encontrada",
            enderecoEntrega: "Endereço não disponível",
          };

          // console.log("Produtos da loja:", produtosLoja);

          return (
            <ContainerCardEmpresa key={`${cpfCnpj}-${index}`}>
              <ContentCardEmpresa>
                <HeaderCardEmpresa>
                  <ContainerNomeEmpresa>
                    <TextEmpresa fontSize={16} weight={700}>
                      Loja: {dadosLoja.razaoSocial}
                    </TextEmpresa>
                    <TextEmpresa fontSize={14} weight={400}>
                      {dadosLoja.enderecoEntrega}
                    </TextEmpresa>
                  </ContainerNomeEmpresa>
                  <IconesCardEditarPedidoAberto
                    enderecosCliente={enderecosCliente}
                    carrinhoInfo={carrinhoInfo}
                    cpfCnpjSelecionado={cpfCnpj}
                    setCarrinhoInfo={() => {}}
                    onConfirmarExpositores={async () => {
                      setDeveAtualizarCarrinho(true);
                    }}
                  />
                </HeaderCardEmpresa>
                <ContainerPedido>
                  {produtosLoja.map((produto, produtoIndex) => (
                    <ItemPedido
                      key={`${cpfCnpj}-${produto.codigo || produtoIndex}`}
                    >
                      <ImagemProdutoContainer>
                        <ImagemProduto
                          source={
                            produto.imagem
                              ? { uri: produto.imagem.uri }
                              : { uri: "" }
                          }
                        />
                      </ImagemProdutoContainer>
                      <DetalhesPedido>
                        <ContainerTextItemPedido>
                          <TextEmpresa fontSize={14} weight={600}>
                            {produto.codigo}
                          </TextEmpresa>
                          <TextEmpresa fontSize={14} weight={400}>
                            {produto.nomeEcommerce}
                          </TextEmpresa>
                        </ContainerTextItemPedido>
                        <ContainerTextItemPedido>
                          <ContainerQuantidade>
                            <TouchableOpacity
                              onPress={() => {
                                atualizarQuantidade(
                                  produto.codigo,
                                  produto.quantidade - 1
                                );
                              }}
                              // onPress={() => {
                              //   if (produto.tipo === "E") {
                              //     console.log("Decrementando expositor");
                              //     decrementQuantityExpositor(produto.codigo);
                              //   } else {
                              //     console.log("Decrementando relógio");
                              //     decrementQuantity(produto.codigo);
                              //   }
                              // }}
                              // onPress={() => decrementQuantity(produto.codigo)}
                            >
                              <Ionicons name="remove" size={38} color="black" />
                            </TouchableOpacity>

                            <InputQuantidade
                              value={produto.quantidade?.toString()}
                              // onEndEditing={async () => {
                              //   produto.tipo === "R"
                              //     ? await adjustExpositores()
                              //     : null;
                              // }}
                              onChangeText={(event) => {
                                const value =
                                  parseInt(event.replace(/[^0-9]/g, ""), 10) ||
                                  0;
                                atualizarQuantidade(produto.codigo, value);
                              }}
                              // onChangeText={(e) => {
                              //   const newValue = e.replace(/[^0-9]/g, "");
                              //   if (newValue) {
                              //     atualizarQuantidade(
                              //       produto.codigo,
                              //       parseInt(newValue)
                              //     );
                              //   }
                              // }}
                              maxLength={8}
                              keyboardType="number-pad"
                              style={{ width: 100, textAlign: "center" }}
                            />

                            <TouchableOpacity
                              onPress={() => {
                                atualizarQuantidade(
                                  produto.codigo,
                                  produto.quantidade + 1
                                );
                              }}
                              // onPress={() => {
                              //   if (produto.tipo === "E") {
                              //     console.log("Incrementando expositor");
                              //     incrementQuantityExpositor(produto.codigo);
                              //   } else {
                              //     console.log("Incrementando relógio");
                              //     incrementQuantity(produto.codigo);
                              //   }
                              // }}
                              // onPress={() => incrementQuantity(produto.codigo)}
                            >
                              <Feather name="plus" size={38} color="black" />
                            </TouchableOpacity>

                            <Text style={{ fontSize: 18 }}>
                              {(
                                produto.quantidade * produto.precoUnitario
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
                      <TouchableOpacity
                        onPress={
                          () => {
                            handleRemoverProduto(produto.codigo);
                          } // Chama a função de remoção
                        }
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: "#fff",
                          right: 20,
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesome
                          name="trash"
                          size={28}
                          color="#ff4f45"
                          style={{ padding: 10 }}
                        />
                      </TouchableOpacity>
                    </ItemPedido>
                  ))}
                </ContainerPedido>
              </ContentCardEmpresa>
              <ContainerFooterCard>
                <TextEmpresa fontSize={17} weight={600}>
                  Total:{" "}
                  {produtosLoja
                    .reduce(
                      (total, produto) =>
                        total + produto.quantidade * produto.precoUnitario,
                      0
                    )
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </TextEmpresa>
              </ContainerFooterCard>
            </ContainerCardEmpresa>
          );
        }
      )}
      <ContainerButtonsFooter>
        <ButtonCancel onPress={() => navigation.navigate("PedidosEmAberto")}>
          <ButtonTextBlue>Cancelar</ButtonTextBlue>
        </ButtonCancel>
        <ButtonConfirm
          onPress={async () => {
            const resultado = await validarLimiteExpositoresEditarPedido(
              carrinho,
              cpfCnpj
            );
            if (!resultado.valido) {
              Alert.alert("Ajuste necessário", resultado.mensagem || "");
              return;
            }

            const sucesso = await salvarCarrinhoNoBanco();

            if (sucesso === true) {
              Alert.alert("Pedido Salvo", "O pedido foi editado com sucesso!", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("PedidosEmAberto"),
                },
              ]);
            } else if (sucesso === false) {
              Alert.alert("Erro", "Não foi possível salvar o pedido.");
            }
          }}
        >
          <ButtonText>Salvar Pedido</ButtonText>
          <FontAwesome name="lock" size={24} color="white" />
        </ButtonConfirm>
      </ContainerButtonsFooter>
    </ScrollView>
  );
};
