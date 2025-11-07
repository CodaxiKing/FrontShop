export const createFiltroLinhaTable = `
  CREATE TABLE IF NOT EXISTS FiltroLinha (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteFiltroLinhaData = `DELETE FROM FiltroLinha;`;

export const dropFiltroLinhaTable = `DROP TABLE IF EXISTS FiltroLinha;`;

export const insertFiltroLinhaData = `
  INSERT INTO FiltroLinha (codigo, descricao) VALUES (?, ?);
`;
