export const createPulseiraTamanhoTable = `
  CREATE TABLE IF NOT EXISTS PulseiraTamanho (
    tamanho REAL PRIMARY KEY
  );
`;

export const deletePulseiraTamanhoData = `DELETE FROM PulseiraTamanho;`;

export const insertPulseiraTamanhoData = `
  INSERT INTO PulseiraTamanho (tamanho) VALUES (?);
`;
