export interface FiltroSubgrupoItem {
  codigo: string;
  descricao: string;
}

export interface FiltroSubgrupoResponse {
  itens: FiltroSubgrupoItem[];
  nextid: string;
}
