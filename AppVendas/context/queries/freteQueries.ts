export const createFreteTable = `
  CREATE TABLE IF NOT EXISTS Frete (
    codigoColigado TEXT,
    percentualFretePedidoMinimo REAL,
    valorFrete REAL,
    fretePadrao REAL,
    valorFretePedidoMinimo REAL,
    filialRepresentante TEXT
  );
`;

export const deleteFreteTable = `
  DELETE FROM Frete;
`;

export const dropFreteTable = `
  DROP TABLE IF EXISTS Frete;
`;

export const insertFreteData = `
  INSERT INTO Frete (
    codigoColigado,
    percentualFretePedidoMinimo,
    valorFrete,
    fretePadrao,
    valorFretePedidoMinimo,
    filialRepresentante
  ) VALUES (?, ?, ?, ?, ?, ?);
`;
