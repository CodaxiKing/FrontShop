// repositories/CarrinhoRepository.ts
import { executeQuery } from "@/services/dbService";
import {
  querySelectPedidoPorChave,
  queryInsertNovoPedido,
  queryUpdatePedidoProdutosEContadores,
  queryUpdatePedidoProdutosEContadoresLight,
  queryDeletePedidoById,
  queryUpdateContadores,
  queryDeleteTodosPedido,
  queryCountCarrinhosByRepresentante,
  queryListCarrinhosByRepresentante,
} from "@/database/queries/carrinhoQueries";

export interface NovoProduto {
  codigo: string;
  nomeEcommerce: string;
  quantidade: number;
  precoUnitario: number;
  precoUnitarioComIPI: number;
  tipo: string;
  imagem: any;
  percentualDesconto?: number;
  dataPrevistaPA?: string | null;
  descricaoSubGrupo?: string;
}

export interface LojaProduto {
  cpfCnpj: string;
  produtos: NovoProduto[];
}

export interface PedidoRow {
  id: number;
  clienteId: string;
  cpfCnpj: string;
  representanteId: string;
  produtos: string; // JSON string
  lojas: string;    // JSON string
  quantidadeItens?: number;
  quantidadePecas?: number;
  nomeEcommerce?: string;
  tabelaDePrecoId?: string;
}

export const CarrinhoRepository = {
  async buscarPedido(cpfCnpj: string, clienteId: string, representanteId: string): Promise<PedidoRow | null> {
    const rows = await executeQuery(querySelectPedidoPorChave, [cpfCnpj, clienteId, representanteId]);
    return rows?.[0] ?? null;
  },

  async criarPedido(args: {
    clienteId: string;
    razaoSocial: string;
    cpfCnpj: string;
    enderecoEntrega: string;
    numeroEntrega: string;
    cepEntrega: string;
    bairroEntrega: string;
    complementoEntrega: string;
    estadoEntrega: string;
    municipioEntrega: string;
    lojasJson: string;
    produtosJson: string;
    quantidadeItens: number;
    quantidadePecas: number;
    valorTotal: number;
    tabelaDePrecoId: string;
    nomeEcommerce: string;
    representanteId: string;
    representanteCreateId: string;
  }) {
    await executeQuery(queryInsertNovoPedido, [
      args.clienteId,
      args.razaoSocial,
      args.cpfCnpj,
      args.enderecoEntrega,
      args.numeroEntrega,
      args.cepEntrega,
      args.bairroEntrega,
      args.complementoEntrega,
      args.estadoEntrega,
      args.municipioEntrega,
      args.lojasJson,
      args.produtosJson,
      args.quantidadeItens,
      args.quantidadePecas,
      args.valorTotal,
      args.tabelaDePrecoId,
      args.nomeEcommerce,
      args.representanteId,
      args.representanteCreateId,
    ]);
  },

  async atualizarProdutosEContadores(params: {
    id: number;
    representanteId: string;
    produtosJson: string;
    nomeEcommerce: string;
    quantidadeItens: number;
    quantidadePecas: number;
    tabelaDePrecoId: string;
    razaoSocial: string;
  }) {
    await executeQuery(queryUpdatePedidoProdutosEContadores, [
      params.produtosJson,
      params.nomeEcommerce,
      params.quantidadeItens,
      params.quantidadePecas,
      params.tabelaDePrecoId,
      params.razaoSocial,
      params.id,
      params.representanteId,
    ]);
  },

  async atualizarProdutosEContadoresLight(params: {
    id: number;
    representanteId: string;
    produtosJson: string;
    quantidadeItens: number;
    quantidadePecas: number;
  }) {
    await executeQuery(queryUpdatePedidoProdutosEContadoresLight, [
      params.produtosJson,
      params.quantidadeItens,
      params.quantidadePecas,
      params.id,
      params.representanteId,
    ]);
  },

  async atualizarSomenteContadores(params: {
    id: number;
    representanteId: string;
    quantidadeItens: number;
    quantidadePecas: number;
  }) {
    await executeQuery(queryUpdateContadores, [
      params.quantidadeItens,
      params.quantidadePecas,
      params.id,
      params.representanteId,
    ]);    
  },

  async apagarPedidoRepresentanteIsNull() {
    await executeQuery(queryDeletePedidoById);
  },

  async apagarTodosPedido() {
    await executeQuery(queryDeleteTodosPedido);
  },


  async apagarPedidoById(id: number) {
    await executeQuery(queryDeletePedidoById, [id]);
  },

  async getCountByRepresentante(representanteId: string): Promise<number> {
    const rows = await executeQuery<{ count: number }>(
      queryCountCarrinhosByRepresentante,
      [representanteId]
    );
    return rows?.[0]?.count ?? 0;
  },

  async debugDump(representanteId?: string) {
    //console.warn(`[getCountByRepresentante] → [${rows?.[0]}]`);
    const all = await executeQuery<any>(
      "SELECT id a_Id, selectedTabelaPreco a_TabelaPreco, representanteId b_Rep, clienteId d_clienteId, cpfCnpj e_cpfCnpj, quantidadeItens f_QtdItens, quantidadePecas g_QtdPecas FROM NovoPedido ORDER BY id DESC"
    );
    const fil =  all;

    console.warn("[DebugDump][",representanteId?.trim(),"]rows=", fil);    
},

  async listByRepresentante(representanteId: string) {
    return executeQuery<any>(
      queryListCarrinhosByRepresentante,
      [representanteId]
    );
  },

 
};
