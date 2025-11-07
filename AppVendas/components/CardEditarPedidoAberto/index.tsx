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
  ButtonAddNewProducts,
  ButtonCancel,
  ButtonChangePaymentMethod,
  ButtonConfirm,
  ButtonText,
  ButtonTextBlue,
  ContainerButtonsFooter,
  ContainerButtonsSaveAndCancel,
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
import { IProdutoLoja } from "../CardProdutoCatalogo/index";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import AuthContext from "@/context/AuthContext";
import { useMenuContext } from "@/context/MenuProvider";
import { ImagemProdutoContainer } from "../CardDetalhePedidoEmAberto/style";
import { RootStackParamList } from "@/types/types";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import IconesCardEditarPedidoAberto from "./IconesCardEditarPedidoAberto";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { formatarEnderecoCompleto } from "@/utils/formatEndereco";
import { formatCurrency } from "@/helpers";
import { getFretePercentualPorCliente } from "@/helpers/frete/getFretePercentualPorCliente";
import { hasValue } from "@/helpers/hasValue";

const db = SQLite.openDatabaseSync("user_data.db");

interface CardEditarPedidoAbertoRouteParams {
  pedidoId?: number;
  cpfCnpj?: string;
}

interface IEndereco {
  cep: string | null;
  bairro: string | null;
  estado: string | null;
  municipio: string | null;
  complemento: string | null;
  endereco: string | null;
  numero?: string | null;
  tipo: number;
}

interface IPedidoData {
  enderecoEntrega: string;
  complementoEntrega: string;
  bairroEntrega: string;
  municipioEntrega: string;
  estadoEntrega: string;
  numeroEntrega: string;
  cepEntrega: string;
  cpfCnpj: string;
  razaoSocial?: string;
  meiosPagamento?: string;
  motivoBonificacao?: string;
  produtos?: string;
  clienteId?: number;
  id?: number;
}

