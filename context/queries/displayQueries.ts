export const createDisplayTable = `
  CREATE TABLE IF NOT EXISTS Display (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteDisplayData = `DELETE FROM Display;`;

export const dropDisplayData = `DROP TABLE IF EXISTS Display`;

export const insertDisplayData = `
  INSERT INTO Display (codigo, descricao) VALUES (?, ?);
`;
