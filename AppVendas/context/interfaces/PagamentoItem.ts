export interface PagamentoItem {
  filial: string;
  codigo: string;
  descricao: string;
}

export interface PagamentoResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: PagamentoItem[];
}
