// types.ts
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, ParamListBase } from "@react-navigation/native";
import { PedidoSincronizadoItem } from "@/context/interfaces/PedidoSincronizadoItem";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RouteProps = RouteProp<
  RootStackParamList,
  keyof RootStackParamList
>;
export type RootStackParamList = {
  Home: undefined;
  Carrinho: {
    // Carrinho: NovoPedidoItem[];
    clienteId: string;
    cpfCnpj: string | number;
    pedidoId: number | string;
    codigoCliente: number | string;
  };

  Catalogo: {
    clienteId: undefined;
    cpfCnpj: string | number;
    codigoCliente: number | string;
    filtroTipo?: string;
    filtroCodigo?: string;
    filtroNome?: string;
    filtroSinalizadores?: string;
    modoSinalizadores?: string;
    sinalizadoresMap?: {
      label: string;
      value: string;
    };
    materialCaixa?: string;
    tamanhoPulseira?: string;
    corPulseira?: string;
    materialPulseira?: string;
    display?: string;
    corMostrador?: string;
    funcaoMecanismo?: string;
    precoMinimo?: number;
    precoMaximo?: number;
    estoqueMinimo?: number;
    estoqueMaximo?: number;
    tamanhoCaixaMinimo?: number;
    tamanhoCaixaMaximo?: number;
  };

  CatalogoFechado: {
    catalogOpen: boolean;
    pedidoId?: string | number;
    clienteId?: string | number | null;
    cpfCnpj?: string | number | null;
    codigoCliente: string | number | null;
    selectedTabelaPreco?:
      | string
      | {
          value: string | number;
          tipo: string;
        };
    representanteCreateId?: string | number;
    produtosFiltradosTabelaPreco?: any;
    selectedClient?: {
      cpfCnpj: string | number;
      clienteId: string | number;
      razaoSocial: string;
      enderecoCompleto: string;
      enderecos: any[];
    };
    filtroTipo?: string;
    filtroCodigo?: string;
    filtroNome?: string;
    filtroSinalizadores?: string;
    filtros?: {
      sinalizadores?: string[];
      outros?: string[];
      marcas?: string[];
      tipos?: string[];
      subGrupos?: string[];
      linhas?: string[];
    };
    modoSinalizadores?: string;
    sinalizadoresMap?: {
      label: string;
      value: string;
    };
    materialCaixa?: string;
    tamanhoPulseira?: string;
    corPulseira?: string;
    materialPulseira?: string;
    display?: string;
    corMostrador?: string;
    funcaoMecanismo?: string;
    precoMinimo?: number;
    precoMaximo?: number;
    estoqueMinimo?: number;
    estoqueMaximo?: number;
    tamanhoCaixaMinimo?: number;
    tamanhoCaixaMaximo?: number;
  };

  EditarPedidoCatalogoFechado: {
    catalogOpen?: boolean;
    pedidoId?: string | number;
    clienteId?: string | number | null;
    cpfCnpj?: string | number | null;
    selectedTabelaPreco?: {
      value: string | number;
      tipo: string;
    };
    representanteCreateId?: string | number;
    produtosFiltradosTabelaPreco?: any;
    selectedClient?: {
      cpfCnpj: string | number;
      clienteId: string | number;
      razaoSocial: string;
      enderecoCompleto: string;
      enderecos: any[];
    };
    filtroTipo?: string;
    filtroCodigo?: string;
    filtroNome?: string;
    filtroSinalizadores?: string;
  };

  MarcaCatalogoFechado: {
    marcaCodigo: string;
    marcaNome: string;
  };

  TipoCatalogoFechado: {
    tipoCodigo: string;
    tipoNome: string;
  };

  SubGrupoCatalogoFechado: {
    subGrupoCodigo: string;
    subGrupoNome: string;
  };

  Pedidos: undefined;
  PedidosEmAberto: undefined;
  ListaDeClientes: undefined;
  DetalhesDoCliente: {
    codigo: string;
  };
  DetalhePedidoAberto: {
    pedidoId: number | string;
    pageTitle?: string;
  };

  DetalhePedidoSincronizado: {
    pedidoSincronizadoSelecionado: PedidoSincronizadoItem;
  };

  DetalhesDoProduto: {
    codigo: string;
    nomeEcommerce?: string;
    descricaoTecnica: string;
    descricaoComercial: string;
    genero?: string;
    codigoBarra: string;
    ncm: string;
    precoUnitario: number;
    quantidadeEstoquePA?: number;
    fecho: string;
    display?: string;
    representanteId?: string;
    corMostrador?: string;
    funcaoMecanismo?: string;
    corPulseira?: string;
    materialPulseira?: string;
    tamanhoPulseira?: string;
    resistenciaAgua?: string;
    peso?: string;
    materialCaixa?: string;
    tamanhoCaixa?: string;
    garantia?: string;
    codigoTipoProduto?: string;
    codigoSubGrupo?: string;
    outros?: string[];
    sinalizadores?: string[];
    codigoMarca?: string;
    codigoLinha?: string;
    brindesItem?: string[];
    imagens?: string[];
    precoDesconto?: number;
    productImage?: string;
    inventoryQtd?: number;
    catalogOpen?: boolean;
    espessuraCaixa?: string;
    parsedSinalizadores?: {
      codigo?: string;
      descricao?: string;
    }[];
  };

  EditarPedidoDetalhesDoProduto: {
    codigo: string;
    nomeEcommerce?: string;
    descricaoTecnica: string;
    descricaoComercial: string;
    genero?: string;
    codigoBarra: string;
    ncm: string;
    precoUnitario: number;
    quantidadeEstoquePA?: number;
    fecho: string;
    display?: string;
    representanteId?: string;
    corMostrador?: string;
    funcaoMecanismo?: string;
    corPulseira?: string;
    materialPulseira?: string;
    tamanhoPulseira?: string;
    resistenciaAgua?: string;
    peso?: string;
    materialCaixa?: string;
    tamanhoCaixa?: string;
    garantia?: string;
    codigoTipoProduto?: string;
    codigoSubGrupo?: string;
    outros?: string[];
    sinalizadores?: string[];
    codigoMarca?: string;
    codigoLinha?: string;
    brindesItem?: string[];
    imagens?: string[];
    precoDesconto?: number;
    productImage?: string;
    inventoryQtd?: number;
    catalogOpen?: boolean;
    espessuraCaixa?: string;
    parsedSinalizadores?: {
      codigo?: string;
      descricao?: string;
    }[];
  };

  Sincronizacao: undefined;
  CopiarPedido: {
    pedidoSelecionado: PedidoSincronizadoItem;
  };
  Pagamento: {
    pedidoId: number | string;
    clienteId: number | string;
    cpfCnpj: number | string;
  };

  EditarPedidoPagamento: {
    pedidoId: number | string;
    clienteId: number | string;
    cpfCnpj: number | string;
  };

  MinhaBandeja: undefined;
  CriarBandejaVendedor: undefined;
  EditarBandejaVendedor: {
    codigo: string;
  };
  BandejaCatalogoFechado: {
    bandejaCodigo: string;
    bandejaNome: string;
  };

  EditarPedidoAberto: {
    cpfCnpj?: string;
    pedidoId?: number;
  };
};

