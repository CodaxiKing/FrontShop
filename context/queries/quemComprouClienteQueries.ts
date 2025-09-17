export const createQuemComprouClienteTable = `
  CREATE TABLE IF NOT EXISTS QuemComprouCliente (
  filial TEXT,
  cpfCnpj TEXT,
  codigoMarca TEXT,
  subGrupo TEXT
);
`;

export const deleteQuemComprouClienteData = `DELETE FROM QuemComprouCliente;`;

export const dropQuemComprouClienteData = `
DROP TABLE IF EXISTS QuemComprouCliente;
`;

export const insertQuemComprouClienteData = `
  INSERT INTO QuemComprouCliente (
  filial,
  cpfCnpj,
  codigoMarca,
  subGrupo
  )
  VALUES (?, ?, ?, ?);
`;
