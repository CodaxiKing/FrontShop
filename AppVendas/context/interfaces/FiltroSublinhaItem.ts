export interface FiltroSublinhaItem {
  codigo: string;
  descricao: string;
}

export interface FiltroSublinhaResponse {
  itens: FiltroSublinhaItem[];
  nextid: string;
}
