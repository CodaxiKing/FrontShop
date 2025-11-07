// database/queries/createCatalogoIndexes.ts
export const createCatalogoIndexes = `
  CREATE INDEX IF NOT EXISTS idx_catalogo_codigo       ON Catalogo (codigo);
  CREATE INDEX IF NOT EXISTS idx_catalogo_codigobarra  ON Catalogo (codigoBarra);
  CREATE INDEX IF NOT EXISTS idx_catalogo_marca        ON Catalogo (codigoMarca);
  CREATE INDEX IF NOT EXISTS idx_catalogo_linha        ON Catalogo (codigoLinha);
`;
