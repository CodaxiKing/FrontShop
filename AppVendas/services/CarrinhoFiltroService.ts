import { buscarPedido } from "@/repositories/PedidoRepository";

export async function getCodigosDoCarrinho(ctx: {
  cpfCnpj: string; // cpfCnpj do cliente principal (pedido)
  clienteId: string;
  representanteId: string;
}): Promise<{ codigos: string[]; pedido: any | null }> {
  const rows = await buscarPedido(
    ctx.cpfCnpj,
    ctx.clienteId,
    ctx.representanteId
  );
  const pedido = rows?.[0] ?? null;

  console.log("✅ Pedido buscado para filtro carrinho:", pedido);

  if (!pedido?.produtos) return { codigos: [], pedido };

  let lista: any[] = [];
  try {
    lista =
      typeof pedido.produtos === "string"
        ? JSON.parse(pedido.produtos)
        : pedido.produtos;
  } catch {
    lista = [];
  }

  const set = new Set<string>();

  for (const bucket of Array.isArray(lista) ? lista : []) {
    const prods = Array.isArray(bucket?.produtos) ? bucket.produtos : [];
    for (const p of prods) {
      const codigo = String(p?.codigo ?? "").trim();
      const qtd = Number(p?.quantidade ?? 0);
      if (codigo && qtd > 0) set.add(codigo);
    }
  }

  return { codigos: Array.from(set), pedido };
}
