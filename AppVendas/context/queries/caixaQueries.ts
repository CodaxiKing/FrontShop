export const createCaixaTable = `
  CREATE TABLE IF NOT EXISTS Caixa (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteCaixaData = `DELETE FROM Caixa;`;

export const insertCaixaData = `
  INSERT INTO Caixa (codigo, descricao) VALUES (?, ?);
`;