export interface EmpresaDestino {
  id: number;
  code: number;
  nome: string;
  email: string;
  imagem: string | number;
}

export interface DestinatarioDetails {
  id: number;
  code: number;
  nome: string;
  email: string;
  imagem: string | number;
}

export interface Endereco {
  cep: string;
  bairro: string;
  estado: string;
  municipio: string;
  numero: number;
  complemento: string;
  endereco: string;
}

export interface Frete {
  default: number;
  min: number;
  acordado: number;
}

export interface Cliente {
  codigo: string;
  coligadoCodigo: string | null;
  representanteId: string;
  cnpjPrincipal: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  tipologia: string;
  telefone: string;
  contato: string;
  email: string | null;
  isInadimplente: boolean;
  prazoMedio: number;
  limiteDisponivel: number;
  posRoteiro: string;
  emAtrasado: number;
  avencer: string; // ou Date, se for convertido para objeto Date no código
  atrasoMedio: number;
  freteAcordado: number;
  descontoAcordado: number;
  tempoMedioEntrega: number;
  maximosTransportes: number;
  pedidosReprovados: number;
  ossAprovada: number;
  ossEstornadasPendentes: number;
  senhaPortal: string;
  enderecos: Endereco[];
  fretes: Frete[];
}

export interface ProdutoBandeja {
  produtoReferencia: string;
}

