export interface FreteItem {
  codigoColigado: string;
  percentualFretePedidoMinimo: number;
  valorFrete: number;
  fretePadrao: number;
  valorFretePedidoMinimo: number;
  filialRepresentante: string;
}

export interface FreteResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: FreteItem[];
}
