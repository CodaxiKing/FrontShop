export interface BandejaProdutoResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: BandejaProdutoItem[];
}

export interface BandejaProdutoItem {
  codigoProduto: string;
  codigoBandeja: string;
}
