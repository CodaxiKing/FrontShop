// database/queries/carrinhoQueries.ts

// Busca pedido aberto pela chave (cpfCnpj + clienteId + representanteId)
export const querySelectPedidoPorChave = `
  SELECT *
  FROM NovoPedido
  WHERE cpfCnpj = ? AND clienteId = ? AND representanteId = ?
  ORDER BY id DESC
  LIMIT 1;
`;



// Cria novo pedido
export const queryInsertNovoPedido = `
  INSERT INTO NovoPedido (
    clienteId, razaoSocial, cpfCnpj, enderecoEntrega, numeroEntrega,
    cepEntrega, bairroEntrega, complementoEntrega, estadoEntrega,
    municipioEntrega, lojas, produtos, quantidadeItens, quantidadePecas, valorTotal,
    tabelaDePrecoId, nomeEcommerce, representanteId, representanteCreateId
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

// Atualiza JSON de produtos e contadores
export const queryUpdatePedidoProdutosEContadores = `
  UPDATE NovoPedido
  SET produtos = ?, nomeEcommerce = ?, quantidadeItens = ?, quantidadePecas = ?, tabelaDePrecoId = ?, razaoSocial = ?
  WHERE id = ? AND representanteId = ?;
`;

// Atualiza somente JSON de produtos e contadores (sem mexer em nome/tabela)
export const queryUpdatePedidoProdutosEContadoresLight = `
  UPDATE NovoPedido
  SET produtos = ?, quantidadeItens = ?, quantidadePecas = ?
  WHERE id = ? AND representanteId = ?;
`;

// Apaga pedido pelo id ou representanteId nulo
export const queryDeletePedidoById = `
  DELETE FROM NovoPedido
  WHERE (id = ? OR representanteId IS NULL OR quantidadeItens = 0);
`;

// Apaga pedido pelo id
export const queryDeleteTodosPedido = `
  DELETE FROM NovoPedido;
`;

// Atualiza apenas contadores (se já tiver JSON pronto lá)
export const queryUpdateContadores = `
  UPDATE NovoPedido
  SET quantidadeItens = ?, quantidadePecas = ?
  WHERE id = ? AND representanteId = ?;
`;

export const queryCountCarrinhosByRepresentante = `
  SELECT COUNT(*) AS count
  FROM NovoPedido
  WHERE representanteId = ?;
`;

export const queryListCarrinhosByRepresentante = `
  SELECT *
  FROM NovoPedido
  WHERE representanteId = ?
  ORDER BY id DESC;
`;