export const createPulseiraMaterialTable = `
  CREATE TABLE IF NOT EXISTS PulseiraMaterial (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deletePulseiraMaterialData = `DELETE FROM PulseiraMaterial;`;

export const insertPulseiraMaterialData = `
  INSERT INTO PulseiraMaterial (codigo, descricao) VALUES (?, ?);
`;
