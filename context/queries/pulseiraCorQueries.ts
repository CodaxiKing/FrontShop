export const createPulseiraCorTable = `
  CREATE TABLE IF NOT EXISTS PulseiraCor (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deletePulseiraCorData = `DELETE FROM PulseiraCor;`;

export const insertPulseiraCorData = `
  INSERT INTO PulseiraCor (codigo, descricao) VALUES (?, ?);
`;
