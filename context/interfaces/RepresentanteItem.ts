export interface RepresentanteResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: RepresentanteItem[];
}

export interface RepresentanteItem {
  codigo: string;
  representanteId: string;
  codigoFilial: string;
  nome: string;
  nomeReduzido: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  fax: string;
  cpfCnpj: string;
  email: string;
  gerente: string;
  supervisor: string;
  diretor: string;
  codigoCentroCusto: string;
  codigoLoja: string;
  cargo: string;
  pais: string;
  telefoneCelular: string;
  filialRepresentanteGerente: string;
  filialRepresentanteCodigoFilial: string;
  filialRepresentanteCodigoFilialRepresentante: string;
  filialRepresentanteSigla: string;
  filialRepresentanteDescricao: string;
  filialRepresentantePercentualFixoRepasseMensal: number;
  filialRepresentanteValorFixoRepasseMensal: number;
  tabelaPrecos: ITabelaPrecoItem[];
  bloqueios: IBloqueiosItem[];
}

export interface ITabelaPrecoItem {
  codigo: string;
  descricao: string;
  tipo: string;
  descricaoTipo: string;
  cnpjColigada: string;
  prioridade: number;
  dataInicioVigencia: string;
  horaInicioVigencia: string;
  dataFimVigencia: string;
  horaFimVigencia: string;
}

export interface IBloqueiosItem {
  bloqueioId: string;
  codigoProduto: string;
  filial: string;
  filialProduto: string;
  codigoMarca: string;
  codigoGrupo: string;
  codigoSubGrupo: string;
  codigoLinha: string;
  codigoSinalizador: string;
}
