export interface SinalizadoresItem {
  filial: string;
  tipo: string;
  tipoDescricao: string;
  codigo: string;
  descricao: string;
}

export interface SinalizadoresResponse {
  itens: SinalizadoresItem[];
  nextid: string;
}
