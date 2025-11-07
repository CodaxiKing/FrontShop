export interface PagamentoClienteItem {
  codigo: string;
  codigoFilial: string;
  cpfCnpj: string;
  item: string;
  codigoFormaPagamento: string;
  descricao: string;
  quantidadeParcelas: number;
  prazoEntreParcelas: number;
  diasParaPrimeiraParcela: number;
}

export interface PagamentoClienteResponse {
  itens: PagamentoClienteItem[];
}
