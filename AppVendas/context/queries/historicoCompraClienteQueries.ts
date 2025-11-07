export const createHistoricoCompraClienteTable = `
  CREATE TABLE IF NOT EXISTS HistoricoCompraCliente (
    filial TEXT,
    codigoCliente TEXT,
    loja TEXT,
    filialVenda TEXT,
    codigoProduto TEXT,
    dataProcessamento TEXT,
    dataVenda TEXT,
    quantidade INTEGER,
    totalVenda REAL,
    chaveSecundaria TEXT
);
`;

export const deleteHistoricoCompraClienteData = `DELETE FROM HistoricoCompraCliente;`;

export const dropHistoricoCompraClienteData = `
DROP TABLE IF EXISTS HistoricoCompraCliente;
`;

export const insertHistoricoCompraClienteData = `
  INSERT INTO HistoricoCompraCliente (
    filial,
    codigoCliente,
    loja,
    filialVenda,
    codigoProduto,
    dataProcessamento,
    dataVenda,
    quantidade,
    totalVenda,
    chaveSecundaria
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
