export interface QuemComprouClienteResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: QuemComprouClienteItem[];
}

export interface QuemComprouClienteItem {
  filial: string;
  cpfCnpj: string;
  codigoMarca: string;
  subGrupo: string;
}
