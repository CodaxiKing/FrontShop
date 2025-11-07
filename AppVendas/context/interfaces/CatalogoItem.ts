export interface CatalogoItemResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: CatalogoItem[];
}

export interface CatalogoItem {
  codigo: string;
  tipoProduto: string;
  nomeEcommerce: string;
  filialMarca: string;
  codigoMarca: string;
  descricaoMarca: string;
  garantia: string;
  codigoBarra: string;
  ncm: string;
  precoUnitario: number;
  representanteId: string;
  precoUnitarioComIPI: number;

  precoComIPI: number;
  descricaoComercial: string;
  descricaoTecnica: string;
  tamanhoCaixa: string;
  peso: number;
  fecho: string;
  resistenciaAgua: string;
  materialPulseira: string;
  materialCaixa: string;
  tipoFundo: string;
  funcaoMecanismo: string;
  filialSubGrupo: string;
  codigoSubGrupo: string;
  descricaoSubGrupo: string;
  grupoSubGrupo: string;
  filialLinha: string;
  codigoLinha: string;
  descricaoLinha: string;
  subGrupoLinha: string;
  display: string;
  flagBestSeller: string;
  flagComKit: string;
  flagLancamento: string;
  flagMonteSeuKit: string;
  flagPreVenda: string;
  genero: string;
  nacionalImportado: string;
  flagRetorno: string;
  exclusividadeVendedor: string;
  espessuraCaixa: string;
  tamanhoPulseira: string;
  quantidadeEstoquePA: number;
  grupo: string;
  corMostrador: string;
  corPulseira: string;
  precoPromo: number;
  descontoPromo: number;
  precoSemIPI: number;
  dataPrevistaPA: string | null;
  banho: string;
  corCaixa: string;
  ipi: number;
  filialOrigem: string;
  codigoOrigem: string;
  descricaoOrigem: string;
  filialSubLinha: string;
  codigoSubLinha: string;
  descricaoSubLinha: string;
  linhaSubLinha: string;
  filialTipoProduto: string;
  codigoTipoProduto: string;
  descricaoTipoProduto: string;
  imagens: Array<{
    imagemUrl: string;
    imagemFilename: string;
  }>;
  productImage?: string; // URL principal (denormalizada)
  allImagens?: Array<{ imagemUrl: string }>;
  sinalizadores: Array<{
    codigo: string;
    descricao: string;
  }>[];
  codigoBarraFeiras: {
    sequencial: number;
    codigoBarras: string;
    feira: string;
  };
  precoDesconto?: number;
  percentualDesconto?: number;
  selectedTabelaPreco?: {
    value: string | number;
    tipo: string;
  };
  codigoCliente?: string;
  inventoryQtd?: number;
  catalogOpen?: boolean;
}
