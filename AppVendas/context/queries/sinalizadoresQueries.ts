export const createSinalizadoresTable = `
  CREATE TABLE IF NOT EXISTS Sinalizadores (
    filial TEXT,
    tipo TEXT,
    tipoDescricao TEXT,
    codigo TEXT,
    descricao TEXT
  );
`;

export const deleteSinalizadoresData = `DELETE FROM Sinalizadores;`;

export const dropSinalizadoresData = `DROP TABLE IF EXISTS Sinalizadores;`;

export const insertSinalizadoresData = `
  INSERT INTO Sinalizadores (
  filial, tipo, tipoDescricao, codigo, descricao
  ) VALUES (?, ?, ?, ?, ?);
`;
