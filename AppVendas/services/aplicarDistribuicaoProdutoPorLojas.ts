import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import {
  inserirPedido,
  atualizarPedido,
  buscarPedido,
} from "@/repositories/PedidoRepository";

type SelectedClientSnapshot = {
  clienteId: string;
  cpfCnpj: string;
  razaoSocial: string;
  enderecoCompleto?: string;
  enderecos?: any[];
  codigoCliente?: string;
};

type DistribuicaoInput = {
  produto: CatalogoItem;
  qtdMap: Record<string, number>;
  pedidoAtual: any | null;

  clientePrincipalCpfCnpj: string;
  clienteId: string;
  representanteId: string;
  representanteCreateId?: string;

  selectedTabelaPreco: string;

  selectedClient: SelectedClientSnapshot;
};

type DistribuicaoResult = {
  sucesso: string[];
  falha: { cpfCnpj: string; motivo: string }[];
};

export async function aplicarDistribuicaoProdutoPorLojas(
  input: DistribuicaoInput
): Promise<DistribuicaoResult> {
  const {
    produto,
    qtdMap,
    pedidoAtual,
    clientePrincipalCpfCnpj,
    clienteId,
    representanteId,
    representanteCreateId,
    selectedTabelaPreco,
    selectedClient,
  } = input;

  const normCpf = (v: any) => String(v ?? "").replace(/\D/g, "");

  // ✅ SEMPRE buscar de novo para evitar snapshot stale
  const rowsLatest = await buscarPedido(
    selectedClient.cpfCnpj,
    selectedClient.clienteId,
    representanteId
  );

  let pedidoEfetivo = rowsLatest?.[0] ?? null;

  // fallback: se por algum motivo não achou, tenta usar o state
  if (!pedidoEfetivo && pedidoAtual) {
    pedidoEfetivo = pedidoAtual;
  }

  // 1) Parse seguro
  let produtosPorLoja: any[] = [];
  try {
    produtosPorLoja = pedidoEfetivo?.produtos
      ? JSON.parse(pedidoEfetivo.produtos)
      : [];
  } catch {
    produtosPorLoja = [];
  }
  if (!Array.isArray(produtosPorLoja)) produtosPorLoja = [];

  // 2) Indexa buckets existentes por cpf normalizado
  const bucketByCpf = new Map<string, any>();
  for (const b of produtosPorLoja) {
    const cpf = normCpf(b?.cpfCnpj);
    if (!cpf) continue;
    // garante shape
    if (!Array.isArray(b.produtos)) b.produtos = [];
    bucketByCpf.set(cpf, b);
  }

  // 3) Garante bucket apenas para lojas que têm qtd > 0 (e normaliza keys)
  for (const [cpfRaw, qtd] of Object.entries(qtdMap)) {
    const cpf = normCpf(cpfRaw);
    if (!cpf) continue;

    // se a loja está 0, não precisa criar bucket aqui
    if ((qtd ?? 0) <= 0) continue;

    let bucket = bucketByCpf.get(cpf);

    if (!bucket) {
      bucket = { cpfCnpj: cpf, produtos: [], enderecoEntrega: null };
      produtosPorLoja.push(bucket);
      bucketByCpf.set(cpf, bucket);
    }
  }

  // 4) Aplica update/insert/remove usando SEMPRE o Map

  const sucesso: string[] = [];
  const falha: { cpfCnpj: string; motivo: string }[] = [];
  for (const [cpfRaw, quantidadeFinal] of Object.entries(qtdMap)) {
    try {
      const cpf = normCpf(cpfRaw);
      if (!cpf) continue;

      const bucket = bucketByCpf.get(cpf);
      if (!bucket) {
        // se qtd > 0 e bucket não existe, algo muito errado com normalização/inputs
        continue;
      }

      const produtos = bucket.produtos as any[];
      const idx = produtos.findIndex(
        (p) => String(p?.codigo) === String(produto.codigo)
      );

      if ((quantidadeFinal ?? 0) <= 0) {
        if (idx !== -1) produtos.splice(idx, 1);
        sucesso.push(cpfRaw);
        continue;
      }

      if (idx !== -1) {
        produtos[idx] = { ...produtos[idx], quantidade: quantidadeFinal };
      } else {
        produtos.push({
          codigo: produto.codigo,
          codigoMarca: (produto as any).codigoMarca,
          nomeEcommerce: produto.nomeEcommerce ?? "",
          quantidade: quantidadeFinal,
          precoUnitario: produto.precoUnitario ?? 0,
          precoUnitarioComIPI:
            (produto as any).precoComIPI ?? produto.precoUnitario ?? 0,
          imagem: produto.imagens?.[0]?.imagemUrl ?? "",
          tipo: "R",
          descricaoSubGrupo: (produto as any).descricaoSubGrupo ?? "",
          dataPrevistaPA: (produto as any).dataPrevistaPA ?? "",
        });
        sucesso.push(cpfRaw);
      }
    } catch (e: any) {
      falha.push({
        cpfCnpj: cpfRaw,
        motivo: e?.message ?? "Erro desconhecido",
      });
    }
  }

  // 3.5) Remove itens com qtd <= 0 e depois remove buckets vazios
  produtosPorLoja = (produtosPorLoja ?? [])
    .map((b) => {
      const prods = Array.isArray(b?.produtos) ? b.produtos : [];
      return {
        ...b,
        produtos: prods.filter((p: any) => (p?.quantidade ?? 0) > 0),
      };
    })
    .filter((b) => (b.produtos?.length ?? 0) > 0);

  // 4) Recalcula totais (considera todas as lojas)
  const todosProdutos = produtosPorLoja.flatMap((b) => b.produtos ?? []);
  const quantidadeItens = todosProdutos.length;
  const quantidadePecas = todosProdutos.reduce(
    (acc: number, p: any) => acc + (p.quantidade || 0),
    0
  );
  const valorTotal = todosProdutos.reduce(
    (acc: number, p: any) => acc + (p.quantidade || 0) * (p.precoUnitario || 0),
    0
  );

  // Se após aplicar tudo ficou vazio e nem existe pedido, não cria nada
  const temAlgoNoCarrinho = quantidadePecas > 0;

  // 5) Persistência (INSERT ou UPDATE)
  const tabelaPreco = selectedTabelaPreco || "999999";
  const repCreate = representanteCreateId || representanteId;

  // ✅ UPDATE
  if (pedidoEfetivo?.id) {
    const produtosStr = JSON.stringify(produtosPorLoja);

    // nomeEcommerce: usa o último produto (ou fallback do próprio produto em questão)
    const nomeEcommerce =
      todosProdutos?.[todosProdutos.length - 1]?.nomeEcommerce ??
      produto.nomeEcommerce ??
      "";

    await atualizarPedido(
      produtosStr,
      nomeEcommerce,
      quantidadeItens,
      quantidadePecas,
      valorTotal,
      tabelaPreco,
      pedidoEfetivo.id
    );

    return { sucesso, falha };
  }

  // ✅ INSERT (somente se tiver algo)
  if (!temAlgoNoCarrinho) {
    return { sucesso, falha };
  }

  const enderecoDefault =
    Array.isArray(selectedClient.enderecos) && selectedClient.enderecos.length
      ? selectedClient.enderecos[0]
      : {};

  const produtosStr = JSON.stringify(produtosPorLoja);

  await inserirPedido(
    {
      clienteId: selectedClient.clienteId,
      cpfCnpj: selectedClient.cpfCnpj,
      razaoSocial: selectedClient.razaoSocial,
      enderecoCompleto: selectedClient.enderecoCompleto ?? "",
      enderecos: JSON.stringify(selectedClient.enderecos ?? []),
    },
    enderecoDefault,
    produtosStr,
    quantidadePecas,
    valorTotal,
    tabelaPreco,
    produto.nomeEcommerce ?? "",
    representanteId,
    repCreate
  );

  return { sucesso, falha };
}
