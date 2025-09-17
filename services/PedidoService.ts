// services/PedidoService.ts
import { CarrinhoService } from "@/services/CarrinhoService";

// ---- Tipos alinhados ao novo fluxo ----
export interface ProdutoParaPedido {
  codigo: string;
  nomeEcommerce: string;
  quantidade: number;
  precoUnitario: number;
  imagem: any;                    // pode ser url/base64/require(...)
  precoUnitarioComIPI?: number;   // se não houver, usamos precoUnitario
}

export interface ClienteSelecionadoNovo {
  clienteId: string;
  cpfCnpj: string;
  razaoSocial: string;
  enderecoCompleto: string;
  enderecos?: any[];              // array já parseado (recomendado)
}

export interface AdicionarOuAtualizarPedidoNovoParams {
  // chave do pedido
  cpfCnpj: string;                 // CNPJ/CPF da loja (pai)
  representanteId: string;
  representanteCreateId?: string;

  // cliente e produto
  cliente: ClienteSelecionadoNovo; // objeto rico (não JSON string)
  produto: ProdutoParaPedido;

  // tabela de preço (string ou objeto com { value })
  selectedTabelaPreco: string | { value: string };

  // opcionais do seu fluxo
  percentualDesconto?: number;
  dataPrevistaPA?: string | null;
  descricaoSubGrupo?: string;
}

/**
 * Delega ao CarrinhoService
 * - cria/atualiza/limpa produto dentro de NovoPedido
 * - recalcula contadores
 * - apaga pedido se ficar vazio
 */
export async function adicionarOuAtualizarProdutoNoPedidoNovo(
  params: AdicionarOuAtualizarPedidoNovoParams
): Promise<void> {
  const {
    cpfCnpj,
    representanteId,
    representanteCreateId = representanteId,
    cliente,
    produto,
    selectedTabelaPreco,
    percentualDesconto,
    dataPrevistaPA,
    descricaoSubGrupo,
  } = params;

  // normaliza selectedTabelaPreco para o formato esperado no Service
  const tabelaObj =
    typeof selectedTabelaPreco === "string"
      ? { value: selectedTabelaPreco }
      : selectedTabelaPreco ?? { value: "" };

  // normaliza cliente (garantir campos obrigatórios)
  const selectedClient = {
    clienteId: String(cliente.clienteId),
    razaoSocial: cliente.razaoSocial ?? "",
    cpfCnpj: cliente.cpfCnpj ?? cpfCnpj,
    enderecoCompleto: cliente.enderecoCompleto ?? "",
    enderecos: Array.isArray(cliente.enderecos) ? cliente.enderecos : [],
  };

  await CarrinhoService.atualizarProdutoNoCarrinho({
    codigo: produto.codigo,
    quantidade: produto.quantidade,
    nomeEcommerce: produto.nomeEcommerce,
    precoUnitario: produto.precoUnitario,
    precoUnitarioComIPI: produto.precoUnitarioComIPI ?? produto.precoUnitario,
    imagem: produto.imagem,
    cpfCnpj,
    clienteId: String(cliente.clienteId),
    representanteId,
    representanteCreateId,
    selectedTabelaPreco: tabelaObj,
    selectedClient,
    percentualDesconto,
    dataPrevistaPA,
    descricaoSubGrupo,
  });
}

/* 
 * Compat de nome (manter a assinatura "antiga" de chamada):
 * - Basta reexportar com o nome que as telas já usam
 *   (desde que você forneça agora os novos campos obrigatórios).
 */

export {
  adicionarOuAtualizarProdutoNoPedidoNovo as adicionarOuAtualizarProdutoNoPedido,
};