export interface Bandeja {
  codigo: string;
  nome: string;
  referencia: string;
  produtos: ProdutoBandeja[];
}

export interface ProdutoPedido {
  referencia: string;
  tipo: string;
  quantidade: number;
  precoUnitario: number;
  brindesItem: any[]; // Tipar caso tenha estrutura específica
}

export interface MeioPagamento {
  tipoPagamento: number;
  formaPagamento: number;
  cartaoBandeira: string | null;
  cartaoParcela: number | null;
  isPedidoContaCorrente: boolean;
  valor: number;
  pedidoInterno: string | null;
  pixComprovanteTransacao: string | null;
  duplicata: string;
  localEvento: string | null;
  prazoMedio: string;
  avp: any | null; // Tipar se a estrutura de `avp` for conhecida
  dadosComplementares: any | null; // Tipar caso tenha estrutura específica
  tipoBonificacao: any | null; // Tipar caso tenha estrutura específica
  bonificacaoDescricao: any | null; // Tipar caso tenha estrutura específica
  percentualDeFrete: number;
}

export interface Pedido {
  numeroPedido: string;
  pedidoTechnosPlus: string;
  pedidoInterno: string;
  plataforma: string;
  clienteId: string;
  representanteId: string;
  quantidadeItens: number;
  quantidadePecas: number;
  valorTotal: number;
  valorTotalComIPI: number;
  valorTotalDescontos: number;
  formaPagamento: number;
  diasPrimeiroVencimento: number;
  quantidadeDuplicata: number;
  informacaoComplementar: string;
  percentualDeFrete: number;
  percentualDeDesconto: number;
  tipoPagamento: number;
  local: string;
  dataPedidoSaldo: string | null;
  quebraPreVenda: boolean;
  dataPrevistaPA: string | null;
  tipoPedido: string;
  enderecoEntrega: string | null;
  numeroEntrega: string | null;
  cepEntrega: string | null;
  bairroEntrega: string | null;
  complementoEntrega: string | null;
  alterarEnderecoDeEntrega: string | null;
  tipoLogradouroEntrega: string | null;
  pedidoContaEOrdem: boolean;
  estadoEntrega: string | null;
  municipioEntrega: string | null;
  tabelaDePrecoId: number;
  status: string;
  statusDescricao: string;
  ganhadores: any | null; // Tipar caso tenha estrutura específica
  pedidoSaldo: any | null; // Tipar caso tenha estrutura específica
  dataCriacao: string | null;
  produtos: ProdutoPedido[];
  meiosPagamento: MeioPagamento[];
}

export interface Catalogo {
  referencia: string;
  nome: string;
  descricao: string;
  genero: string;
  representanteId: string;
  codigoBarraProduto: string;
  ncm: string;
  precoUnitario: number;
  estoque: number;
  fecho: string;
  display: string;
  mostradorCor: string;
  funcaoMecanismo: string;
  pulseiraCor: string;
  pulseiraMaterial: string;
  pulseiraTamanho: number;
  resistenciaAgua: number;
  peso: number;
  caixaMaterial: string;
  tamanhoCaixa: number;
  garantia: number;
  tipo: string;
  subgrupos: string[];
  outros: string[];
  sinalizadores: string[]; // Continua obrigatória se relevante
  codigoMarca: string;
  codigoLinha: string;
  brindesItem: any[]; // Tipar caso tenha estrutura específica
  imagens: any[]; // Tipar caso tenha estrutura específica

