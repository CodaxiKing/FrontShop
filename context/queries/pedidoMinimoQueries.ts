export const createPedidoMinimoTable = `
  CREATE TABLE IF NOT EXISTS PedidoMinimo (
    filial TEXT,
    descricao TEXT,
    tipo TEXT,
    quantidadeMinima INTEGER,
    verificarQuemComprouCliente TEXT,
    exposicao TEXT,
    diferenciaProduto TEXT,
    bloqueio TEXT,
    ordem INTEGER,
    disney TEXT,
    marvel TEXT
  );
`;

export const deletePedidoMinimoData = `DELETE FROM PedidoMinimo;`;

export const dropPedidoMinimoTable = `DROP TABLE IF EXISTS PedidoMinimo;`;

export const insertPedidoMinimoData = `
  INSERT INTO PedidoMinimo (
    filial,
    descricao,
    tipo,
    quantidadeMinima,
    verificarQuemComprouCliente,
    exposicao,
    diferenciaProduto,
    bloqueio,
    ordem,
    disney,
    marvel
  ) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
