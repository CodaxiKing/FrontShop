export const createFiltroMarcaTable = `
  CREATE TABLE IF NOT EXISTS FiltroMarca (
    filial TEXT,
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteFiltroMarcaData = `DELETE FROM FiltroMarca;`;

export const dropFiltroMarcaTable = `DROP TABLE IF EXISTS FiltroMarca;`;

export const insertFiltroMarcaData = `
  INSERT INTO FiltroMarca (filial, codigo, descricao) VALUES (?, ?, ?);
`;
