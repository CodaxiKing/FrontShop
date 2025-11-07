export interface BandejaVendedorResponse {
  data: BandejaVendedorItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface BandejaVendedorItem {
  codigo: string;
  representanteId: string;
  nome: string;
}
