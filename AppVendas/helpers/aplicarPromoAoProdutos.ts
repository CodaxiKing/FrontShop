import { ProdutoPedido } from "@/context/interfaces/NovoPedidoItem";

/**
 * Aplica desconto promocional aos produtos do carrinho
 * Sobrescreve o preço original com preço de promo quando disponível
 * 
 * @param produtos - Array de produtos do pedido
 * @param flagExibirDesconto - Flag que ativa/desativa exibição de desconto promo
 * @returns Array de produtos com preços ajustados
 */
export const aplicarPromoAoProdutos = (
  produtos: ProdutoPedido[],
  flagExibirDesconto: boolean
): ProdutoPedido[] => {
  if (!flagExibirDesconto) {
    return produtos;
  }

  return produtos.map((produto) => {
    // Se há desconto promo disponível, sobrescreve o preço
    const descontoPromo = (produto as any).descontoPromo;
    const precoPromo = (produto as any).precoPromo;
    
    if (descontoPromo && descontoPromo > 0 && precoPromo) {
      return {
        ...produto,
        precoUnitario: precoPromo,
        precoUnitarioComIPI: precoPromo, // Assume que precoPromo já inclui IPI
        percentualDesconto: descontoPromo,
      };
    }

    return produto;
  });
};
