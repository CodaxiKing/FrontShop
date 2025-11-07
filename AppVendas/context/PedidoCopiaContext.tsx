import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Contexto ENXUTO para copiar um pedido existente para um novo cliente.
 * Mantém apenas o necessário para preparar o novo carrinho.
 */

// ---- Tipos ---------------------------------------------------------------
export type OrderProduct = {
  codigo: string;
  quantidade: number;
};

export type TargetClient = {
  cpfCnpj: string;
  clienteId: string | number;
  codigoCliente?: string | number;
  razaoSocial?: string;
  enderecoCompleto?: string;
  enderecos?: any[];
};

export type SelectedTabelaPreco = {
  value: string | number;
  tipo: string;
};

export type ProdutoCatalogoMin = {
  codigo: string;
  precoUnitario?: number;
  precoUnitarioComIPI?: number;
  nomeEcommerce?: string;
  imagem?: string;
};

// ---- Utils ---------------------------------------------------------------
const parseProdutosField = (
  raw: unknown
): Array<{ codigo?: string; quantidade?: number }> => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as any[];
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Converte o JSON do pedido sincronizado -> lista mínima de {codigo, quantidade}
export function extractOrderProducts(rawPedido: any): OrderProduct[] {
  const arr = parseProdutosField(rawPedido?.produtos);
  return arr
    .map((p: any) => ({
      codigo: String(p?.codigo ?? ""),
      dataPrevistaPA: String(p?.dataPrevistaPA ?? ""),
      descricaoSubGrupo: String(p?.descricaoSubGrupo ?? ""),
      nomeEcommerce: String(p?.nomeEcommerce ?? ""),
      percentualDesconto: Number(p?.percentualDesconto ?? 0),
      precoUnitario: Number(p?.precoUnitario),
      precoUnitarioComIPI: Number(p?.precoUnitarioComIPI),
      quantidade: Number(p?.quantidade ?? 1) || 1,
      tipo: String(p?.tipo ?? "R"),
      imagem: String(p?.imagem ?? ""),
    }))
    .filter((p) => p.codigo);
}

/* 
Exemplo de como vem o produto
[{"codigo": "COVD34AZ/4P", "dataPrevistaPA": "", "descricaoSubGrupo": "MASCULINO_SOLO", "imagem": "https://bucket-fotos-app.s3.us-east-1.amazonaws.com/COVD34AZ4P_1.jpg", "nomeEcommerce": "REL. ANA. DUALTIME/CX MT E PULS.ACO PRATA CONDOR", "percentualDesconto": 0, "precoUnitario": 229.5, "precoUnitarioComIPI": 0, "quantidade": 1, "tipo": "R"}]
*/

// Une produtos do pedido (por codigo) com o catálogo/tabela para obter preços atuais
export function mergeOrderWithTabela(
  orderProducts: OrderProduct[],
  tabelaProdutos: ProdutoCatalogoMin[]
): Array<OrderProduct & ProdutoCatalogoMin> {
  const byCode = new Map<string, ProdutoCatalogoMin>();
  for (const tp of tabelaProdutos || []) {
    if (tp?.codigo) byCode.set(String(tp.codigo), tp);
  }
  return orderProducts.map((op) => ({
    ...op,
    ...(byCode.get(op.codigo) || {}),
  }));
}

// ---- Contexto ------------------------------------------------------------

type Ctx = {
  // origem
  selectedOrderRawState: any | null;
  orderProducts: OrderProduct[]; // só {codigo, quantidade}

  // destino
  targetClient: TargetClient | null;
  selectedTabela: SelectedTabelaPreco | null;

  // buffer para auto-criação do carrinho ao entrar no catálogo
  stagedCartItems: Array<OrderProduct & ProdutoCatalogoMin>;
  shouldAutoCreateCart: boolean;

  // ações
  setSelectedOrderRaw: (raw: any) => void;
  clearAll: () => void;
  setTargetClient: (client: TargetClient) => void;
  setSelectedTabela: (tab: SelectedTabelaPreco) => void;
  stageCartFromTabela: (tabelaProdutos: ProdutoCatalogoMin[]) => void; // calcula stagedCartItems
  consumeAutoCreateFlag: () => void; // zera o flag após criar o carrinho
};

const PedidoCopiaCtx = createContext<Ctx | null>(null);

export const PedidoCopiaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedOrderRawState, setSelectedOrderRawState] = useState<
    any | null
  >(null);
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [targetClient, setTargetClientState] = useState<TargetClient | null>(
    null
  );
  const [selectedTabela, setSelectedTabelaState] =
    useState<SelectedTabelaPreco | null>(null);
  const [stagedCartItems, setStagedCartItems] = useState<
    Array<OrderProduct & ProdutoCatalogoMin>
  >([]);
  const [shouldAutoCreateCart, setShouldAutoCreateCart] = useState(false);

  const setSelectedOrderRaw = useCallback((raw: any) => {
    setSelectedOrderRawState(raw || null);
    setOrderProducts(extractOrderProducts(raw));
    setStagedCartItems([]); // reset do stage ao trocar pedido
    setShouldAutoCreateCart(false);
  }, []);

  const clearAll = useCallback(() => {
    setSelectedOrderRawState(null);
    setOrderProducts([]);
    setTargetClientState(null);
    setSelectedTabelaState(null);
    setStagedCartItems([]);
    setShouldAutoCreateCart(false);
  }, []);

  const setTargetClient = useCallback((client: TargetClient) => {
    setTargetClientState(client);
  }, []);

  const setSelectedTabela = useCallback((tab: SelectedTabelaPreco) => {
    setSelectedTabelaState(tab);
  }, []);

  const stageCartFromTabela = useCallback(
    (tabelaProdutos: ProdutoCatalogoMin[]) => {
      const merged = mergeOrderWithTabela(orderProducts, tabelaProdutos);
      setStagedCartItems(merged);
      setShouldAutoCreateCart(merged.length > 0);
    },
    [orderProducts]
  );

  const consumeAutoCreateFlag = useCallback(
    () => setShouldAutoCreateCart(false),
    []
  );

  // if (__DEV__) {
  //   console.log("Target Client(PedidoCopiaProvider):", targetClient);
  //   console.log("Order Products(PedidoCopiaProvider):", orderProducts);
  //   console.log("Selected Tabela(PedidoCopiaProvider):", selectedTabela);
  //   console.log("Staged Cart From(PedidoCopiaProvider):", stagedCartItems);
  // }

  const value = useMemo<Ctx>(
    () => ({
      selectedOrderRaw: selectedOrderRawState, // mapeia explicitamente
      selectedOrderRawState,
      orderProducts,
      targetClient,
      selectedTabela,
      stagedCartItems,
      shouldAutoCreateCart,
      setSelectedOrderRaw,
      clearAll,
      setTargetClient,
      setSelectedTabela,
      stageCartFromTabela,
      consumeAutoCreateFlag,
    }),
    [
      selectedOrderRawState,
      orderProducts,
      targetClient,
      selectedTabela,
      stagedCartItems,
      shouldAutoCreateCart,
      setSelectedOrderRaw,
      clearAll,
      setTargetClient,
      setSelectedTabela,
      stageCartFromTabela,
      consumeAutoCreateFlag,
    ]
  );

  return (
    <PedidoCopiaCtx.Provider value={value}>{children}</PedidoCopiaCtx.Provider>
  );
};

export function usePedidoCopia() {
  const ctx = useContext(PedidoCopiaCtx);
  if (!ctx)
    throw new Error(
      "usePedidoCopia deve ser usado dentro de <PedidoCopiaProvider />"
    );
  return ctx;
}
