export const createPagamentoTable = `
  CREATE TABLE IF NOT EXISTS Pagamento (
    filial TEXT,
    codigo TEXT,
    descricao TEXT
  );
`;

export const deletePagamentoData = `
DELETE FROM Pagamento;`;

export const dropPagamentoData = `
DROP TABLE IF EXISTS Pagamento;`;

export const insertPagamentoData = `
  INSERT INTO Pagamento (
  filial,
  codigo,
  descricao
  ) VALUES (?, ?, ?);
`;
