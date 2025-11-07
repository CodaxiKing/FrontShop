export interface ExpositorResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  itens: ExpositorItem[];
}

export interface ExpositorItem {
  codigo: string;
  nomeEcommerce: string;
  codigoBarra: string;
  peso: number;
  ncm: string;
  precoUnitario: number;
  ipi: number;
  saldo: number;
  filialMarca: string;
  codigoMarca: string;
  descricaoMarca: string;
  importMarca: string;
  imagens: {
    imagemUrl: string;
    imagemFilename: string;
  };
}
