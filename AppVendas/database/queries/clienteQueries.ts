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
    enderecos TEXT,
    bloqueios TEXT,
    updateOn TEXT DEFAULT (DATETIME('now'))
  );
`;

export const insertCarteiraClienteData = `
  INSERT INTO CarteiraCliente (
    clienteId, codigo, codigoFilial, cpfCnpj, cpfCnpjPai, codigoLoja, razaoSocial,
    nomeReduzido, tipoPessoa, tipo, codigoColigado, lojaPrincipal, pais,
    representanteId, tipologia, atraso, tipoFrete, desconto, saldo, saldoDuplicatas,
    risco, tituloPrestados, limiteCredito, limiteCreditoFinanceiro, ddd, email,
    telefone, fax, contato, enderecos, bloqueios, updateOn
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

export const deleteCarteiraClienteData = `DELETE FROM CarteiraCliente;`;
export const dropCarteiraClienteTable = `DROP TABLE IF EXISTS CarteiraCliente;`;

export const queryBuscarRazaoSocial = `
  SELECT razaoSocial 
  FROM CarteiraCliente 
  WHERE cpfCnpj = ? OR clienteId = ? 
  LIMIT 1;
`;
