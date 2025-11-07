export interface HistoricoCompraClienteResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: HistoricoCompraClienteItem[];
}

export interface HistoricoCompraClienteItem {
  filial: string;
  codigoCliente: string;
  loja: string;
  filialVenda: string;
  codigoProduto: string;
  dataProcessamento: string;
  dataVenda: string;
  quantidade: number;
  totalVenda: number;
  chaveSecundaria: string;
}
