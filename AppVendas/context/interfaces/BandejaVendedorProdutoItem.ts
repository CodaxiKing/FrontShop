export interface BandejaVendedorProdutoResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: BandejaVendedorProdutoItem[];
}

export interface BandejaVendedorProdutoItem {
  representanteId: string;
  codigoBandeja: string;
  codigoProduto: string;
}
