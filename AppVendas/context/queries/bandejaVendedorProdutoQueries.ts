export const createBandejaVendedorProdutoTable = `
  CREATE TABLE IF NOT EXISTS BandejaVendedorProduto (
  representanteId TEXT,
  codigoBandeja TEXT,
  codigoProduto TEXT
);
`;

export const deleteBandejaVendedorProdutoData = `DELETE FROM BandejaVendedorProduto;`;

export const dropBandejaVendedorProdutoData = `
DROP TABLE IF EXISTS BandejaVendedorProduto;
`;

export const insertBandejaVendedorProdutoData = `
  INSERT INTO BandejaVendedorProduto (
  representanteId, 
  codigoBandeja, 
  codigoProduto
  )
  VALUES (?, ?, ?);
`;
