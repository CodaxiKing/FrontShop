/**
 * @description
 * Calcula o subtotal de uma lista de produtos, aplicando os percentuais de desconto
 * individuais quando houver. Multiplica o valor com desconto pela quantidade de cada item.
 *
 * @param produtos - Lista de produtos contendo `valorProduto` e `percentualDesconto`.
 * @param quantidades - Lista de quantidades correspondentes a cada produto.
 * @returns O subtotal final considerando os descontos aplicados.
 */

export function calcularSubtotalDetalhePedido(
  produtos: any[],
  quantidades: number[]
): number {
  return produtos.reduce((total, produto, index) => {
    const quantidade = quantidades[index] || 1;
    const desconto = produto.percentualDesconto || 0;
    const valorUnitario = produto.valorProduto || 0;
    const valorComDesconto = valorUnitario * (1 - desconto / 100);
    return total + valorComDesconto * quantidade;
  }, 0);
}