export const CardEditarPedidoAberto: React.FC = ({}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { cpfCnpj, pedidoId } =
    route.params as CardEditarPedidoAbertoRouteParams;
  const {
    carrinho,
    setCarrinho,
    atualizarQuantidade,
    carregarCarrinho,
    removerProduto,
    removerProdutoSemAviso,
    validarEReajustarExpositores,
  } = useEditarPedidoAberto();
  const [carrinhoInfo, setCarrinhoInfo] = useState<any>([]);
  const [enderecosCliente, setEnderecosCliente] = useState<Endereco[]>([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<IEndereco>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { userData } = useContext(AuthContext);
  const { selectedTabelaPrecoContext } = useClientInfoContext();
  const representanteId = userData?.representanteId;
  const { getLojasSelecionadasParaCliente } = useMenuContext();
  const [freteDoPedido, setFreteDoPedido] = useState(0);
  const [valorTotalComFrete, setValorTotalComFrete] = useState<number | null>(
    null
  );
  const [dadosLojas, setDadosLojas] = useState<{
    [key: string]: {
      razaoSocial: string;
      enderecoEntrega: IEndereco;
      formaDePagamento?: string;
      valorDeFreteDoPedido?: number;
    };
  }>({});
  const [deveAtualizarCarrinho, setDeveAtualizarCarrinho] = useState(false);
  const [syncExpositores, setSyncExpositores] = useState(false);

  const [formaPagamento, setFormaPagamento] = useState("");

  const pedidoHidratadoRef = React.useRef(false);

  let enderecoEntrega: string | null = null;
  let numeroEntrega: string | null = null;
  let cepEntrega: string | null = null;
  let bairroEntrega: string | null = null;
  let complementoEntrega: string | null = null;
  let estadoEntrega: string | null = null;
  let municipioEntrega: string | null = null;

  let enderecoFormatado: IEndereco = {
    endereco: "",
    complemento: "",
    bairro: "",
    municipio: "",
    estado: "",
    cep: "",
    numero: "",
    tipo: 0, // Tipo padrão, pode ser ajustado conforme necessário
  };

  const carrinhosAgrupadosPorCnpj = useMemo(() => {
    return carrinho.reduce((acc, produto) => {
      const cnpj = cpfCnpj || "CNPJ_INDEFINIDO";
      // const cnpj = produto.cpfCnpj || "CNPJ_INDEFINIDO";
      if (!acc[cnpj]) acc[cnpj] = [];
      acc[cnpj].push(produto);
      return acc;
    }, {} as Record<string, IProdutoLoja[]>);
  }, [carrinho]);

  useEffect(() => {
    if (!syncExpositores) return;
    adjustExpositores()
      .catch(console.error)
      .finally(() => setSyncExpositores(false));
  }, [carrinho, syncExpositores]);

  useEffect(() => {
    if (representanteId && cpfCnpj && pedidoId) {
      fetchPedidoData(representanteId, pedidoId);
      fetchDadosLoja(cpfCnpj);
      setDeveAtualizarCarrinho(false); // reseta após atualizar
    }
  }, [representanteId, cpfCnpj]);

  useEffect(() => {
    // console.log("Atualizou carrinho, chamou fetchDadosLoja");
    if (cpfCnpj) {
      fetchDadosLoja(cpfCnpj);
    }
  }, [carrinho]);

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
  }, [getLojasSelecionadasParaCliente, refreshKey]);

  // Carrega o endereço do pedido, caso o pedidoId exista
  useEffect(() => {
    if (cpfCnpj && pedidoId) {
      fetchEnderecoPedido(cpfCnpj, pedidoId); // Carrega o endereço do pedido
    }
  }, [cpfCnpj, pedidoId]);

  // Calcula o frete do pedido e atualiza o estado local
  useEffect(() => {
    const calcularFreteEAtualizar = async () => {
      if (!carrinhoInfo?.clienteId || !representanteId) return;

      const valorSemFrete = carrinho.reduce((acc, p) => {
        const preco = p.precoUnitarioComIPI || p.precoUnitario || 0;
        const desconto = (p.percentualDesconto || 0) / 100;
        return acc + p.quantidade * preco * (1 - desconto);
      }, 0);

      const percentualFrete = await getFretePercentualPorCliente(
        carrinhoInfo.clienteId,
        valorSemFrete,
        Number(representanteId)
      );

      let valorFrete = 0;
      if (percentualFrete !== undefined && percentualFrete !== null) {
        valorFrete = (valorSemFrete * percentualFrete) / 100;
        setFreteDoPedido(valorFrete);
      }

      // Delay na atualização do total final
      setTimeout(() => {
        setValorTotalComFrete(valorSemFrete + valorFrete);
      }, 200); // atraso suave
    };

    calcularFreteEAtualizar();
  }, [carrinhoInfo?.clienteId, carrinho, representanteId]);

  useRefreshOnFocus(() => {
    // console.log("chamou useRefreshOnFocus");
    if (cpfCnpj) {
      fetchDadosLoja(cpfCnpj); // Isso força a reexecução da lógica que atualiza a UI com a forma de pagamento nova
    }
  });

  const fetchPedidoData = async (representanteId: string, pedidoId: number) => {
    setIsLoading(true);
    try {
      const query = `SELECT * FROM Pedido WHERE id = ? AND representanteId = ?;`;
      const result = await db.getAllAsync(query, [pedidoId, representanteId]);
      if (result.length > 0) {
        const pedidoData = result[0] as IPedidoData;
        setCarrinhoInfo(pedidoData);

        let produtos = [];
        let meiospagamento: any[] = [];

        try {
          // produtos
          if (typeof pedidoData.produtos === "string") {
            produtos = JSON.parse(pedidoData.produtos || "[]");
          } else if (Array.isArray(pedidoData.produtos)) {
            produtos = pedidoData.produtos;
          } else {
            produtos = [];
          }

          // meiosPagamento (string normal, duplamente encodada, ou array)
          if (Array.isArray(pedidoData.meiosPagamento)) {
            meiospagamento = pedidoData.meiosPagamento;
          } else if (typeof pedidoData.meiosPagamento === "string") {
            let raw = pedidoData.meiosPagamento.trim();

            // se vier "duplamente encodado" → "\"[ ... ]\""
            if (raw.startsWith('"') && raw.endsWith('"')) {
              try {
                raw = JSON.parse(raw);
              } catch {}
            }

            try {
              meiospagamento = JSON.parse(raw || "[]");
            } catch {
              // fallback rápido para casos com "=" nas chaves
              try {
                const fixed = raw
                  .replace(/=/g, ":")
                  .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');
                meiospagamento = JSON.parse(fixed || "[]");
              } catch {
                meiospagamento = [];
              }
            }
          } else {
            meiospagamento = [];
          }
        } catch (error) {
          console.error("Erro ao parsear produtos ou meiosPagamento:", error);
          produtos = [];
          meiospagamento = [];
        }

        if (pedidoData) {
          let endereco = pedidoData.enderecoEntrega || "";
          let numero = pedidoData.numeroEntrega || "";
          let complemento = pedidoData.complementoEntrega || "";
          let bairro = pedidoData.bairroEntrega || "";
          let municipio = pedidoData.municipioEntrega || "";
          let estado = pedidoData.estadoEntrega || "";
          let cep = pedidoData.cepEntrega || "";

          // Caso o endereço esteja em string única (mal formatado)
          if (
            endereco &&
            !bairro &&
            !municipio &&
            !estado &&
            (endereco.includes(",") || endereco.includes(" - "))
          ) {
            const partes = endereco.split(",");
            endereco = partes[0]?.trim() || "";
            numero = partes[1]?.trim() || "s/n";

            const resto = partes.slice(2).join(",").trim();
            if (resto) {
              const [muniEst] = resto.split("-");
              municipio = muniEst?.trim() || "";
              estado = resto.split("-")[1]?.trim() || "";
            }
          }

          enderecoFormatado = {
            endereco,
            numero,
            complemento,
            bairro,
            municipio,
            estado,
            cep,
          };
        }

        // ✅ defina forma de pagamento AGORA pela fonte estável (DB)
        const formaDePagamento = determinePaymentMethod(
          meiospagamento,
          pedidoData.motivoBonificacao
        );

        // ✅ use setDadosLojas “funcional” (sem capturar closure) e PRESERVANDO chaves
        setDadosLojas((prev) => ({
          ...prev,
          [pedidoData.cpfCnpj]: {
            ...(prev[pedidoData.cpfCnpj] || {}),
            razaoSocial: pedidoData?.razaoSocial || "Loja não encontrada",
            enderecoEntrega: enderecoFormatado,
            formaDePagamento, // <- já fica correto antes do carrinho
          },
        }));

        // carrega visual do carrinho
        await carregarCarrinho(produtos);

        // injeta meios/motivo em todos, sobreescrevendo
        setCarrinho((prev: any[]) =>
          prev.map((item) => ({
            ...item,
            meiosPagamento: Array.isArray(meiospagamento) ? meiospagamento : [],
            motivoBonificacao: pedidoData.motivoBonificacao || "",
          }))
        );

        pedidoHidratadoRef.current = true;
      } else {
        setCarrinhoInfo([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDadosLoja = async (cpfCnpj: string) => {
    // console.log("1️⃣ Chamou fetchDadosLoja");
    try {
      const clienteQuery = `SELECT enderecos, razaoSocial FROM CarteiraCliente WHERE cpfCnpj = ?;`;
      const clienteResult: { enderecos?: string; razaoSocial?: string }[] =
        await db.getAllAsync(clienteQuery, [cpfCnpj]);

      if (clienteResult.length > 0 && carrinho.length > 0) {
        const infos = carrinho[0];
        let formaDePagamento = "";
        let parsed: any[] = [];

        // console.log("2️⃣ Infos(fetchDadosLoja):", infos);

        if (typeof infos.meiosPagamento === "string") {
          // vem como string JSON
          parsed = JSON.parse(infos.meiosPagamento || "[]");
        } else if (Array.isArray(infos.meiosPagamento)) {
          // já é array
          parsed = infos.meiosPagamento;
        } else {
          parsed = [];
        }

        // console.log("3️⃣ Parsed antes de setar forma de pagamento:", parsed);
        if (parsed.length > 0) {
          formaDePagamento = determinePaymentMethod(parsed[0]);
          // console.log(
          //   "4️⃣ Setando forma de pagamento (CardEditarPedidoAberto):",
          //   formaDePagamento
          // );
          setFormaPagamento(formaDePagamento);
        }

        const enderecos = JSON.parse(clienteResult[0]?.enderecos || "[]");
        setEnderecosCliente(enderecos);

        setDadosLojas((prev) => ({
          ...prev,
          [cpfCnpj]: {
            razaoSocial: clienteResult[0].razaoSocial || "Loja não encontrada",
            enderecoEntrega: prev[cpfCnpj]?.enderecoEntrega || {
              endereco: "",
              numero: "",
              complemento: "",
              bairro: "",
              municipio: "",
              estado: "",
              cep: "",
            },
            // enderecoEntrega: enderecoFormatado,
            formaDePagamento: formaDePagamento ? formaDePagamento : undefined,
          },
        }));
      } else {
        setEnderecosCliente([]);
      }
    } catch (error) {
      // console.warn("Erro ao buscar endereços do cliente:", error);
    }
  };

  const fetchEnderecoPedido = async (cpfCnpj: string, pedidoId: number) => {
    try {
      const enderecoQuery = `SELECT bairroEntrega, cepEntrega, complementoEntrega, enderecoEntrega, estadoEntrega, municipioEntrega, numeroEntrega FROM Pedido WHERE cpfCnpj= ? AND id = ?;`;

      const enderecoResult: {
        bairroEntrega?: string;
        cepEntrega?: string;
        complementoEntrega?: string;
        enderecoEntrega?: string;
        estadoEntrega?: string;
        municipioEntrega?: string;
        numeroEntrega?: string;
      }[] = await db.getAllAsync(enderecoQuery, [cpfCnpj, pedidoId]);
      if (enderecoResult.length > 0) {
        const endereco = enderecoResult[0];
        const novoEndereco = [
          {
            bairro: endereco.bairroEntrega,
            cep: endereco.cepEntrega,
            complemento: endereco.complementoEntrega,
            endereco: endereco.enderecoEntrega,
            numero: endereco.numeroEntrega,
            estado: endereco.estadoEntrega,
            municipio: endereco.municipioEntrega,
            tipo: 0, // Provide a default value for 'tipo'
          },
        ];

        // Atualiza o estado com os endereços do pedido

        setEnderecosCliente([
          {
            bairro: endereco.bairroEntrega || "",
            cep: endereco.cepEntrega || "",
            complemento: endereco.complementoEntrega || "",
            endereco: endereco.enderecoEntrega || "",
            numero: endereco.numeroEntrega || "",
            estado: endereco.estadoEntrega || "",
            municipio: endereco.municipioEntrega || "",
            tipo: 0, // Provide a default value for 'tipo'
          },
        ]); // Atualiza o endereço do pedido
        setEnderecoSelecionado(novoEndereco[0]); // Seleciona o primeiro endereço
      } else {
        // console.warn("Nenhum pedido encontrado para o ID:", pedidoId);
        setEnderecosCliente([]);
      }
    } catch (error) {
      console.error("Erro ao buscar endereços do pedido:", error);
    }
  };

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

  const refreshCarrinhoData = () => {
    setIsLoading(true);
    if (pedidoId && representanteId && cpfCnpj) {
      fetchPedidoData(representanteId, pedidoId);
      fetchDadosLoja(cpfCnpj);
    } else {
      setIsLoading(false);
    }
  };

  const handleAddNewProducts = () => {
    if (pedidoId && cpfCnpj) {
      // Navega com o pedidoId do carrinho atual
      navigation.navigate("EditarPedidoCatalogoFechado", {
        catalogOpen: false,
        pedidoId,
        clienteId: carrinhoInfo.clienteId,
        cpfCnpj: cpfCnpj.toString(),
        selectedTabelaPreco: selectedTabelaPrecoContext,
        representanteCreateId: carrinhoInfo.representanteCreateId,
        selectedClient: {
          cpfCnpj: cpfCnpj.toString(),
          clienteId: carrinhoInfo.clienteId,
          razaoSocial: carrinhoInfo.razaoSocial || "",
          enderecoEntrega: carrinhoInfo.enderecoEntrega || "",
          enderecos: [],
        },
      });
    } else {
      // Fallback: navegação sem pedidoId
      Alert.alert(
        "Erro",
        "Nenhum carrinho associado. Crie um pedido antes de continuar comprando."
      );
    }
  };

  const changePaymentMethod = () => {
    if (cpfCnpj) {
      navigation.navigate("EditarPedidoPagamento", {
        pedidoId: carrinhoInfo.id,
        clienteId: carrinhoInfo.clienteId,
        cpfCnpj: cpfCnpj,
      });
    } else {
      Alert.alert("Erro", "CPF/CNPJ não definido.");
    }
  };

  const adjustExpositores = async () => {
    // separa relógios e expositores do estado
    const relogios = carrinho.filter((p) => p.tipo === "R");
    const expositores = carrinho.filter((p) => p.tipo === "E");
    if (!relogios.length || !expositores.length) return;

    // 1) soma total de relógios por marca
    const totalPorMarca: Record<string, number> = {};
    relogios.forEach((r) => {
      totalPorMarca[r.codigoMarca] =
        (totalPorMarca[r.codigoMarca] || 0) + r.quantidade;
    });

    // 2) busca marcas compradas UMA ÚNICA VEZ
    const comprouRows: any[] = await db.getAllAsync(
      `SELECT DISTINCT codigoMarca FROM QuemComprouCliente WHERE cpfCnpj = ?`,
      [cpfCnpj]
    );
    const marcasCompradas = new Set(comprouRows.map((r) => r.codigoMarca));

    // 3) para cada expositor, calcula limite e sincroniza
    expositores.forEach((expo) => {
      const totalRel = totalPorMarca[expo.codigoMarca] || 0;
      const limite = marcasCompradas.has(expo.codigoMarca)
        ? Math.round(totalRel * 0.7)
        : totalRel;

      // força o expositor para o limite (se for diferente)
      if (expo.quantidade !== limite) {
        atualizarQuantidade(expo.codigo, limite);
      }
    });
  };

  const incrementQuantity = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo);
    if (item) {
      // 1) atualiza o relógio
      atualizarQuantidade(codigo, item.quantidade + 1);

      // 2) espera o React aplicar o estado
      // await new Promise((resolve) => setTimeout(resolve, 0));

      // 3) só então reajusta os expositores com o novo estado
      // adjustExpositores();
      setSyncExpositores(true);
    }
  };

  const incrementQuantityExpositor = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo && p.tipo === "E");
    if (item) {
      // Aplica a regra de 70% ou 100% ao incrementar a quantidade
      const qtdRelogios = carrinho
        .filter((p) => p.tipo === "R")
        .reduce((acc, p) => acc + p.quantidade, 0);

      // Buscando as marcas dos relógios no carrinho
      const marcasRelogiosNoCarrinho = carrinho
        .filter((produto) => produto.tipo === "R") // Filtra apenas os relógios
        .map((produto) => produto.codigoMarca); // Pega as marcas dos relógios

      // Buscando as marcas compradas pelo cliente
      const queryQuemComprou = `
        SELECT DISTINCT codigoMarca FROM QuemComprouCliente 
        WHERE cpfCnpj = ?
      `;
      const resultQuemComprou = await db.getAllAsync(queryQuemComprou, [
        cpfCnpj || "",
      ]);
      const marcasCompradas = resultQuemComprou.map((r: any) => r.codigoMarca);

      // Verificando se a marca do expositor está entre as marcas compradas
      const limite = marcasCompradas.includes(item.codigoMarca)
        ? Math.round(qtdRelogios * 0.7)
        : qtdRelogios;

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
    }
  };

  const decrementQuantity = async (codigo: string) => {
    const item = carrinho.find((p) => p.codigo === codigo);
    if (item && item.quantidade > 1) {
      atualizarQuantidade(codigo, item.quantidade - 1);
      await new Promise((resolve) => setTimeout(resolve, 0));
      // adjustExpositores();
      setSyncExpositores(true);
    } else {
      // removerProduto(codigo);
      handleRemoverProduto(codigo);
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

  // 1) Função auxiliar: dado um códigoMarca, retorna o limite
  const getLimiteExpositor = async (codigoMarca: string) => {
    // soma todos os relógios daquela marca no carrinho
    const totalRel = carrinho
      .filter((p) => p.tipo === "R" && p.codigoMarca === codigoMarca)
      .reduce((sum, r) => sum + r.quantidade, 0);

    // busca as marcas que o cliente já comprou
    // (síncrono aqui só pra ilustrar; no seu caso keep usando db.getAllAsync)
    if (!cpfCnpj) {
      throw new Error("cpfCnpj is undefined. Cannot fetch data.");
    }
    const comprouRows: any[] = await db.getAllAsync(
      `SELECT DISTINCT codigoMarca FROM QuemComprouCliente WHERE cpfCnpj = ?`,
      [cpfCnpj]
    );
    const marcasCompradas = new Set(comprouRows.map((r) => r.codigoMarca));

    // se já comprou daquela marca, aplica 70%, senão 100%
    return marcasCompradas.has(codigoMarca)
      ? Math.round(totalRel * 0.7)
      : totalRel;
  };

  const handleRemoverProduto = async (codigoProduto: string) => {
    console.log("🔴 handleRemoverProduto chamado");
    const itemRemovido = carrinho.find((p) => p.codigo === codigoProduto);
    if (!itemRemovido) return;

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

        const novoCarrinho = carrinho.filter((p) => p.codigo !== codigoProduto);
        if (novoCarrinho.length === 0) {
          console.log("🔴 Último produto do carrinho, vai excluir pedido");
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
      }
    }

    removerProduto(codigoProduto);
  };

  const salvarCarrinhoNoBanco = async (
    clienteId: number,
    representanteId: number
  ) => {
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

    // console.log("1️⃣ Salvando carrinho no banco... (carrinho):", carrinho);

    const mp = carrinho[0]?.meiosPagamento;
    const meiosPagamentoStr = Array.isArray(mp)
      ? JSON.stringify(mp)
      : typeof mp === "string"
      ? mp
      : "[]";
    // const meiosPagamento = carrinho[0]?.meiosPagamento || "[]";

    // console.log("2️⃣ Meios de pagamento:", meiosPagamento);

    try {
      const produtosFiltrados = carrinho.map((produto) => ({
        codigo: produto.codigo,
        nomeEcommerce: produto.nomeEcommerce,
        quantidade: produto.quantidade,
        precoUnitario: produto.precoUnitario,
        precoUnitarioComIPI: produto.precoUnitarioComIPI,
        tipo: produto.tipo,
        imagem: produto.imagem ?? produto.imagem.uri,
        // cpfCnpj: produto.cpfCnpj,
        percentualDesconto: produto.percentualDesconto,
        descricaoSubGrupo: produto.descricaoSubGrupo,
        dataPrevistaPA: produto.dataPrevistaPA,
        meiosPagamento: meiosPagamentoStr ?? "[]",
      }));

      // console.log("3️⃣ Produtos filtrados:", produtosFiltrados);

      // const quantidadeItens = produtosFiltrados
      //   .filter((p) => p.tipo === "R")
      //   .reduce((acc, p) => acc + p.quantidade, 0);

      const quantidadeItens = produtosFiltrados.filter(
        (p) => p.tipo !== "E"
      ).length;
      const quantidadePecas = produtosFiltrados.reduce(
        (acc, p) => acc + p.quantidade,
        0
      );

      const subTotal = produtosFiltrados.reduce(
        (acc, p) =>
          acc + p.quantidade * (p.precoUnitarioComIPI || p.precoUnitario),
        0
      );

      // Calcula o valor total considerando o IPI, percental de desconto do produto
      const valorTotalComDescontoSemFrete = produtosFiltrados.reduce(
        (acc, p) => {
          const precoUnitario = p.precoUnitarioComIPI || p.precoUnitario;
          const desconto = (p.percentualDesconto || 0) / 100;
          return acc + p.quantidade * precoUnitario * (1 - desconto);
        },
        0
      );

      const fretePercentualCalculado = await getFretePercentualPorCliente(
        clienteId,
        valorTotalComDescontoSemFrete,
        Number(representanteId)
      );

      let freteCalculado = 0;
      if (
        fretePercentualCalculado !== undefined &&
        fretePercentualCalculado !== null
      ) {
        freteCalculado =
          (valorTotalComDescontoSemFrete * fretePercentualCalculado) / 100;
      } else {
        freteCalculado = 0; // Se não houver percentual, o frete é zero
      }

      const valorTotal = valorTotalComDescontoSemFrete + (freteCalculado ?? 0);

      const produtosJson = JSON.stringify(produtosFiltrados);
      // const meiosPagamento = carrinho[0]?.meiosPagamento || "[]";

      if (enderecoSelecionado && enderecoSelecionado !== null) {
        enderecoEntrega = enderecoSelecionado.endereco || null;
        bairroEntrega = enderecoSelecionado.bairro || null;
        cepEntrega = enderecoSelecionado.cep || null;
        complementoEntrega = enderecoSelecionado.complemento || null;
        estadoEntrega = enderecoSelecionado.estado || null;
        municipioEntrega = enderecoSelecionado.municipio || null;
        numeroEntrega = enderecoSelecionado.numero || null;
      }

      const alterarEnderecoEntrega = carrinhoInfo.alterarEnderecoDeEntrega
        ? carrinhoInfo.alterarEnderecoDeEntrega
        : 0;

      await db.runAsync(
        `UPDATE Pedido 
          SET 
            produtos = ?, 
            quantidadeItens = ?, 
            quantidadePecas = ?, 
            valorTotal = ?, 
            enderecoEntrega = ?,
            numeroEntrega = ?,
            cepEntrega = ?,
            bairroEntrega = ?,
            complementoEntrega = ?,
            estadoEntrega = ?,
            municipioEntrega = ?,
            alterarEnderecoDeEntrega = ?,
            meiosPagamento = ?
          WHERE id = ?;`,
        [
          produtosJson,
          quantidadeItens,
          quantidadePecas,
          valorTotal,
          enderecoEntrega,
          numeroEntrega,
          cepEntrega,
          bairroEntrega,
          complementoEntrega,
          estadoEntrega,
          municipioEntrega,
          alterarEnderecoEntrega,
          meiosPagamentoStr,
          // JSON.stringify(meiosPagamento),
          carrinhoInfo.id,
        ]
      );

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

  return (
    <ScrollView>
      {Object.entries(carrinhosAgrupadosPorCnpj).map(
        ([cpfCnpj, produtosLoja], index) => {
          const dadosLoja = dadosLojas[cpfCnpj] || {
            razaoSocial: "Loja não encontrada",
            enderecoEntrega: "Endereço não disponível",
            formaDePagamento: "Forma de pagamento desconhecida",
          };

          const dadosLojaEndereco = dadosLoja?.enderecoEntrega;
          const dadosLojaFormaPagamento = dadosLoja?.formaDePagamento;

          return (
            <ContainerCardEmpresa key={`${cpfCnpj}-${index}-${index}`}>
              <ContentCardEmpresa>
                <HeaderCardEmpresa>
                  <ContainerNomeEmpresa>
                    <TextEmpresa fontSize={16} weight={700}>
                      Loja: {dadosLoja.razaoSocial}
                    </TextEmpresa>
                    <TextEmpresa fontSize={14} weight={400}>
                      {formatarEnderecoCompleto(dadosLojaEndereco)}
                    </TextEmpresa>

                    <TextEmpresa fontSize={14} weight={400}>
                      Forma de Pagamento: {formaPagamento}
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
                    onEnderecoAtualizado={(novoEndereco) => {
                      setEnderecoSelecionado(novoEndereco);
                      setDadosLojas((prev) => ({
                        ...prev,
                        [cpfCnpj]: {
                          ...prev[cpfCnpj],
                          enderecoEntrega: novoEndereco,
                        },
                      }));
                    }}
                  />
                </HeaderCardEmpresa>
                <ContainerPedido>
                  {produtosLoja.map((produto, produtoIndex) => (
                    <ItemPedido
                      key={`${cpfCnpj}-${produto.codigo}-${produtoIndex}`}
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
                              onPress={() =>
                                produto.tipo !== "E"
                                  ? decrementQuantity(produto.codigo)
                                  : decrementQuantityExpositor(produto.codigo)
                              }
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
                              onEndEditing={async ({ nativeEvent }) => {
                                const typed =
                                  parseInt(
                                    nativeEvent.text.replace(/[^0-9]/g, ""),
                                    10
                                  ) || 0;
                                if (produto.tipo !== "E") {
                                  // se for relógio, dispara ajuste automático
                                  await adjustExpositores();
                                  setSyncExpositores(true);
                                } else {
                                  // se for expositor, clampa ao limite
                                  const limite = await getLimiteExpositor(
                                    produto.codigoMarca
                                  );
                                  const final = Math.min(typed, limite);
                                  if (typed > limite) {
                                    Alert.alert(
                                      "Limite de Expositor",
                                      `O máximo permitido é ${limite} unidades para esta marca.`
                                    );
                                  }
                                  atualizarQuantidade(produto.codigo, final);
                                }
                              }}
                              onChangeText={(e) => {
                                const newValue = e.replace(/[^0-9]/g, "");
                                if (newValue) {
                                  atualizarQuantidade(
                                    produto.codigo,
                                    parseInt(newValue)
                                  );
                                }
                              }}
                              maxLength={8}
                              keyboardType="number-pad"
                              style={{ width: 100, textAlign: "center" }}
                            />

                            <TouchableOpacity
                              onPress={() =>
                                produto.tipo !== "E"
                                  ? incrementQuantity(produto.codigo)
                                  : incrementQuantityExpositor(produto.codigo)
                              }
                            >
                              <Feather name="plus" size={38} color="black" />
                            </TouchableOpacity>

                            <Text style={{ fontSize: 18 }}>
                              {(
                                produto.quantidade *
                                (produto.precoUnitarioComIPI ||
                                  produto.precoUnitario)
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
                        onPress={() => {
                          handleRemoverProduto(produto.codigo);
                        }}
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
                  {formatCurrency(
                    produtosLoja.reduce(
                      (total, produto) =>
                        total +
                        produto.quantidade *
                          (produto.precoUnitarioComIPI ||
                            produto.precoUnitario),
                      0
                    )
                  )}
                </TextEmpresa>
                <TextEmpresa fontSize={17} weight={600}>
                  Total:{" "}
                  {valorTotalComFrete === null
                    ? "Calculando..."
                    : formatCurrency(valorTotalComFrete)}
                </TextEmpresa>
                {/* <TextEmpresa fontSize={17} weight={600}>
                  Total:{" "}
                  {(
                    calcularSubtotalCarrinho(produtosLoja) +
                    Number(freteDoPedido)
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TextEmpresa> */}
              </ContainerFooterCard>
            </ContainerCardEmpresa>
          );
        }
      )}
      <ContainerButtonsFooter>
        <ButtonAddNewProducts
          onPress={() => {
            handleAddNewProducts();
          }}
        >
          <ButtonTextBlue>Adicionar Novos Produtos</ButtonTextBlue>
        </ButtonAddNewProducts>

        <ButtonChangePaymentMethod
          onPress={() => {
            changePaymentMethod();
          }}
        >
          <ButtonTextBlue>Alterar Forma de Pagamento</ButtonTextBlue>
        </ButtonChangePaymentMethod>
      </ContainerButtonsFooter>
      <ContainerButtonsSaveAndCancel>
        <ButtonCancel
          onPress={() => {
            navigation.navigate("PedidosEmAberto");
          }}
        >
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

            const sucesso = await salvarCarrinhoNoBanco(
              carrinhoInfo.clienteId,
              carrinhoInfo.representanteId
            );

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
          <ButtonText>Salvar</ButtonText>
        </ButtonConfirm>
      </ContainerButtonsSaveAndCancel>
    </ScrollView>
  );
};
