// src/services/pedidoCopiaService.ts
import type {
  SelectedTabelaPreco,
  TargetClient,
  OrderProduct,
} from "@/context/PedidoCopiaContext";

/**
 * Argumentos para criação do carrinho via itens em staging.
 */
export type CreateCartArgs = {
  items: Array<
    OrderProduct & {
      codigo: string;
      quantidade: number; // <- vem do pedido original
      codigoMarca?: string;
      nomeEcommerce?: string;
      imagem?: string | null;
      precoUnitario?: number;
      precoUnitarioComIPI?: number;
      descricaoSubGrupo?: string;
      dataPrevistaPA?: string | null;
      tipo?: string; // <- vem do pedido original
    }
  >;
  client: TargetClient & { razaoSocial?: string };
  representanteId: string | number;
  selectedTabela?: SelectedTabelaPreco | null;

  /**
   * Função para adicionar um produto ao carrinho.
   * Ela deve ser compatível com a assinatura do seu ProdutoQuantidadeContext.incrementar(...)
   */
  setQuantidade: (
    codigo: string,
    codigoMarca: string,
    qtd: number,
    cpfCnpj: string,
    clienteId: string | number,
    razaoSocial: string,
    representanteId: string | number,
    nomeEcommerce?: string,
    precoUnitario?: number,
    precoUnitarioComIPI?: number,
    imagem?: any,
    representanteCreateId?: string | number,
    selectedTabela?: { value?: string },
    selectedClient?: {
      cpfCnpj: string;
      clienteId: string | number;
      razaoSocial: string;
      enderecoCompleto?: string;
      enderecos?: any[];
      codigoCliente: string | number;
    },
    descricaoSubGrupo?: string,
    dataPrevistaPA?: string,
    tipo?: string
  ) => Promise<void>;

  /**
   * Ref (booleana) opcional para evitar reentradas simultâneas.
   * Passe um React.useRef(false) de fora, ou deixe que o service crie um guarda interno.
   */
  processingRef?: { current: boolean };
};

/**
 * Cria o carrinho a partir dos itens em staging.
 * - Respeita a quantidade original (loop 0..qty-1).
 * - Evita reentradas usando um ref (se fornecido).
 * - NÃO consome nenhuma flag: é “pura” e focada na criação.
 */
export async function createCartFromStaged({
  items,
  client,
  representanteId,
  selectedTabela,
  setQuantidade,
  processingRef,
}: CreateCartArgs): Promise<void> {
  // guarda opcional contra reentradas
  if (processingRef?.current) return;
  if (processingRef) processingRef.current = true;

  try {
    if (!client?.cpfCnpj || !client?.clienteId) return;
    if (!items?.length) return;

    // snapshot defensivo
    const snapItems = [...items];
    const cli = { ...client };

    for (const item of snapItems) {
      console.log("🎈 Item of SpanItems (pedidoCopiaService):", item.tipo);
      const qtd = Math.max(1, Number(item.quantidade ?? 1));
      await setQuantidade(
        String(item.codigo),
        String(item.codigoMarca ?? ""),
        qtd, // <<<<<< quantidade final de uma vez
        String(cli.cpfCnpj),
        String(cli.clienteId),
        String(cli.razaoSocial ?? ""),
        String(representanteId),
        String(item.nomeEcommerce ?? ""),
        Number(item.precoUnitario ?? 0),
        Number(item.precoUnitarioComIPI ?? 0),
        item.imagem ?? null,
        String(representanteId), // ou representanteCreateId se tiver
        selectedTabela ?? { value: "999999" },
        {
          cpfCnpj: String(cli.cpfCnpj),
          clienteId: String(cli.clienteId),
          razaoSocial: String(cli.razaoSocial ?? ""),
          enderecoCompleto: cli.enderecoCompleto,
          enderecos: cli.enderecos as any[],
          codigoCliente: String(cli.codigoCliente ?? ""),
        },
        item.descricaoSubGrupo,
        item.dataPrevistaPA ?? "",
        String(item.tipo)
      );
    }
  } finally {
    if (processingRef) processingRef.current = false;
  }
}

/**
 * Argumentos para o gatilho automático (consome flag e chama createCartFromStaged).
 */
export type TriggerAutoArgs = {
  shouldAutoCreateCart: boolean;
  consumeAutoCreateFlag: () => void;
  stagedCartItems: CreateCartArgs["items"];
  client: CreateCartArgs["client"];
  representanteId: CreateCartArgs["representanteId"];
  selectedTabela: CreateCartArgs["selectedTabela"];
  setQuantidade: CreateCartArgs["setQuantidade"];
  processingRef?: CreateCartArgs["processingRef"];
};

/**
 * Consome a flag e dispara a criação do carrinho uma única vez por ciclo.
 * - Consome a flag logo no início (evita re-disparo por rerenders / StrictMode).
 * - Faz snapshot dos dados.
 */
export async function triggerAutoCreateCart({
  shouldAutoCreateCart,
  consumeAutoCreateFlag,
  stagedCartItems,
  client,
  representanteId,
  selectedTabela,
  setQuantidade,
  processingRef,
}: TriggerAutoArgs): Promise<void> {
  if (!shouldAutoCreateCart) return;

  // consome a flag imediatamente para evitar reentradas por rerender
  consumeAutoCreateFlag();

  await createCartFromStaged({
    items: stagedCartItems,
    client,
    representanteId,
    selectedTabela,
    setQuantidade,
    processingRef,
  });
}
