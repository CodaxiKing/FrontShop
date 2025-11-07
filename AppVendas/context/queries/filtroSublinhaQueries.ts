export const createFiltroSublinhaTable = `
  CREATE TABLE IF NOT EXISTS FiltroSublinha (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteFiltroSublinhaData = `DELETE FROM FiltroSublinha;`;

export const dropFiltroSublinhaTable = `DROP TABLE IF EXISTS FiltroSublinha;`;

export const insertFiltroSublinhaData = `
  INSERT INTO FiltroSublinha (codigo, descricao) VALUES (?, ?);
`;
