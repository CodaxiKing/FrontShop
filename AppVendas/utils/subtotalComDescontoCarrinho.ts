/**
 * @description
 * Calcula o subtotal com desconto dos produtos do carrinho,
 * usando os campos `precoUnitarioComIPI`, `quantidade` e `percentualDesconto`.
 *
 * @param produtos - Lista de produtos do carrinho.
 * @param quantidades - Lista de quantidades correspondentes a cada produto.
 * @returns O subtotal final em número.
 */
export function calcularSubtotalCarrinho(produtos: any[]): number {
  return produtos.reduce((total, produto) => {
    const quantidade = produto.quantidade || 1;
    const desconto = produto.percentualDesconto || 0;
    const valorUnitario =
      produto.precoUnitarioComIPI > 0
        ? produto.precoUnitarioComIPI
        : produto.precoUnitario;

    const valorComDesconto = valorUnitario * (1 - desconto / 100);
    return total + valorComDesconto * quantidade;
  }, 0);
}
