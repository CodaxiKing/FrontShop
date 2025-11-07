export const queryBuscarPedido = `
  SELECT * FROM NovoPedido WHERE cpfCnpj = ? AND clienteId = ? AND representanteId = ? LIMIT 1;
`;

export const queryAtualizarPedido = `
  UPDATE NovoPedido
  SET produtos = ?, nomeEcommerce = ?, quantidadeItens = ?, quantidadePecas = ?, valorTotal = ?, selectedTabelaPreco = ?
  WHERE id = ?;
`;

export const queryInserirPedido = `
  INSERT INTO NovoPedido (
    clienteId, razaoSocial, cpfCnpj, enderecoEntrega, numeroEntrega,
    cepEntrega, bairroEntrega, complementoEntrega, estadoEntrega,
    municipioEntrega, produtos, quantidadeItens, quantidadePecas,
    valorTotal, selectedTabelaPreco, nomeEcommerce, representanteId, representanteCreateId
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
