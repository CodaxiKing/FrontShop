// import { IProdutoLoja } from "@/components/CardProdutoCatalogo";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { useClientInfo } from "@/context/ClientInfoContext"; // ajuste o caminho conforme necessário
import * as SQLite from "expo-sqlite";
import { useNavigation } from "expo-router";
import { CarrinhoInfo } from "../components/CardCarrinho/IconesCardCarrinho";
const db = SQLite.openDatabaseSync("user_data.db");

interface IProdutoLoja {
  cpfCnpj: string;
  tipo: string;
  quantidade: number;
  codigo: string;
  codigoMarca: string;
  percentualDesconto: number;
  dataPrevistaPA?: string | null;
  descricaoSubGrupo: string;
  precoUnitario: number;
  precoUnitarioComIPI: number;
  imagem: string;
  nomeEcommerce: string;
  descricaoMarca?: string;
  produtos: [
    {
      codigo: string;
      nomeEcommerce: string;
      quantidade: number;
      precoUnitario: number;
      precoUnitarioComIPI: number;
      tipo: string;
      imagem: string;
      dataPrevistaPA?: string | null;
      descricaoSubGrupo: string;
    }
  ];
}
interface EditarPedidoAbertoContextType {
  carrinho: IProdutoLoja[];
  setCarrinho: React.Dispatch<React.SetStateAction<IProdutoLoja[]>>;
  adicionarProduto: (produto: IProdutoLoja) => Promise<number>;
  diminuirProduto: (produto: IProdutoLoja) => void;
  removerProduto: (codigo: string) => void;
  removerProdutoSemAviso: (codigo: string) => void;
  atualizarQuantidade: (codigo: string, quantidade: number) => void;
  carregarCarrinho: (produtos: IProdutoLoja[]) => void;
  validarEReajustarExpositores: () => void;
  preencherDadosProduto: (produto: IProdutoLoja) => Promise<IProdutoLoja>;

  quantidadesCarrinho: Record<string, number>;
}

const EditarPedidoAbertoContext = createContext<
  EditarPedidoAbertoContextType | undefined
>(undefined);

