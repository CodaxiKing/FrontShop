export interface Endereco {
  cep: string;
  bairro: string;
  estado: string;
  municipio: string;
  complemento: string;
  endereco: string;
  numero: string;
  tipo: number;
}
export interface Bloqueios {
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

export interface CarteiraClienteResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: CarteiraClienteItem[];
}

export interface CarteiraClienteItem {
  clienteId: string;
  codigo: string;
  codigoFilial: string;
  cpfCnpj: string;
  cpfCnpjPai: string;
  codigoLoja: string;
  razaoSocial: string;
  nomeReduzido: string;
  tipoPessoa: string;
  tipo: string;
  codigoColigado: string;
  lojaPrincipal: string;
  pais: string;
  representanteId: string;
  tipologia: string;
  atraso: number;
  tipoFrete: string;
  desconto: number;
  saldo: number;
  saldoDuplicatas: number;
  risco: string;
  tituloPrestados: number;
  limiteCredito: number;
  limiteCreditoFinanceiro: number;
  ddd: string;
  email: string;
  telefone: string;
  fax: string;
  contato: string;
  enderecos: Endereco[];
  bloqueios: Bloqueios[];
  updateOn: string;
}
