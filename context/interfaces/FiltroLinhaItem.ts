export interface FiltroLinhaItem {
  codigo: string;
  descricao: string;
}

export interface FiltroLinhaResponse {
  itens: FiltroLinhaItem[];
  nextid: string;
}
