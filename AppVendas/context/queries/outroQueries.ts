export const createOutroTable = `
  CREATE TABLE IF NOT EXISTS Outro (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteOutroData = `DELETE FROM Outro;`;

export const insertOutroData = `
  INSERT INTO Outro (codigo, descricao) VALUES (?, ?);
`;
