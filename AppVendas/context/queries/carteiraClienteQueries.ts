export const createCarteiraClienteTable = `
  CREATE TABLE IF NOT EXISTS CarteiraCliente (
  clienteId TEXT,
  codigo TEXT,
  codigoFilial TEXT,
  cpfCnpj TEXT,
  cpfCnpjPai TEXT,
  codigoLoja TEXT,
  razaoSocial TEXT,
  nomeReduzido TEXT,
  tipoPessoa TEXT,
  tipo TEXT,
  codigoColigado TEXT,
  lojaPrincipal TEXT,
  pais TEXT,
  representanteId TEXT,
  tipologia TEXT,
  atraso INTEGER,
  tipoFrete TEXT,
  desconto REAL,
  saldo REAL,
  saldoDuplicatas REAL,
  risco TEXT,
  tituloPrestados INTEGER,
  limiteCredito REAL,
  limiteCreditoFinanceiro REAL,
  ddd TEXT,
  email TEXT,
  telefone TEXT,
  fax TEXT,
  contato TEXT,
  enderecos TEXT,  -- Armazena o array de endereços como JSON
  bloqueios TEXT,  -- Armazena o array de endereços como JSON
  updateOn TEXT DEFAULT (DATETIME('now'))  -- Define updateOn com valor padrão
);
`;

export const deleteCarteiraClienteData = `DELETE FROM CarteiraCliente;`;

export const dropCarteiraClienteTable = `DROP TABLE IF EXISTS CarteiraCliente;`;

export const insertCarteiraClienteData = `
  INSERT INTO CarteiraCliente (
  clienteId, codigo, codigoFilial, cpfCnpj, cpfCnpjPai, codigoLoja, razaoSocial,
  nomeReduzido, tipoPessoa, tipo, codigoColigado, lojaPrincipal, pais,
  representanteId, tipologia, atraso, tipoFrete, desconto, saldo, saldoDuplicatas,
  risco, tituloPrestados, limiteCredito, limiteCreditoFinanceiro, ddd, email,
  telefone, fax, contato, enderecos, bloqueios, updateOn
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'));
`;
