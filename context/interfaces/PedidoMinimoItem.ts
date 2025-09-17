export interface IPedidoMinimoResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: IPedidoMinimo[];
}

export interface IPedidoMinimo {
  filial: string;
  descricao: string;
  tipo: string;
  quantidadeMinima: number;
  verificarQuemComprouCliente: string;
  exposicao: string;
  diferenciaProduto: string;
  bloqueio: string;
  ordem: number;
  disney: string[];
  marvel: string[];
}
