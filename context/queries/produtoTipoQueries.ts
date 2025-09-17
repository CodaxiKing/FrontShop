export const createProdutoTipoTable = `
  CREATE TABLE IF NOT EXISTS ProdutoTipo (
    codigo TEXT PRIMARY KEY,
    descricao TEXT
  );
`;

export const deleteProdutoTipoData = `DELETE FROM ProdutoTipo;`;

export const insertProdutoTipoData = `
  INSERT INTO ProdutoTipo (codigo, descricao) VALUES (?, ?);
`;
