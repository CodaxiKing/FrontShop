export const createFiltroOrigemTable = `
  CREATE TABLE IF NOT EXISTS FiltroOrigem (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteFiltroOrigemData = `DELETE FROM FiltroOrigem;`;

export const dropFiltroOrigemTable = `DROP TABLE IF EXISTS FiltroOrigem;`;

export const insertFiltroOrigemData = `
  INSERT INTO FiltroOrigem (codigo, descricao) VALUES (?, ?);
`;
