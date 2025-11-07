export const createMarcaTable = `
  CREATE TABLE IF NOT EXISTS Marca (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteMarcaData = `DELETE FROM Marca;`;

export const insertMarcaData = `
  INSERT INTO Marca (codigo, descricao) VALUES (?, ?);
`;
