/**
 * Calcula o preço final de um produto no carrinho com breakdown detalhado
 * O IPI é já incluído no preçoUnitarioComIPI
 * Fórmula: (precoBase - desconto) = total
 * 
 * @param precoBase - Preço base do produto
 * @param desconto - Valor de desconto (não percentual)
 * @returns Objeto com breakdown dos valores
 */
export interface PrecoBreakdown {
  precoBase: number;
  desconto: number;
  subtotal: number;
  total: number;
}

export const calcularPrecoCarrinho = (
  precoBase: number,
  desconto: number = 0
): PrecoBreakdown => {
  const subtotal = precoBase - desconto;
  const total = parseFloat(subtotal.toFixed(2));

  return {
    precoBase: parseFloat(precoBase.toFixed(2)),
    desconto: parseFloat(desconto.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    total,
  };
};

/**
 * Calcula o breakdown para múltiplos produtos
 * IPI já está incluído em precoUnitarioComIPI
 * 
 * @param produtos - Array com produtos contendo preço e quantidade
 * @returns Breakdown agregado (preço base + IPI já incluído, menos desconto)
 */
export const calcularBreakdownCarrinho = (
  produtos: Array<{
    precoUnitarioComIPI?: number;
    precoUnitario?: number;
    percentualDesconto?: number;
    quantidade?: number;
  }>
): PrecoBreakdown => {
  let totalPrecoBase = 0;
  let totalDesconto = 0;

  produtos.forEach((produto) => {
    const quantidade = produto.quantidade || 1;
    const precoComIPI = produto.precoUnitarioComIPI || 0;
    const preco =
      precoComIPI > 0
        ? precoComIPI
        : produto.precoUnitario || 0;
    const percentualDesconto = produto.percentualDesconto || 0;

    const precoBase = preco * quantidade;
    const desconto = (precoBase * percentualDesconto) / 100;

    totalPrecoBase += precoBase;
    totalDesconto += desconto;
  });

  const subtotal = totalPrecoBase - totalDesconto;
  const total = parseFloat(subtotal.toFixed(2));

  return {
    precoBase: parseFloat(totalPrecoBase.toFixed(2)),
    desconto: parseFloat(totalDesconto.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    total,
  };
};
