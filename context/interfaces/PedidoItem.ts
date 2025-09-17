export interface ProdutoBrinde {
  brinde: string;
  quantidade: number;
  valor: number;
  tipoBrinde: number;
  tipoBrindeDescricao: string;
}

export interface ProdutoPedido {
  referencia: string;
  tipo: string;
  quantidade: number;
  precoUnitario: number;
  precoUnitarioComIPI: number;
  brindesItem: ProdutoBrinde[];
}

export interface MeioPagamento {
  tipoPagamento: number;
  formaPagamento: string;
  cartaoBandeira: string;
  cartaoParcela: number;
  isPedidoContaCorrente: boolean;
  valor: number;
  pedidoInterno: string;
  pixComprovanteTransacao: string;
  duplicata: string;
  localEvento: string;
  prazoMedio: string;
  avp: string;
  dadosComplementares: string;
  tipoBonificacao: number;
  bonificacaoDescricao: string;
  percentualDeFrete: number;
}

export interface PedidoItem {
  // Alinhado com a tabela Pedido
  id?: number; // Opcional pois o ID é gerado automaticamente no banco
  codigoMobile: string;
  razaoSocial?: string; // Campo que estava na tabela mas não no JSON
  numeroPedido: string;
  pedidoTechnosPlus: string;
  pedidoInterno: string;
  plataforma: string;
  clienteId: string;
  cpfCnpj: string; // Alinhado com o JSON, anteriormente 'cnpj' na tabela
  representanteId: string;
  representanteCreateId?: string; // Campo adicional do JSON
  quantidadeItens: number;
  quantidadePecas: number;
  valorTotal: number;
  valorTotalComIPI: number;
  valorTotalDescontos: number;
  formaPagamento: string;
  diasPrimeiroVencimento: number;
  quantidadeDuplicata: number;
  informacaoComplementar: string;
  percentualDeFrete: number;
  percentualDeDesconto: number;
  tipoPagamento: number;
  local: string;
  dataPedidoSaldo: string;
  quebraPreVenda: boolean;
  dataPrevistaPA: string;
  tipoPedido: string;
  enderecoEntrega: string;
  numeroEntrega: string;
  cepEntrega: string;
  bairroEntrega: string;
  complementoEntrega: string;
  alterarEnderecoDeEntrega: string;
  tipoLogradouroEntrega: string;
  pedidoContaEOrdem: boolean;
  estadoEntrega: string;
  municipioEntrega: string;
  tabelaDePrecoId: string;
  status: string;
  statusDescricao: string;
  ganhadores: string;
  pedidoSaldo: string;
  dataCriacao: string;
  produtos: ProdutoPedido[];
  meiosPagamento: MeioPagamento[];
}
