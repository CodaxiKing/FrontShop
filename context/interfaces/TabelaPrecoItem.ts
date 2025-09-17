export interface ITabelaPrecoItem {
  codigo: string;
  descricao: string;
  tipo: string;
  descricaotipo: string;
  dataInicioVigencia: string;
  horaInicioVigencia: string;
  dataFimVigencia: string | null;
  horaFimVigencia: string;
}
