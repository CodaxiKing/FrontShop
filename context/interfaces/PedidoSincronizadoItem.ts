interface Produtos {
  codigo: string;
  quantidade: number;
  tipo: string;
  precoUnitario: number;
}

interface MeioPagamento {
  formaPagamento: string;
  tipoPagamento: number;
  quantidadeDuplicata: number;
  diasPrimeiroVencimento: number;
  local: string;
  cartaoBandeira: string;
  cartaoParcela: number;
  cartaoValor: number;
  pixComprovanteTransacao: string;
  pedidoContaCorrente: boolean;
  informacaoComplementar: string;
  pedidoInterno: string;
  percentualDeFrete: number;
  percentualDeDesconto: number;
}

export interface PedidoSincronizadoResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: PedidoSincronizadoItem[];
}

export interface PedidoSincronizadoItem {
  isPrevenda: boolean;
  id?: number; // Opcional pois o ID é gerado automaticamente no banco
  codigoMobile: string;
  alterarEnderecoDeEntrega: string;
  bairroEntrega: string;
  cepEntrega: string;
  clienteId: string;
  complementoEntrega: string;
  dataPedidoSaldo: string;
  dataPrevistaPA: string;
  descricaoMotivoBonificacao: string;
  diasPrimeiroVencimento: string;
  enderecoEntrega: string;
  estadoEntrega: string;
  ganhadores: string;
  motivoBonificacao: string;
  municipioEntrega: string;
  numeroEntrega: string;
  numeroPedido: string;
  percentualDeDesconto: number;
  plataforma: string;
  quantidadeItens: number;
  quantidadePecas: number;
  quebraPreVenda: boolean;
  representanteCreateId: string;
  representanteId: string;
  tabelaDePrecoId: string;
  tipoLogradouroEntrega: string;
  tipoPedido: string;
  dataCriacao: string;
  dataSincronizacao: string;
  statusCodigo: number;
  statusDescricao: string;
  valorTotal: number;
  valorTotalComIPI: number;
  valorTotalDescontos: number;
  produtos: Produtos[];
  meiosPagamento: MeioPagamento[];
}
