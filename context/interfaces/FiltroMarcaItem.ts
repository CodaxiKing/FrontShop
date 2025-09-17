export interface FiltroMarcaItem {
  filial: string;
  codigo: string;
  descricao: string;
}

export interface FiltroMarcaResponse {
  itens: FiltroMarcaItem[];
  nextid: string;
}
