import { executeQuery } from "@/services/dbService";
import {
  queryBuscarPedido,
  queryAtualizarPedido,
  queryInserirPedido,
} from "@/database/queries/pedidoQueries";

export async function buscarPedido(cpfCnpj: string, clienteId: string, representanteId: string) {
  return await executeQuery<any>(queryBuscarPedido, [cpfCnpj, clienteId, representanteId]);
}

export async function atualizarPedido(
  produtosStr: string,
  nomeEcommerce: string,
  itens: number,
  pecas: number,
  total: number,
  tabelaPreco: string,
  pedidoId: number
) {
  return await executeQuery(queryAtualizarPedido, [
    produtosStr,
    nomeEcommerce,
    itens,
    pecas,
    total,
    tabelaPreco,
    pedidoId,
  ]);
}

export async function inserirPedido(
  cliente: any,
  endereco: any,
  produtosStr: string,
  pecas: number,
  valorTotal: number,
  tabelaPreco: string,
  nomeEcommerce: string,
  representanteId: string,         
  representanteCreateId: string    
) {
  return await executeQuery(queryInserirPedido, [
    cliente.clienteId,
    cliente.razaoSocial ?? "",
    cliente.cpfCnpj ?? "",
    cliente.enderecoCompleto ?? "",
    "", // númeroEntrega
    endereco.cep || "",
    endereco.bairro || "",
    endereco.complemento || "",
    endereco.estado || "",
    endereco.municipio || "",
    produtosStr,
    1,
    pecas,
    valorTotal,
    tabelaPreco,
    nomeEcommerce,
    representanteId,        
    representanteCreateId,  
  ]);
}
