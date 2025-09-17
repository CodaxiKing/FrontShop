export interface BandejaResponse {
  data: BandejaItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface BandejaItem {
  codigo: string;
  codigoFilial: string;
  nome: string;
  dataInicio: string;
  usuarioInclusao: string;
  status: string;
}
