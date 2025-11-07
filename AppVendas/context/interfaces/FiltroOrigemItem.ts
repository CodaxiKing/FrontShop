export interface FiltroOrigemItem {
  codigo: string;
  descricao: string;
}

export interface FiltroOrigemResponse {
  itens: FiltroOrigemItem[];
  nextid: string;
}
