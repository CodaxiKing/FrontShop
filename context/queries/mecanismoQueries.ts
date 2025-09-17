export const createMecanismoTable = `
  CREATE TABLE IF NOT EXISTS Mecanismo (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteMecanismoData = `DELETE FROM Mecanismo;`;

export const insertMecanismoData = `
  INSERT INTO Mecanismo (codigo, descricao) VALUES (?, ?);
`;