  // Campos novos ou opcionais
  codigoGrupoProduto?: string | null;
  codigo?: string | null;
  codigoItem?: string | null;
  codigoFilial?: string | null;
  apelido?: string | null;
  unidadeMedida?: string | null;
  localizacaoPadrao?: string | null;
  especie?: string | null;
  ipi?: number | null;
  aliquotaISS?: number | null;
  icms?: number | null;
  precoPadraoEstoque?: number | null;
  precoPadraoPromocionalEstoque?: number | null;
  saldoFaturadoEstoque?: number | null;
  codigoBandejaEstoqueProduto?: string | null;
  flagLancamentoEstoqueProduto?: string | null;
  flagRetornoEstoqueProduto?: string | null;
  flagCompraVendaEstoqueProduto?: string | null;
  flagKitEstoqueProduto?: string | null;
  flagPreVendaEstoqueProduto?: string | null;
  acessorio?: string | null;
  numeroSerie?: string | null;
  codigoFabricacao?: string | null;
  classe?: string | null;
  dataLancamento?: string | null;
  espessura?: number | null;
  largura?: number | null;
  cor?: string | null;
  altura?: string | null;
  modelo?: string | null;
  versao?: string | null;
  embalagem?: string | null;
  titulo?: string | null;
  subtitulo?: string | null;
  caracteristica?: string | null;
  volume?: number | null;
}

export type ProdutosParams = ParamListBase & {
  DetalhesDoProduto: { produto: Produto };
};

export type Produto = {
  // mínimos obrigatórios p/ tela funcionar
  codigo: string;
  precoUnitario: number;

  // identificadores / contexto (muitos podem não vir nos "similares")
  cpfCnpj?: string;
  clienteId?: string;
  representanteId?: string;

  // dados comerciais
  nomeEcommerce?: string;
  descricaoTecnica?: string | null;
  descricaoComercial?: string | null;
  descricaoOrigem?: string | null;
  codigoBarra?: string;
  ncm?: string;

  // preços
  ipi?: number;
  precoUnitarioComIPI?: number;
  precoDesconto?: number;

  // estoque
  quantidadeEstoquePA?: number;

  // características
  fecho?: string | null;
  display?: string | null;
  corMostrador?: string | null;
  funcaoMecanismo?: string | null;
  corPulseira?: string | null;
  materialPulseira?: string | null;
  tamanhoPulseira?: string | null;
  resistenciaAgua?: string | null;
  peso?: number | string | null;
  materialCaixa?: string | null;
  tamanhoCaixa?: string | null;
  espessuraCaixa?: string | null;
  garantia?: number | string | null;
  genero?: string | null;

  // taxonomias
  codigoTipoProduto?: string;
  codigoSubGrupo?: string;
  codigoMarca?: string;
  codigoLinha?: string;
  outros?: string[];
  brindesItem?: string[];

  // imagens
  imagens?: Imagem[]; // <- AGORA OBJETOS
  productImage?: string; // <- capa/1a imagem

  // sinalizadores (sempre normalizados na UI)
  sinalizadores?: Sinalizador[]; // preferido
  parsedSinalizadores?: Sinalizador[]; // compatibilidade

  // estado UI
  inventoryQtd?: number;
  catalogOpen?: boolean;
};

export type Imagem = {
  imagemUrl: string;
  imagemFilename?: string;
};

export type Sinalizador = {
  codigo: string;
  descricao: string;
};

export interface DetalhesDoProdutoParams {
  codigo: string;
  nomeEcommerce: string;
  descricaoTecnica: string;
  descricaoComercial: string;
  genero: string;
  representanteId: string;
  codigoBarra: string;
  ncm: string;
  precoUnitario: number;
  quantidadeEstoquePA: number;
  fecho: string;
  display: string;
  corMostrador: string;
  funcaoMecanismo: string;
  corPulseira: string;
  materialPulseira: string;
  tamanhoPulseira: string;
  resistenciaAgua: string;
  peso: string;
  materialCaixa: string;
  tamanhoCaixa: string;
  garantia: string;
  codigoTipoProduto: string;
  codigoSubGrupo: string;
  outros: string[];
  sinalizadores: string[];
  codigoMarca: string;
  codigoLinha: string;
  brindesItem: string[];
  imagens: string[];
  precoDesconto: number;
  productImage: string;
  inventoryQtd: number;
  catalogOpen: boolean;
  espessuraCaixa: string;
}
