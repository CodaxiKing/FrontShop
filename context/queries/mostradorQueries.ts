export const createMostradorTable = `
  CREATE TABLE IF NOT EXISTS Mostrador (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteMostradorData = `DELETE FROM Mostrador;`;

export const insertMostradorData = `
  INSERT INTO Mostrador (codigo, descricao) VALUES (?, ?);
`;
