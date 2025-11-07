export const createExpositorTable = `
  CREATE TABLE IF NOT EXISTS Expositor (
  codigo TEXT,
  nomeEcommerce TEXT,
  codigoBarra TEXT,
  peso REAL,
  ncm TEXT,
  precoUnitario REAL,
  ipi REAL,
  saldo REAL,
  filialMarca TEXT,
  codigoMarca TEXT,
  descricaoMarca TEXT,
  importMarca TEXT,
  imagens TEXT
);
`;

export const deleteExpositorData = `DELETE FROM Expositor;`;

export const dropExpositorData = `
DROP TABLE IF EXISTS Expositor;
`;

export const insertExpositorData = `
  INSERT INTO Expositor (
    codigo,
    nomeEcommerce,
    codigoBarra,
    peso,
    ncm,
    precoUnitario,
    ipi,
    saldo,
    filialMarca,
    codigoMarca,
    descricaoMarca,
    importMarca,
    imagens
  )
  VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;
