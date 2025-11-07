export const createRepresentanteTable = `
  CREATE TABLE IF NOT EXISTS Representante (
    codigo TEXT PRIMARY KEY,
    representanteId TEXT,
    codigoFilial TEXT,
    nome TEXT,
    nomeReduzido TEXT,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    telefone TEXT,
    fax TEXT,
    cpfCnpj TEXT,
    email TEXT,
    gerente TEXT,
    supervisor TEXT,
    diretor TEXT,
    codigoCentroCusto TEXT,
    codigoLoja TEXT,
    cargo TEXT,
    pais TEXT,
    telefoneCelular TEXT,
    filialRepresentanteGerente TEXT,
    filialRepresentanteCodigoFilial TEXT,
    filialRepresentanteCodigoFilialRepresentante TEXT,
    filialRepresentanteSigla TEXT,
    filialRepresentanteDescricao TEXT,
    filialRepresentantePercentualFixoRepasseMensal INTEGER,
    filialRepresentanteValorFixoRepasseMensal INTEGER,
    tabelaPrecos TEXT,
    bloqueios TEXT
  );
`;

export const deleteRepresentanteData = `DELETE FROM Representante;`;

export const dropRepresentanteData = `DROP TABLE IF EXISTS Representante;`;

export const insertRepresentanteData = `
  INSERT INTO Representante (
    codigo,
    representanteId,
    codigoFilial,
    nome,
    nomeReduzido,
    endereco,
    bairro,
    cidade,
    estado,
    cep,
    telefone,
    fax,
    cpfCnpj,
    email,
    gerente,
    supervisor,
    diretor,
    codigoCentroCusto,
    codigoLoja,
    cargo,
    pais,
    telefoneCelular,
    filialRepresentanteGerente,
    filialRepresentanteCodigoFilial,
    filialRepresentanteCodigoFilialRepresentante,
    filialRepresentanteSigla,
    filialRepresentanteDescricao,
    filialRepresentantePercentualFixoRepasseMensal,
    filialRepresentanteValorFixoRepasseMensal,
    tabelaPrecos,
    bloqueios

  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
