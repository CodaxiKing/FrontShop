export interface DisplayItem {
  codigo: string;
  descricao: string;
}

export interface DisplayResponse {
  itens: DisplayItem[];
  nextid: string;
}
