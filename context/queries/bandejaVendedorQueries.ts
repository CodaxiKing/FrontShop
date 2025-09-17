export const createBandejaVendedorTable = `
  CREATE TABLE IF NOT EXISTS BandejaVendedor (
  codigo TEXT,
  representanteId TEXT,
  nome TEXT
);
`;

export const deleteBandejaVendedorData = `DELETE FROM BandejaVendedor;`;

export const dropBandejaVendedorData = `
DROP TABLE IF EXISTS BandejaVendedor;
`;

export const insertBandejaVendedorData = `
  INSERT INTO BandejaVendedor (
  codigo, 
  representanteId, 
  nome
  )
  VALUES (?, ?, ?);
`;
