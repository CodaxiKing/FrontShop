import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

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
import ButtonsCarrinhoCheck from "./ButtonsCarrinhoCheck";

import {
  NovoPedidoItem,
  ProdutoPedido,
} from "@/context/interfaces/NovoPedidoItem";
import { Endereco } from "@/context/interfaces/CarteiraClienteItem";
import { useMenuContext } from "@/context/MenuProvider";

import * as SQLite from "expo-sqlite";
import ErroAdicao from "./ErrosCarrinho/ErroAdicao";
import { RouteProp } from "@react-navigation/native";
import { IProdutoLoja } from "../CardProdutoCatalogo/index";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import AuthContext from "@/context/AuthContext";
import { useTopContext } from "@/context/TopContext";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import { calcularSubtotalCarrinho } from "@/utils/subtotalComDescontoCarrinho";
import { formatarEnderecoCompleto } from "@/utils/formatEndereco";
const db = SQLite.openDatabaseSync("user_data.db");

type RootStackParamList = {
  CardCarrinho: {
    pedidoId?: number;
    clienteId?: number;
    cpfCnpj?: string;
    refreshKey: number;
  };
};

interface CardCarrinhoProps {
  refreshKeyLojas: number;
}

const CardCarrinho: React.FC<CardCarrinhoProps> = ({ refreshKeyLojas }) => {
  type CardCarrinhoNavigationProp = StackNavigationProp<
    RootStackParamList,
    "CardCarrinho"
  >;

  const navigation = useNavigation<CardCarrinhoNavigationProp>();
  type CardCarrinhoRouteProp = RouteProp<RootStackParamList, "CardCarrinho">;
  const route = useRoute<CardCarrinhoRouteProp>();
  const { pedidoId, clienteId, cpfCnpj } = route.params || {};

  const [produtos, setProdutos] = useState<ProdutoPedido[]>([]);
  const [carrinhoInfo, setCarrinhoInfo] = useState<any>(null);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [enderecoSelecionado, setEnderecoSelecionado] =
    useState<Endereco | null>(null);
  const [razaoSocialCliente, setRazaoSocialCliente] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Estado para forçar re-renderização
  const [isNavigatingBack, setIsNavigatingBack] = useState(false); // Flag para controlar navegação
  const [isLoading, setIsLoading] = useState(false); // Flag para indicar carregamento
  const [carregandoDados, setCarregandoDados] = useState(true); // Flag para o carregamento inicial
  const [dadosLojas, setDadosLojas] = useState<{
    [key: string]: { razaoSocial: string; enderecoEntrega: string };
  }>({});

  const {
    selectedTabelaPrecoContext,
    produtosFiltradosTabelaPrecoContext,
    setClientInfo,
    selectedClientContext,
  } = useClientInfoContext();

  const razaoSocialContext = String(selectedClientContext?.razaoSocial);
  const clienteIdContext = String(selectedClientContext?.clienteId);
  const cpfCnpjContext = String(selectedClientContext?.cpfCnpj);

  const { userData } = useContext(AuthContext);
  const { updateCarrinhosCount } = useTopContext();
  const representanteId = userData?.representanteId;

  const { getLojasSelecionadasParaCliente, setLojasParaCliente } =
    useMenuContext();
  const lojasSelecionadas = getLojasSelecionadasParaCliente(cpfCnpj || "");

  const [carrinhos, setCarrinhos] = useState<IProdutoLoja[]>([]);

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  // Mapa para acompanhar quais produtos estão sendo removidos
  const [removingProducts, setRemovingProducts] = useState<{
    [key: string]: boolean;
  }>({});

  const executouInicialmenteRef = useRef(false);

  // Função para atualizar os dados do carrinho
  const refreshCarrinhoData = () => {
    setCarregandoDados(true); // Indicar que os dados estão sendo carregados
    if (cpfCnpj) {
      Promise.all([
        fetchCarrinhoProdutos(cpfCnpj),
        fetchEnderecosCliente(cpfCnpj),
      ]).finally(() => {
        // Após concluir as operações, desativa o indicador de carregamento
        setCarregandoDados(false);
      });
    } else {
      setCarregandoDados(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    if (cpfCnpj) {
      fetchEnderecosCliente(cpfCnpj); // Carrega os endereços do cliente
    }
  }, [cpfCnpj]);

  // Carrega o endereço do pedido, caso o pedidoId exista
  useEffect(() => {
    if (cpfCnpj && pedidoId) {
      fetchEnderecoPedido(cpfCnpj, pedidoId); // Carrega o endereço do pedido
    }
  }, [cpfCnpj, pedidoId]);

  // Atualizar os dados do Cliente no Context
  useEffect(() => {
    if (cpfCnpj && razaoSocialCliente) {
      setClientInfo({
        cpfCnpjContext: cpfCnpj,
        clienteIdContext: clienteId,
        razaoSocialContext: razaoSocialCliente,
        selectedTabelaPrecoContext: selectedTabelaPrecoContext,
        produtosFiltradosTabelaPrecoContext:
          produtosFiltradosTabelaPrecoContext,
        selectedClientContext: {
          cpfCnpj: cpfCnpj.toString(),
          clienteId: clienteId?.toString(),
          razaoSocial: razaoSocialCliente,
          enderecoCompleto: enderecosCliente[0]?.endereco || "",
          enderecos: enderecosCliente,
        },
      });
    }
  }, [cpfCnpj, clienteId, razaoSocialCliente]);

  // 1. Rodar apenas 1x ao montar (com proteção)
  useEffect(() => {
    if (!cpfCnpj) {
      setCarregandoDados(false);
      Alert.alert(
        "Erro",
        "Nenhum carrinho/CNPJ foi encontrado para este cliente."
      );
      navigation.goBack();
      return;
    }

    if (!executouInicialmenteRef.current) {
      executouInicialmenteRef.current = true;
      refreshCarrinhoData();
    }
  }, [cpfCnpj, refreshKeyLojas]);

  // 2. Rodar atualização somente se for forçado via botão (ModalLojas)
  useEffect(() => {
    if (cpfCnpj) {
      refreshCarrinhoData();
    }
  }, [refreshKeyLojas]);

  // Adicionar um useEffect para buscar os dados das lojas quando o carrinho for carregado
  useEffect(() => {
    if (carrinhos && carrinhos.length > 0) {
      // Extrair todos os CNPJs únicos do carrinho
      const cnpjs = carrinhos
        .map((loja) => loja.cpfCnpj)
        .filter(Boolean) as string[];
    }
  }, [carrinhos]);

  // Adicionar listener de foco para atualizar quando a tela receber foco
  useEffect(() => {
    if (!cpfCnpj) return; // Não configurar listener se não houver CNPJ

    const unsubscribe = navigation.addListener("focus", () => {
      refreshCarrinhoData();
    });

    return unsubscribe;
  }, [navigation, cpfCnpj, lojasSelecionadas]);

  // Verifica se o carrinho está vazio e navega para CatalogoFechado
  useEffect(() => {
    if (refreshKey > 0 && !isNavigatingBack) {
      // Verificar se o carrinho está vazio (sem lojas OU todas as lojas sem produtos)
      const carrinhoEstáVazio =
        !carrinhos ||
        carrinhos.length === 0 ||
        carrinhos.every(
          (loja: any) => !loja.produtos || loja.produtos.length === 0
        );

      if (carrinhoEstáVazio && !carrinhoInfo) {
        // Verificação dupla no banco de dados para ter certeza que o carrinho está vazio
        const verificarCarrinhoVazio = async () => {
          try {
            // Usando a tabela NovoPedido em vez da tabela carrinhos que não existe
            const carrinhoExistente = await db.getAllAsync(
              "SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ?;",
              [pedidoId || 0, representanteId || ""]
            );

            // Se não existir carrinho OU existir mas todas as lojas estiverem sem produtos
            let carrinhoDBVazio = true;

            if (carrinhoExistente.length > 0) {
              const carrinhoItem = carrinhoExistente[0] as {
                produtos?: string;
              };
              if (carrinhoItem?.produtos) {
                try {
                  const produtosDB = JSON.parse(
                    carrinhoItem.produtos.toString() || "[]"
                  );
                  // Verificar se há alguma loja com produtos
                  carrinhoDBVazio = produtosDB.every(
                    (loja: any) => !loja.produtos || loja.produtos.length === 0
                  );
                } catch (e) {
                  console.error("Erro ao analisar produtos do DB:", e);
                }
              }
            }

            if (carrinhoExistente.length === 0 || carrinhoDBVazio) {
              // Se ainda existir o registro no banco mas sem produtos, excluir
              if (carrinhoExistente.length > 0) {
                try {
                  const deleteQuery = `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`;
                  await db.runAsync(deleteQuery, [
                    pedidoId || 0,
                    representanteId || "",
                  ]);
                } catch (err) {
                  console.error("Erro ao excluir registro vazio:", err);
                }
              }

              setIsNavigatingBack(true);
              setTimeout(() => {
                setClientInfo({
                  cpfCnpjContext: cpfCnpj || cpfCnpjContext,
                  clienteIdContext: clienteId || clienteIdContext,
                  razaoSocialContext: razaoSocialCliente,
                  representanteIdContext: representanteId,
                  selectedClientContext: {
                    cpfCnpj: cpfCnpj || cpfCnpjContext,
                    clienteId: clienteId || clienteIdContext,
                    razaoSocial: razaoSocialCliente || razaoSocialContext,
                    enderecoCompleto: enderecosCliente[0]?.endereco || "",
                    enderecos: enderecosCliente,
                  },
                });
              }, 300);
            } else {
            }
          } catch (error) {
            console.error(
              "Erro ao verificar carrinho no banco de dados:",
              error
            );
          }
        };

        verificarCarrinhoVazio();
      }
    }
  }, [
    carrinhos,
    carrinhoInfo,
    refreshKey,
    isNavigatingBack,
    representanteId,
    pedidoId,
  ]);

  // Função auxiliar para atualizar a UI após operações no carrinho
  const atualizarUIAposOperacao = async () => {
    try {
      // Atualizar a contagem de carrinhos no TopContext e aguardar sua conclusão
      await updateCarrinhosCount();

      // Recarregar dados do carrinho para refletir as alterações
      if (cpfCnpj) {
        await fetchCarrinhoProdutos(cpfCnpj);
      }

      // Forçar re-renderização
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Erro ao atualizar UI:", error);
    }
  };

  //Endereços
  const fetchEnderecosCliente = async (cpfCnpj: string) => {
    try {
      const clienteQuery = `SELECT enderecos, razaoSocial FROM CarteiraCliente WHERE cpfCnpj = ?;`;
      const clienteResult: { enderecos?: string }[] = await db.getAllAsync(
        clienteQuery,
        [cpfCnpj]
      );

      if (clienteResult.length > 0) {
        const enderecos = JSON.parse(clienteResult[0]?.enderecos || "[]");
        setEnderecosCliente(enderecos);
        setRazaoSocialCliente(clienteResult[0]?.razaoSocial || ""); // <-- GARANTE O NOME
      } else {
        console.warn("Nenhum cliente encontrado para o CNPJ:", cpfCnpj);
        setEnderecosCliente([]);
      }
    } catch (error) {
      console.error("Erro ao buscar endereços do cliente:", error);
    }
  };

  const fetchEnderecoPedido = async (cpfCnpj: string, pedidoId: number) => {
    try {
      if (!cpfCnpj || !pedidoId) return;

      // Tenta buscar o endereço salvo no pedido (NovoPedido)
      const queryPedido = `
      SELECT produtos FROM NovoPedido
      WHERE cpfCnpj = ? AND id = ?
      LIMIT 1;
    `;

      const result = await db.getFirstAsync(queryPedido, [cpfCnpj, pedidoId]);

      let enderecoPedido: any[] = [];

      if (result?.produtos) {
        const produtosParse = JSON.parse(result.produtos || "[]");

        const lojaAtual = produtosParse.find(
          (loja: any) => loja.cpfCnpj === cpfCnpj
        );
        if (lojaAtual?.enderecoEntrega) {
          enderecoPedido = [lojaAtual.enderecoEntrega];
        }
      }

      // 2️⃣ Se não encontrou no pedido, busca os endereços da CarteiraCliente
      if (enderecoPedido.length === 0) {
        const queryCarteira = `
        SELECT enderecos FROM CarteiraCliente
        WHERE cpfCnpj = ? AND status = 1
        LIMIT 1;
      `;

        const carteira = await db.getFirstAsync(queryCarteira, [cpfCnpj]);

        if (carteira?.enderecos) {
          try {
            enderecoPedido = JSON.parse(carteira.enderecos || "[]");
          } catch (error) {
            console.warn(
              "Erro ao fazer parse dos endereços da carteira:",
              error
            );
          }
        }
      }

      // 3️⃣ Atualiza a lista com pelo menos 1 fonte válida
      setEnderecosCliente(enderecoPedido);
    } catch (error) {
      console.warn("Erro ao buscar endereço do pedido:", error);
    }
  };

  const fetchCarrinhoProdutos = async (cpfCnpj: string) => {
    try {
      if (!cpfCnpj) throw new Error("CNPJ não definido.");

      const carrinhoQuery = `SELECT * FROM NovoPedido WHERE cpfCnpj = ? AND representanteId = ?;`;
      const carrinhoResultByCNPJ = await db.getAllAsync(carrinhoQuery, [
        cpfCnpj,
        representanteId || "",
      ]);

      if (carrinhoResultByCNPJ.length > 0) {
        const carrinho = carrinhoResultByCNPJ[0] as NovoPedidoItem;
        setCarrinhoInfo(carrinho);

        let produtosData =
          typeof carrinho?.produtos === "string"
            ? JSON.parse(carrinho?.produtos || "[]")
            : [];

        // Consolidar por CNPJ
        const cnpjsProcessados = new Set();
        const produtosDataConsolidados: any[] = [];

        const produtosLojaPai = produtosData.filter(
          (produto: any) =>
            produto.cpfCnpj === cpfCnpj && Array.isArray(produto.produtos)
        );

        produtosData.forEach((loja: any) => {
          if (cnpjsProcessados.has(loja.cpfCnpj)) return;
          cnpjsProcessados.add(loja.cpfCnpj);

          const entradasMesmoCnpj = produtosData.filter(
            (item: any) => item.cpfCnpj === loja.cpfCnpj
          );

          let produtosConsolidados: any[] = [];
          entradasMesmoCnpj.forEach((entrada: any) => {
            if (Array.isArray(entrada.produtos)) {
              produtosConsolidados = [
                ...produtosConsolidados,
                ...entrada.produtos,
              ];
            }
          });

          const enderecoEntregaPreservado = entradasMesmoCnpj.find(
            (e: any) =>
              e.enderecoEntrega &&
              typeof e.enderecoEntrega === "object" &&
              Object.keys(e.enderecoEntrega).length > 0
          )?.enderecoEntrega;

          produtosDataConsolidados.push({
            cpfCnpj: loja.cpfCnpj,
            produtos: produtosConsolidados,
            enderecoEntrega: enderecoEntregaPreservado || null,
          });
        });

        produtosData = produtosDataConsolidados;

        // Filtrar pelas lojas selecionadas
        if (lojasSelecionadas.length > 0) {
          produtosData = produtosData.filter((cliente: any) =>
            lojasSelecionadas.includes(cliente.cpfCnpj)
          );
        }

        // Adicionar lojas faltantes com produtos e sem endereço ainda
        lojasSelecionadas.forEach((lojaCpfCnpj) => {
          const lojaJaExiste = produtosData.some(
            (cliente: any) => cliente.cpfCnpj === lojaCpfCnpj
          );
          if (!lojaJaExiste) {
            let produtosNovaLoja: any[] = [];
            if (
              produtosLojaPai.length > 0 &&
              Array.isArray(produtosLojaPai[0].produtos)
            ) {
              produtosNovaLoja = [...produtosLojaPai[0].produtos];
            }

            produtosData.push({
              cpfCnpj: lojaCpfCnpj,
              produtos: produtosNovaLoja,
              enderecoEntrega: null,
            });
          }
        });

        // Buscar endereços das lojas (CarteiraCliente)
        const cnpjs = produtosData.map((loja: any) => loja.cpfCnpj);
        const placeholders = cnpjs.map(() => "?").join(",");
        const lojasQuery = `SELECT cpfCnpj, enderecos, razaoSocial FROM CarteiraCliente WHERE cpfCnpj IN (${placeholders});`;
        const lojasDB = await db.getAllAsync(lojasQuery, cnpjs);

        const dadosLojasMap: {
          [cpfCnpj: string]: {
            razaoSocial: string;
            enderecoPrincipal: Endereco | null;
          };
        } = {};

        lojasDB.forEach((loja: any) => {
          try {
            const enderecos = JSON.parse(loja.enderecos || "[]");
            const enderecoPrincipal =
              enderecos.find((e: any) => e.tipo === 1) || enderecos[0] || null;
            dadosLojasMap[loja.cpfCnpj] = {
              razaoSocial: loja.razaoSocial || "Loja sem nome",
              enderecoPrincipal,
            };
          } catch (e) {
            console.warn("Erro ao parsear endereço da loja", loja.cpfCnpj);
          }
        });

        // Adiciona o endereço principal da loja coligada se ainda não tiver endereço
        produtosData = produtosData.map((loja: any) => {
          const enderecoSalvo =
            loja.enderecoEntrega && typeof loja.enderecoEntrega === "object"
              ? loja.enderecoEntrega
              : null;

          const enderecoColigada =
            dadosLojasMap[loja.cpfCnpj]?.enderecoPrincipal || null;

          return {
            ...loja,
            produtos: Array.isArray(loja.produtos) ? loja.produtos : [],
            enderecoEntrega: enderecoSalvo ?? enderecoColigada ?? null,
          };
        });

        // Atualiza no banco
        const queryUpdatePedido = `
        UPDATE NovoPedido
        SET produtos = ?
        WHERE id = ? AND representanteId = ?;
      `;
        if (pedidoId && representanteId) {
          await db.runAsync(queryUpdatePedido, [
            JSON.stringify(produtosData),
            pedidoId,
            representanteId,
          ]);
        }

        // Atualizar estado
        setProdutos(produtosData);
        setCarrinhos(produtosData);

        setDadosLojas((prev) => ({
          ...prev,
          ...lojasDB.reduce((acc, loja) => {
            const enderecos = JSON.parse(loja.enderecos || "[]");
            const enderecoPrincipal =
              enderecos.find((e: any) => e.tipo === 1) || null;
            acc[loja.cpfCnpj] = prev[loja.cpfCnpj]?.enderecoPrincipal
              ? prev[loja.cpfCnpj]
              : {
                  razaoSocial: loja.razaoSocial || "Loja sem nome",
                  enderecoPrincipal,
                };
            return acc;
          }, {} as typeof prev),
        }));
        setRazaoSocialCliente(lojasDB[0]?.razaoSocial);
      } else {
        setProdutos([]);
        setCarrinhos([]);
        setCarrinhoInfo(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do carrinho:", error);
      setProdutos([]);
      setCarrinhos([]);
    }
  };

  const updateCarrinhoInDB = async (produtosArray: IProdutoLoja[]) => {
    try {
      // Calcula os totais a partir do array de produtos atualizado

      const queryUpdatePedido = `
        UPDATE NovoPedido
        SET produtos = ?
        WHERE id = ? AND representanteId = ?;
      `;
      await db.runAsync(queryUpdatePedido, [
        JSON.stringify(produtosArray),
        carrinhoInfo?.id || 0,
        representanteId || "",
      ]);

      // Atualizar contagem de carrinhos e UI
      await atualizarUIAposOperacao();
    } catch (error) {
      console.error("Erro ao atualizar carrinho no DB:", error);
    }
  };

  const updateProductQuantity = async (
    cpfCnpjSelecionado: string,
    codigoProduto: number,
    quantidade: number
  ) => {
    const querySelectNovoPedido = `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`;
    const result = await db.getAllAsync(querySelectNovoPedido, [
      pedidoId || 0,
      representanteId || "",
    ]);

    if (result.length === 0) {
      console.error("Pedido não encontrado");
      return;
    }

    let produtosLoja = JSON.parse((result[0] as { produtos: string }).produtos);

    let clientIndex = produtosLoja.findIndex(
      (p: any) => p.cpfCnpj === cpfCnpjSelecionado
    );

    if (clientIndex === -1) {
      console.error("Cliente não encontrado no carrinho");
      return;
    }

    let produtoIndex = produtosLoja[clientIndex].produtos.findIndex(
      (p: any) => p.codigo === codigoProduto
    );

    if (produtoIndex === -1) {
      console.error("Produto não encontrado no carrinho");
      return;
    }

    produtosLoja[clientIndex].produtos[produtoIndex].quantidade = quantidade;

    await updateCarrinhoInDB(produtosLoja);
    setCarrinhos(produtosLoja);
  };

  const handleDecrement = async (
    cpfCnpjSelecionado: string,
    pedidoId: number | undefined,
    codigo: string,
    representanteId: string | undefined
  ) => {
    try {
      if (!pedidoId || !representanteId) {
        console.error("pedidoId ou representanteId indefinido");
        return;
      }

      const querySelectNovoPedido = `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`;
      const result = await db.getAllAsync(querySelectNovoPedido, [
        pedidoId,
        representanteId,
      ]);

      if (result.length === 0) {
        console.error("Nenhum pedido encontrado");
        return;
      }

      let produtosLoja = JSON.parse(
        (result[0] as { produtos: string }).produtos
      );

      let clientIndex = produtosLoja.findIndex(
        (p: any) => p.cpfCnpj === cpfCnpjSelecionado
      );

      if (clientIndex === -1) {
        console.error("Cliente não encontrado no carrinho");
        return;
      }

      let produtoIndex = produtosLoja[clientIndex].produtos.findIndex(
        (p: any) => p.codigo === codigo
      );

      if (produtoIndex === -1) {
        console.error("Produto não encontrado no carrinho");
        return;
      }

      let resultDecrement =
        produtosLoja[clientIndex].produtos[produtoIndex].quantidade - 1;

      if (resultDecrement <= 0) {
        handleRemoveProduct(cpfCnpjSelecionado, codigo, null);
        return;
      } else {
        produtosLoja[clientIndex].produtos[produtoIndex].quantidade =
          resultDecrement;

        await updateCarrinhoInDB(produtosLoja);
        setCarrinhos(produtosLoja);

        // Forçar atualização da UI
        await atualizarUIAposOperacao();
      }
    } catch (error) {
      console.error("Erro ao decrementar a quantidade:", error);
    }
  };

  const handleIncrement = async (
    cpfCnpjSelecionado: string,
    pedidoId: number | undefined,
    codigo: string,
    representanteId: string | undefined
  ) => {
    try {
      if (!pedidoId || !representanteId) {
        console.error("pedidoId ou representanteId indefinido");
        return;
      }

      const querySelectNovoPedido = `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`;
      const result = await db.getAllAsync(querySelectNovoPedido, [
        pedidoId,
        representanteId,
      ]);

      if (result.length === 0) {
        console.error("Nenhum pedido encontrado");
        return;
      }

      let produtosLoja = JSON.parse(
        (result[0] as { produtos: string }).produtos
      );

      produtosLoja.forEach((cliente: any) => {
        const produtoIndex = cliente.produtos.findIndex(
          (p: any) => p.codigo === codigo
        );
        if (produtoIndex !== -1 && cliente.cpfCnpj === cpfCnpjSelecionado) {
          cliente.produtos[produtoIndex].quantidade += 1;
        }
      });

      await updateCarrinhoInDB(produtosLoja);
      setCarrinhos(produtosLoja);

      // Forçar atualização da UI
      await atualizarUIAposOperacao();
    } catch (error) {
      console.error("Erro ao incrementar a quantidade:", error);
    }
  };

  const handleRemoveProduct = async (
    cpfCnpjSelecionado: string,
    codigoProduto: string,
    idItemVenda: any
  ) => {
    try {
      // Criar uma chave única para este produto
      const productKey = `${cpfCnpjSelecionado}-${codigoProduto}`;

      // Verificar se já está removendo este produto
      if (removingProducts[productKey]) {
        return;
      }

      // 1. Buscar dados atualizados diretamente da base de dados
      const querySelectNovoPedido = `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`;
      const result = await db.getAllAsync(querySelectNovoPedido, [
        pedidoId || 0,
        representanteId || 0,
      ]);

      if (result.length === 0) {
        console.error("Pedido não encontrado no banco de dados");
        throw new Error("Pedido não encontrado");
      }

      // 2. Obter dados atuais do banco de dados
      const pedidoAtual = result[0] as {
        produtos?: string;
        id?: number;
      };
      const pedidoAtualId = pedidoAtual?.id || 0; // Usar um valor padrão para evitar undefined

      // Garantir que o JSON seja analisado corretamente
      let produtosString = String(pedidoAtual?.produtos || "[]");
      let produtosLoja: any[];

      try {
        produtosLoja = JSON.parse(produtosString);
        // console.log("produtosLoja(handleRemoveProduto):", produtosLoja);
      } catch (err) {
        console.error("Erro ao analisar JSON dos produtos:", err);
        produtosLoja = [];
      }

      // Garantir que produtosLoja seja um array
      if (!Array.isArray(produtosLoja)) {
        console.error("produtosLoja não é um array. Valor:", produtosString);
        produtosLoja = [];
      }

      // 1) Localizar a loja certa
      const lojaSelecionada = produtosLoja.find(
        (loja: any) => loja?.cpfCnpj === cpfCnpjSelecionado
      );

      if (!lojaSelecionada || !Array.isArray(lojaSelecionada.produtos)) {
        console.error("Loja selecionada não encontrada ou sem 'produtos'.", {
          cpfCnpjSelecionado,
          produtosLoja,
        });
        throw new Error("Loja selecionada não encontrada");
      }

      // 2) Localizar o item dentro da loja
      const itemRemovido = lojaSelecionada.produtos.find(
        (p: any) => p?.codigo === codigoProduto
      );

      if (!itemRemovido) {
        console.error("Produto a remover não encontrado na loja selecionada.", {
          codigoProduto,
          lojaSelecionada,
        });
        throw new Error("Produto não encontrado na loja selecionada");
      }

      // 3) Se for relógio (tipo 'R') e tiver marca, checar se é o último relógio da mesma marca nessa loja
      const isRelogio = itemRemovido?.tipo === "R";
      const temMarca = !!itemRemovido?.codigoMarca;

      if (isRelogio) {
        const aindaTemRelogioMesmaMarca = lojaSelecionada.produtos.some(
          (p: any) =>
            p?.tipo === "R" &&
            p?.codigoMarca === itemRemovido.codigoMarca &&
            p?.codigo !== codigoProduto
        );

        // Se NÃO houver mais relógios da marca nesta loja, coletar expositores da mesma marca (nesta loja)
        if (!aindaTemRelogioMesmaMarca) {
          const expositoresParaRemover: string[] = lojaSelecionada.produtos
            .filter(
              (p: any) =>
                p?.tipo === "E" && p?.codigoMarca === itemRemovido.codigoMarca
            )
            .map((p: any) => p.codigo);

          if (expositoresParaRemover.length > 0) {
            return Alert.alert(
              "Remover Produto",
              `Você tem certeza que deseja remover este relógio?\n` +
                `O(s) expositor(es) da mesma marca também será(ão) removido(s).`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "OK",
                  onPress: async () => {
                    try {
                      // Remover o relógio e os expositores desta loja
                      lojaSelecionada.produtos =
                        lojaSelecionada.produtos.filter(
                          (p: any) =>
                            p?.codigo !== codigoProduto &&
                            !expositoresParaRemover.includes(p?.codigo)
                        );

                      // Se a loja ficou vazia, removê-la do array geral
                      if (lojaSelecionada.produtos.length === 0) {
                        produtosLoja = produtosLoja.filter(
                          (loja: any) => loja?.cpfCnpj !== cpfCnpjSelecionado
                        );
                      }

                      // Persistir no DB e atualizar estados (reutilize sua lógica já existente)
                      const novoProdutosJSON = JSON.stringify(produtosLoja);

                      if (produtosLoja.length === 0) {
                        await db.runAsync(
                          `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`,
                          [pedidoAtualId, representanteId || ""]
                        );

                        setLojasParaCliente(
                          cpfCnpj,
                          produtosLoja.map((loja: any) => loja.cpfCnpj)
                        ); // Atualiza o contexto com as lojas do carrinho
                        setCarrinhos([]);
                        setCarrinhoInfo(null);
                        setTimeout(() => navigation.goBack(), 500);
                      } else {
                        await db.runAsync(
                          `UPDATE NovoPedido SET produtos = ? WHERE id = ? AND representanteId = ?;`,
                          [
                            novoProdutosJSON,
                            pedidoAtualId,
                            representanteId || "",
                          ]
                        );
                        setCarrinhos(JSON.parse(novoProdutosJSON));
                      }

                      await updateCarrinhosCount();
                      atualizarUIAposOperacao?.();
                    } catch (e) {
                      console.error(
                        "Erro ao remover relógio + expositores:",
                        e
                      );
                      Alert.alert(
                        "Erro",
                        "Não foi possível remover o produto."
                      );
                      setRefreshKey((prev) => prev + 1);
                      refreshCarrinhoData?.();
                    }
                  },
                },
              ]
            );
          }
        }
      }

      // Confirmar remoção simples (relógio sem expositor, ou expositor, ou outro tipo de produto)
      Alert.alert("Remover produto", "Deseja realmente remover este produto?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          onPress: async () => {
            try {
              // Marcar este produto como "em remoção"
              setRemovingProducts((prev) => ({
                ...prev,
                [productKey]: true,
              }));
              // Ativar loading geral
              setIsLoading(true);

              if (!pedidoId || !representanteId) {
                console.error("pedidoId ou representanteId indefinido");
                throw new Error("Dados de pedido ou representante ausentes");
              }

              const lojasBefore = produtosLoja.length;

              // Encontrar a loja específica que contém o produto a ser removido
              const lojaIndex = produtosLoja.findIndex(
                (loja: any) =>
                  loja?.cpfCnpj === cpfCnpjSelecionado &&
                  Array.isArray(loja?.produtos) &&
                  loja.produtos.some((p: any) => p?.codigo === codigoProduto)
              );

              // if (lojaIndex === -1) {
              //   console.error(
              //     `ERRO: Loja ${cpfCnpjSelecionado} com produto ${codigoProduto} não encontrada`
              //   );

              //   // Verificar se a loja existe sem o produto
              //   const lojaExiste = produtosLoja.some(
              //     (loja: any) => loja?.cpfCnpj === cpfCnpjSelecionado
              //   );
              //   if (lojaExiste) {
              //   } else {
              //   }

              //   throw new Error("Produto não encontrado na loja selecionada");
              // }

              // Criar uma cópia profunda do array para evitar referências
              let novosProdutosLoja = JSON.parse(JSON.stringify(produtosLoja));

              // 3. Remover o produto específico da loja encontrada
              const produtosAntigos =
                novosProdutosLoja[lojaIndex].produtos.length;
              novosProdutosLoja[lojaIndex].produtos = novosProdutosLoja[
                lojaIndex
              ].produtos.filter((p: any) => p?.codigo !== codigoProduto);
              const produtosNovos =
                novosProdutosLoja[lojaIndex].produtos.length;

              // 4. Se a loja ficou sem produtos, remover a loja do array
              if (novosProdutosLoja[lojaIndex].produtos.length === 0) {
                novosProdutosLoja.splice(lojaIndex, 1);
              }

              // 5. Verificar se houve mudanças
              if (
                produtosAntigos === produtosNovos &&
                novosProdutosLoja.length === produtosLoja.length
              ) {
                throw new Error("Nenhum item foi modificado");
              }

              // 6. Atualizar banco de dados

              // Se não sobrou nenhuma loja/produto, excluir o pedido completo
              if (novosProdutosLoja.length === 0) {
                setLojasParaCliente(cpfCnpj, []); // Atualiza o contexto com as lojas do carrinho vazio
                const deleteQuery = `
                  DELETE FROM NovoPedido
                  WHERE id = ? AND representanteId = ?;
                `;

                await db.runAsync(deleteQuery, [
                  pedidoAtualId,
                  representanteId || "",
                ]);

                // 8. Navegar de volta após remoção bem-sucedida
                setTimeout(() => {
                  navigation.goBack();
                }, 500);

                // Limpar estados locais
                setCarrinhos([]);
                setCarrinhoInfo(null);
              } else {
                // Atualizar o pedido com as lojas filtradas
                const updateQuery = `
                  UPDATE NovoPedido
                  SET produtos = ?
                  WHERE id = ? AND representanteId = ?;
                `;

                const novoProdutosJSON = JSON.stringify(novosProdutosLoja);

                // Executar atualização no banco de dados e AGUARDAR completar
                await db.runAsync(updateQuery, [
                  novoProdutosJSON,
                  pedidoAtualId,
                  representanteId || "",
                ]);

                setLojasParaCliente(
                  cpfCnpj,
                  novosProdutosLoja.map((loja: any) => loja.cpfCnpj)
                ); // Atualiza o contexto com as lojas do carrinho

                // Verificar se o banco foi realmente atualizado
                const verificacaoQuery = `SELECT produtos FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`;
                const verificacaoResult = await db.getAllAsync(
                  verificacaoQuery,
                  [pedidoAtualId, representanteId || ""]
                );

                if (verificacaoResult.length > 0) {
                  const produtosVerificados = JSON.parse(
                    String(
                      (verificacaoResult[0] as { produtos?: string })
                        .produtos || "[]"
                    )
                  );

                  // Se a verificação mostrar que ainda há diferença, forçar novamente
                  if (produtosVerificados.length !== novosProdutosLoja.length) {
                    await db.runAsync(updateQuery, [
                      novoProdutosJSON,
                      pedidoAtualId,
                      representanteId || "",
                    ]);
                  }
                }

                // Atualizar estados locais com nova cópia
                setCarrinhos(JSON.parse(JSON.stringify(novosProdutosLoja)));
              }

              // 7. Forçar atualização
              await updateCarrinhosCount();
            } catch (error) {
              console.error("Erro durante processo de remoção:", error);
              Alert.alert(
                "Erro",
                "Ocorreu um erro ao remover o produto. A interface será recarregada."
              );
              // Forçar recarga em caso de erro
              setRefreshKey((prev) => prev + 1);
              refreshCarrinhoData();
            } finally {
              // Desmarcar este produto como "em remoção" após um pequeno atraso
              setTimeout(() => {
                setRemovingProducts((prev) => {
                  const updated = { ...prev };
                  delete updated[productKey];
                  return updated;
                });
                // Desativar loading geral
                setIsLoading(false);
              }, 800); // Atraso maior para garantir feedback visual
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao iniciar remoção do produto:", error);
      // Garantir que o loading seja desativado em caso de erro
      setIsLoading(false);
      // Limpar o status de remoção para este produto
      const productKey = `${cpfCnpjSelecionado}-${codigoProduto}`;
      setRemovingProducts((prev) => {
        const updated = { ...prev };
        delete updated[productKey];
        return updated;
      });
    }
  };

  // Remove todos os produtos da loja e navega para CatalogoFechado sem loading
  const handleRemoveStore = async (cpfCnpjSelecionado: string) => {
    try {
      if (!pedidoId || !representanteId) {
        console.error("pedidoId ou representanteId indefinido");
        return;
      }

      // Buscar pedido atual
      const querySelectNovoPedido = `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`;
      const result = await db.getAllAsync(querySelectNovoPedido, [
        pedidoId,
        representanteId,
      ]);

      if (result.length === 0) {
        console.error("Pedido não encontrado no banco de dados");
        return;
      }

      const pedidoAtual = result[0] as {
        produtos?: string;
        id?: number;
        clienteId?: string;
        cpfCnpj?: string;
        selectedTabelaPreco?: any;
      };
      const pedidoAtualId = pedidoAtual?.id || 0;
      let produtosLoja: any[] = [];
      try {
        produtosLoja = JSON.parse(String(pedidoAtual?.produtos || "[]"));
      } catch (err) {
        produtosLoja = [];
      }

      // Remove todos os produtos da loja selecionada
      const novosProdutosLoja = produtosLoja.filter(
        (loja: any) => loja.cpfCnpj !== cpfCnpjSelecionado
      );

      if (novosProdutosLoja.length === 0) {
        // Exclui o pedido completo se não sobrou nenhuma loja/produto
        const deleteQuery = `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`;
        await db.runAsync(deleteQuery, [pedidoAtualId, representanteId || ""]);
        setCarrinhos([]);
        setCarrinhoInfo(null);
        if (typeof updateCarrinhosCount === "function") {
          updateCarrinhosCount(0);
        }
      } else {
        // Atualiza o pedido com as lojas filtradas
        const updateQuery = `UPDATE NovoPedido SET produtos = ? WHERE id = ? AND representanteId = ?;`;
        await db.runAsync(updateQuery, [
          JSON.stringify(novosProdutosLoja),
          pedidoAtualId,
          representanteId || "",
        ]);
        setCarrinhos(JSON.parse(JSON.stringify(novosProdutosLoja)));
      }

      // Navega para CatalogoFechado (sem loading)
      navigation.navigate("CatalogoFechado", {
        catalogOpen: true,
        pedidoId: pedidoAtualId,
        clienteId: pedidoAtual?.clienteId,
        cpfCnpj: pedidoAtual?.cpfCnpj,
        selectedTabelaPreco: pedidoAtual?.selectedTabelaPreco,
      });
    } catch (error) {
      console.error("Erro ao remover loja do carrinho:", error);
    }
  };

  const refreshCarrinho = async () => {
    try {
      if (!pedidoId || !representanteId) return;

      const [pedido] = await db.getAllAsync(
        `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`,
        [pedidoId, representanteId]
      );

      if (!pedido) {
        setCarrinhos([]);
        setDadosLojas({});
        return;
      }

      const lojas = (() => {
        try {
          return JSON.parse(pedido.produtos || "[]");
        } catch {
          return [];
        }
      })();

      // Atualiza a FONTE que sua view usa
      setCarrinhos(lojas);

      // (opcional) Mapa para nomes/endereços
      const novoMapa = lojas.reduce((acc: any, l: any) => {
        acc[l.cpfCnpj] = {
          razaoSocial:
            l.razaoSocial ?? (dadosLojas?.[l.cpfCnpj]?.razaoSocial || ""),
          enderecoPrincipal: l.enderecoEntrega || null,
        };
        return acc;
      }, {});
      setDadosLojas(novoMapa);

      // Se quiser, também mantenha carrinhoInfo consistente:
      setCarrinhoInfo((prev: any) => ({ ...prev, ...pedido, produtos: lojas }));
    } catch (e) {
      console.error("[RFR-ERR]", e);
    } finally {
      setRefreshKey((prev) => prev + 1); // se você ainda quiser forçar re-render
    }
  };

  // Componente de loading centralizado
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

  // Substitui os componentes de erro por loading quando os dados estão sendo carregados
  if (carregandoDados) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LoadingComponent />
      </ScrollView>
    );
  }

  // // Exibir loading ao invés de ErroSelecao quando não houver carrinhoInfo
  if (!carrinhoInfo) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flex: 1,
            height: 400,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 15, fontSize: 16, textAlign: "center" }}>
            Aguardando dados do carrinho...
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Exibir loading ao invés de ErroAdicao quando não houver produtos
  if (Array.isArray(carrinhos) && carrinhos.length === 0) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flex: 1,
            height: 400,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 15, fontSize: 16, textAlign: "center" }}>
            Carregando produtos...
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text style={{ marginBottom: 15, fontSize: 16 }}>
              Processando...
            </Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </View>
      )}
      {Array.isArray(carrinhos) && carrinhos.length > 0 ? (
        Object.entries(
          carrinhos.reduce((acc: { [key: string]: any }, curr) => {
            // Só adicionar ao acumulador se a loja tiver produtos válidos
            if (
              curr &&
              curr.cpfCnpj &&
              curr.produtos &&
              Array.isArray(curr.produtos) &&
              curr.produtos.length > 0
            ) {
              acc[curr.cpfCnpj] = curr.produtos;
            }
            return acc;
          }, {})
        ).map(([cpfCnpj, produtosLoja]) => {
          const cpfCnpjSelecionado = cpfCnpj;

          // Verificação redundante para garantir que produtosLoja é um array válido
          if (!Array.isArray(produtosLoja) || produtosLoja.length === 0) {
            return null;
          }

          // const endereco = dadosLoja?.enderecoEntrega;
          const dadosLoja = dadosLojas[cpfCnpjSelecionado] || {
            razaoSocial: "Loja não encontrada",
            enderecoPrincipal: null,
          };

          const lojaSelecionada = carrinhos.find(
            (loja) => loja.cpfCnpj === cpfCnpjSelecionado
          );
          const endereco = lojaSelecionada?.enderecoEntrega;

          // setRazaoSocialCliente(dadosLoja.razaoSocial);

          return (
            <ContainerCardEmpresa key={`${cpfCnpjSelecionado}-${refreshKey}`}>
              <ContentCardEmpresa>
                <HeaderCardEmpresa>
                  <ContainerNomeEmpresa>
                    <TextEmpresa fontSize={16} weight={700}>
                      Loja: {dadosLoja.razaoSocial}
                    </TextEmpresa>
                    <TextEmpresa fontSize={14} weight={400}>
                      {formatarEnderecoCompleto(endereco)}
                      {/* {formatarEnderecoCompleto(enderecosCliente[0])} */}
                    </TextEmpresa>
                  </ContainerNomeEmpresa>
                  <IconesCardCarrinho
                    enderecosCliente={enderecosCliente}
                    carrinhoInfo={carrinhoInfo}
                    cpfCnpjSelecionado={cpfCnpjSelecionado}
                    setCarrinhoInfo={setCarrinhoInfo}
                    setDadosLojas={setDadosLojas}
                    dadosLojas={dadosLojas}
                    refreshCarrinho={refreshCarrinho}
                  />
                </HeaderCardEmpresa>
                <ContainerPedido>
                  {produtosLoja.map((produto, produtoIndex) => (
                    // console.log("Produto(CardCarrinho):", produto),
                    <ItemPedido
                      key={`${cpfCnpj}-${
                        produto.codigo || produtoIndex
                      }-${refreshKey}`}
                    >
                      <ImagemProdutoContainer>
                        <ImagemProduto
                          source={
                            typeof produto.imagem === "string"
                              ? { uri: produto.imagem }
                              : produto.imagem || { uri: "" }
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
                            {produto.tipo === "R" && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleDecrement(
                                    cpfCnpjSelecionado,
                                    pedidoId,
                                    produto.codigo,
                                    representanteId
                                  )
                                }
                              >
                                <Ionicons
                                  name="remove"
                                  size={38}
                                  color="black"
                                />
                              </TouchableOpacity>
                            )}
                            <InputQuantidade
                              value={
                                inputValues[
                                  `${cpfCnpjSelecionado}-${produto.codigo}`
                                ] || String(produto.quantidade)
                              }
                              editable={produto.tipo === "R"}
                              onChangeText={(text) => {
                                // Atualiza apenas o valor temporário do input, sem alterar o estado global
                                setInputValues((prev) => ({
                                  ...prev,
                                  [`${cpfCnpjSelecionado}-${produto.codigo}`]:
                                    text,
                                }));
                              }}
                              onEndEditing={() => {
                                // Quando o usuário confirmar a edição, atualiza o estado global
                                const newQuantity = parseInt(
                                  inputValues[
                                    `${cpfCnpjSelecionado}-${produto.codigo}`
                                  ],
                                  10
                                );
                                if (!isNaN(newQuantity) && newQuantity > 0) {
                                  updateProductQuantity(
                                    cpfCnpjSelecionado,
                                    produto.codigo,
                                    newQuantity
                                  );
                                }
                              }}
                              maxLength={8}
                              keyboardType="number-pad"
                              style={{ width: 100, textAlign: "center" }}
                            />
                            {produto.tipo === "R" && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleIncrement(
                                    cpfCnpjSelecionado,
                                    pedidoId,
                                    produto.codigo,
                                    representanteId
                                  )
                                }
                              >
                                <Feather name="plus" size={38} color="black" />
                              </TouchableOpacity>
                            )}
                            <Text style={{ fontSize: 18 }}>
                              {(
                                produto.quantidade *
                                (produto.precoUnitarioComIPI > 0
                                  ? produto.precoUnitarioComIPI
                                  : produto.precoUnitario)
                              ).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </Text>
                            {produto.percentualDesconto > 0 && (
                              <Text style={{ fontSize: 10, color: "red" }}>
                                ({produto.percentualDesconto}%)
                              </Text>
                            )}
                          </ContainerQuantidade>
                        </ContainerTextItemPedido>
                      </DetalhesPedido>

                      <TouchableOpacity
                        onPress={() =>
                          handleRemoveProduct(
                            cpfCnpjSelecionado,
                            produto.codigo,
                            produto.idItemVenda
                          )
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
                  Subtotal:{" "}
                  {produtosLoja
                    .reduce(
                      (total, produto) =>
                        total +
                        produto.quantidade *
                          (produto.precoUnitarioComIPI > 0
                            ? produto.precoUnitarioComIPI
                            : produto.precoUnitario),
                      0
                    )
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </TextEmpresa>
                <TextEmpresa fontSize={17} weight={600}>
                  Total:{" "}
                  {calcularSubtotalCarrinho(produtosLoja).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </TextEmpresa>
              </ContainerFooterCard>
            </ContainerCardEmpresa>
          );
        })
      ) : (
        <ErroAdicao />
      )}
      {carrinhoInfo && (
        <ButtonsCarrinhoCheck
          pedidoId={carrinhoInfo?.id || undefined}
          clienteId={carrinhoInfo?.clienteId}
          cpfCnpj={carrinhoInfo?.cpfCnpj}
          selectedTabelaPreco={carrinhoInfo?.selectedTabelaPreco}
        />
      )}
    </ScrollView>
  );
};

export default CardCarrinho;
