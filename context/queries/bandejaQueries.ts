export const createBandejaTable = `
  CREATE TABLE IF NOT EXISTS Bandeja (
  codigo TEXT,
  codigoFilial TEXT,
  nome TEXT,
  dataInicio TEXT,
  usuarioInclusao TEXT,
  status TEXT
);
`;

export const deleteBandejaData = `DELETE FROM Bandeja;`;

export const dropBandejaData = `
DROP TABLE IF EXISTS Bandeja;
`;

export const insertBandejaData = `
  INSERT INTO Bandeja (
  codigo, 
  codigoFilial, 
  nome, 
  dataInicio, 
  usuarioInclusao,
  status
  )
  VALUES (?, ?, ?, ?, ?, ?);
`;
