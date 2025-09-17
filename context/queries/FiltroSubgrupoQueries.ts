export const createFiltroSubgrupoTable = `
  CREATE TABLE IF NOT EXISTS FiltroSubgrupo (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteFiltroSubgrupoData = `DELETE FROM FiltroSubgrupo;`;

export const dropFiltroSubgrupoTable = `DROP TABLE IF EXISTS FiltroSubgrupo;`;

export const insertFiltroSubgrupoData = `
  INSERT INTO FiltroSubgrupo (codigo, descricao) VALUES (?, ?);
`;
