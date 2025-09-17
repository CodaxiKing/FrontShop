export const createPagamentoClienteTable = `
  CREATE TABLE IF NOT EXISTS PagamentoCliente (
    codigo TEXT,
    codigoFilial TEXT,
    cpfCnpj TEXT,
    item TEXT,
    codigoFormaPagamento TEXT,
    descricao TEXT,
    quantidadeParcelas INTEGER,
    prazoEntreParcelas INTEGER,
    diasParaPrimeiraParcela INTEGER
  );
`;

export const deletePagamentoClienteData = `
DELETE FROM PagamentoCliente;`;

export const dropPagamentoClienteData = `
DROP TABLE IF EXISTS PagamentoCliente;`;

export const insertPagamentoClienteData = `
  INSERT INTO PagamentoCliente (
  codigo,
  codigoFilial, 
  cpfCnpj, 
  item, 
  codigoFormaPagamento, 
  descricao, 
  quantidadeParcelas, 
  prazoEntreParcelas, 
  diasParaPrimeiraParcela
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
