/**
 * Calcula o valor total dos produtos com base no JSON fornecido e na taxa de frete.
 *
 * @param jsonProdutos O JSON contendo os produtos e suas informações.
 * @param freteByClient A taxa de frete a ser aplicada.
 * @returns O valor total dos produtos.
 * @description Esta função percorre a estrutura de produtos e calcula o valor total considerando
 *              as quantidades e preços unitários com IPI.
 */

export const calcularValorTotalProdutos = (
  jsonProdutos: string,
  freteByClient: number | string
): number => {
  try {
    const produtosPorCpfCnpj = JSON.parse(jsonProdutos);
    let valorTotal = 0;

    produtosPorCpfCnpj.forEach((item: any) => {
      if (item.produtos && Array.isArray(item.produtos)) {
        item.produtos.forEach((produto: any) => {
          if (produto.quantidade) {
            const precoBase =
              produto.precoUnitarioComIPI > 0
                ? produto.precoUnitarioComIPI
                : produto.precoUnitario;
            const desconto = produto.percentualDesconto || 0;

            const precoComDesconto = precoBase * (1 - desconto / 100);
            valorTotal += produto.quantidade * precoComDesconto;
          }
        });
      }
    });

    calcularValorDevidoDeFrete(valorTotal, freteByClient);

    return valorTotal;
  } catch (error) {
    console.error("Erro ao calcular valor total dos produtos:", error);
    return 0;
  }
};

/**
 *
 * @param produtos Lista de produtos com suas quantidades e preços.
 * @description Calcula o valor total dos produtos considerando a quantidade e o preço unitário com IPI.
 * @returns O valor total dos produtos.
 */
export const calcularValorTotalProdutosFlat = (carrinho: any[]): number => {
  let valorTotal = 0;

  if (!Array.isArray(carrinho)) return 0;

  valorTotal = carrinho.reduce((acc, produto) => {
    const preco =
      produto.precoUnitarioComIPI > 0
        ? produto.precoUnitarioComIPI
        : produto.precoUnitario;
    const desconto = produto.percentualDesconto ?? 0;
    const quantidade = produto.quantidade ?? 1;
    return acc + preco * quantidade * (1 - desconto / 100);
  }, 0);

  return valorTotal;
};

/**
 * Calcula o valor devido de frete com base no valor total e na taxa de frete.
 * @param valorTotal O valor total dos produtos.
 * @param freteByClient A taxa de frete a ser aplicada.
 * @returns O valor devido de frete.
 */
export const calcularValorDevidoDeFrete = (
  valorTotal: number,
  freteByClient: number | string
): number => {
  let valorDevidoDeFrete = 0;
  // aplicar a taxa de frete em cima do valor total pedido
  if (valorTotal && freteByClient) {
    valorDevidoDeFrete = (Number(valorTotal) * Number(freteByClient)) / 100;
    // setFreteCalculado(valorDevidoDeFrete);
  }

  return valorDevidoDeFrete;
};
