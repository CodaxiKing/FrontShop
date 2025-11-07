export const createBandejaProdutoTable = `
  CREATE TABLE IF NOT EXISTS BandejaProduto (
  codigoProduto TEXT,
  codigoBandeja TEXT
);
`;

export const deleteBandejaProdutoData = `DELETE FROM BandejaProduto;`;

export const dropBandejaProdutoData = `
DROP TABLE IF EXISTS BandejaProduto;
`;

export const insertBandejaProdutoData = `
  INSERT INTO BandejaProduto (
  codigoProduto,
  codigoBandeja
  )
  VALUES (?, ?);
`;