export const EditarPedidoAbertoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const navigation = useNavigation();
  const [carrinho, setCarrinho] = useState<IProdutoLoja[]>([]);
  // Importa contexto do cliente
  // Ajuste o caminho se necessário
  const { razaoSocialContext, selectedClientContext } =
    require("./ClientInfoContext").useClientInfoContext();
  const [marcasCompradas, setMarcasCompradas] = useState<Set<string>>(
    new Set()
  );

  const cpfCnpj = carrinho[0]?.cpfCnpj || ""; // Obter o CPF/CNPJ do primeiro produto do carrinho

  useEffect(() => {
    if (!cpfCnpj) return;
    db.getAllAsync(
      `SELECT DISTINCT codigoMarca FROM QuemComprouCliente WHERE cpfCnpj = ?`,
      [cpfCnpj]
    ).then((rows: any[]) => {
      setMarcasCompradas(new Set(rows.map((r) => r.codigoMarca)));
    });
  }, [cpfCnpj]);

  const adicionarProduto = async (produto: IProdutoLoja): Promise<number> => {
    // A 'produto' que chega aqui é o objeto gigante do catálogo.
    // Vamos limpá-lo e mapeá-lo para a estrutura correta.
    const razaoSocial =
      produto.razaoSocial ||
      carrinho[0]?.razaoSocial ||
      produto.cliente?.razaoSocial ||
      razaoSocialContext ||
      selectedClientContext?.razaoSocial ||
      "Cliente não definido";

    const produtoMapeado: IProdutoLoja = {
      // Campos essenciais que queremos manter
      ...produto,
      codigo: produto.codigo,
      nomeEcommerce: produto.nomeEcommerce,
      quantidade: 1, // Sempre adicionamos 1 de cada vez
      precoUnitario: produto.precoUnitario,
      precoUnitarioComIPI: produto.precoUnitarioComIPI,
      tipo: produto.tipoProduto === "000006" ? "R" : "E", // Exemplo de lógica para definir o tipo
      imagem: produto.imagem, // Supondo que a imagem já venha no formato { uri: '...' }
      descricaoSubGrupo: produto.descricaoSubGrupo,
      dataPrevistaPA: produto.dataPrevistaPA,
      descricaoMarca: produto.descricaoMarca,
      codigoMarca: produto.codigoMarca,
      precoOriginalSemDesconto: produto.precoUnitario, // Ou produto.precoOriginalSemDesconto
      razaoSocial,
    };

    const produtoCompleto = await preencherDadosProduto(produtoMapeado);

    let proxQtd = 0;

    setCarrinho((prevCarrinho) => {
      const produtoExistente = prevCarrinho.find(
        (p) => p.codigo === produtoCompleto.codigo
      );

      if (produtoExistente) {
        proxQtd = (produtoExistente.quantidade || 0) + 1;
        return prevCarrinho.map((p) =>
          p.codigo === produtoCompleto.codigo
            ? { ...p, quantidade: proxQtd }
            : p
        );
      } else {
        proxQtd = 1;

        //Salva o meio de pagamento e motivo de bonificação existentes, após adicionar um novo produto
        const meiosPagamentoExistentes = prevCarrinho[0]?.meiosPagamento;
        const motivoBonificacaoExistente = prevCarrinho[0]?.motivoBonificacao;

        const produtoFinal = {
          ...produtoCompleto,
          meiosPagamento: meiosPagamentoExistentes,
          motivoBonificacao: motivoBonificacaoExistente,
        };

        // Adicionamos o produto JÁ MAPEADO E LIMPO
        return [...prevCarrinho, produtoFinal];
      }
    });

    return proxQtd;
  };
  const diminuirProduto = async (produto: IProdutoLoja) => {
    const produtoCompleto = await preencherDadosProduto(produto);
    const codigo = produtoCompleto?.codigo ?? produto.codigo;

    setCarrinho((prevCarrinho) => {
      const produtoExistente = prevCarrinho.find((p) => p.codigo === codigo);
      if (produtoExistente) {
        return prevCarrinho.map((p) =>
          p.codigo === codigo
            ? { ...p, quantidade: (Number(p.quantidade) || 0) - 1 }
            : p
        );
      }
      return prevCarrinho;
    });
  };

  const removerProduto = (codigo: string) => {
    // console.log("Removendo Produto (EditarPedidoAbertoContext)");
    Alert.alert(
      "Remover produto",
      "Tem certeza que deseja remover este produto do pedido?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setCarrinho((prevCarrinho) => {
              const novoCarrinho = prevCarrinho.filter(
                (item) => item.codigo !== codigo
              );
              if (novoCarrinho.length === 0) {
                navigation.navigate("PedidosEmAberto");
                return novoCarrinho;
              }
              return novoCarrinho;
            });
          },
        },
      ]
    );
  };

  const removerProdutoSemAviso = (codigo: string) => {
    setCarrinho((prevCarrinho) =>
      prevCarrinho.filter((item) => item.codigo !== codigo)
    );
  };

  const atualizarQuantidade = (codigo: string, novaQuantidade: number) => {
    setCarrinho((prev) =>
      prev.map((produto) =>
        produto.codigo === codigo
          ? { ...produto, quantidade: novaQuantidade }
          : produto
      )
    );
  };

  const validarEReajustarExpositores = async (): Promise<boolean> => {
    const mapQuantidadePorMarca = new Map<string, number>();
    const mapExpositoresPorMarca = new Map<string, IProdutoLoja[]>();
    // const marcasJaCompradas = new Set<string>();

    const resultQuemComprou = await db.getAllAsync(
      `SELECT DISTINCT codigoMarca FROM QuemComprouCliente WHERE cpfCnpj = ?`,
      [cpfCnpj]
    );
    const marcasJaCompradas = resultQuemComprou.map((row) => row.codigoMarca);

    // Agrupar os relógios e expositores por marca
    carrinho.forEach((produto) => {
      const codigoMarca = produto.codigoMarca;
      if (!codigoMarca) return;

      if (produto.tipo === "R") {
        mapQuantidadePorMarca.set(
          codigoMarca,
          (mapQuantidadePorMarca.get(codigoMarca) || 0) + produto.quantidade
        );
      } else if (produto.tipo === "E") {
        if (!mapExpositoresPorMarca.has(codigoMarca)) {
          mapExpositoresPorMarca.set(codigoMarca, []);
        }
        mapExpositoresPorMarca.get(codigoMarca)?.push(produto);
      }
    });

    let novoCarrinho = [...carrinho];
    let ultrapassouLimite = false;

    // Validar se a quantidade de cada expositor está dentro do limite
    for (const [codigoMarca, expositores] of mapExpositoresPorMarca.entries()) {
      const qtdProduto = mapQuantidadePorMarca.get(codigoMarca) || 0;

      // 🔍 nova lógica: se cliente já comprou produto da marca, aplica 70%; senão, aplica 100%
      const limite = marcasJaCompradas.includes(codigoMarca)
        ? Math.round(qtdProduto * 0.7)
        : qtdProduto;

      let restante = limite;

      novoCarrinho = novoCarrinho.map((produto) => {
        if (produto.tipo === "E" && produto.codigoMarca === codigoMarca) {
          // Se a quantidade do expositor exceder o limite
          if (produto.quantidade > limite) {
            // Ajusta a quantidade do expositor para o limite
            ultrapassouLimite = true; // Marca como ultrapassou o limite

            return { ...produto, quantidade: limite };
          } else {
            // Caso contrário, apenas mantém a quantidade do expositor
            return produto;
          }
        }
        return produto;
      });
    }

    if (ultrapassouLimite) {
      // console.log(novoCarrinho);
      Alert.alert(
        "Atenção",
        "A quantidade de expositores foi ajustada para não ultrapassar o limite permitido com base nos produtos."
      );
      setCarrinho(novoCarrinho);
      return false;
    }
    return true;
  };

  async function preencherDadosProduto(
    produto: IProdutoLoja
  ): Promise<IProdutoLoja> {
    let catalogo: any[] = [];
    let imagemUrl = "";
    let codigoMarca = produto.codigoMarca ?? "";
    let nomeEcommerce = produto.nomeEcommerce;
    let precoOriginalSemDesconto = produto.precoUnitario;
    let descricaoMarca = produto.descricaoMarca;

    try {
      const tabela = produto.tipo === "E" ? "Expositor" : "Catalogo";
      const result = await db.getAllAsync(
        `SELECT nomeEcommerce, imagens, descricaoMarca, codigoMarca FROM ${tabela} WHERE codigo = ?;`,
        [produto.codigo]
      );
      if (result.length) {
        const [produto] = result;

        nomeEcommerce = produto.nomeEcommerce;
        descricaoMarca = produto.descricaoMarca;
        codigoMarca = produto.codigoMarca;
        const imgs: { imagemUrl: string }[] = JSON.parse(
          produto.imagens || "[]"
        );
        imagemUrl = imgs[0]?.imagemUrl ?? "";
      }

      // só para o preço original sem desconto, se quiser
      if (tabela === "Catalogo") {
        const pr = await db.getAllAsync(
          `SELECT precoUnitario FROM Catalogo WHERE codigo = ?;`,
          [produto.codigo]
        );
        if (pr.length) precoOriginalSemDesconto = pr[0].precoUnitario;
      }
    } catch (e) {
      console.warn("Erro em preencherDadosProduto:", e);
    }

    return {
      ...produto,
      nomeEcommerce,
      descricaoMarca,
      codigoMarca,
      imagem: { uri: imagemUrl },
      precoOriginalSemDesconto,
    };
  }

  const carregarCarrinho = async (produtos: IProdutoLoja[]) => {
    const completos = await Promise.all(
      produtos.map((produto) => preencherDadosProduto(produto))
    );
    setCarrinho(completos);
  };

  const quantidadesCarrinho = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of carrinho) {
      map[p.codigo] = Number(p.quantidade) || 0;
    }
    return map;
  }, [carrinho]);

  return (
    <EditarPedidoAbertoContext.Provider
      value={{
        carrinho,
        setCarrinho,
        adicionarProduto,
        removerProduto,
        removerProdutoSemAviso,
        atualizarQuantidade,
        carregarCarrinho,
        validarEReajustarExpositores,
        diminuirProduto,
        preencherDadosProduto,

        quantidadesCarrinho,
      }}
    >
      {children}
    </EditarPedidoAbertoContext.Provider>
  );
};

export const useEditarPedidoAberto = (): EditarPedidoAbertoContextType => {
  const context = useContext(EditarPedidoAbertoContext);
  if (!context) {
    throw new Error(
      "useEditarPedidoAberto deve ser usado dentro de um EditarPedidoAbertoProvider"
    );
  }
  return context;
};
