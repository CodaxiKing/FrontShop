export const createControleIntegracaoTable = `
  CREATE TABLE IF NOT EXISTS ControleIntegracao (
  codigo TEXT PRIMARY KEY,
  descricao TEXT,
  pageSize INTEGER,
  dataAtualizacao TEXT
);
`;

export const deleteControleIntegracaoData = `DELETE FROM ControleIntegracao;`;

export const insertControleIntegracaoData = `
INSERT OR REPLACE INTO ControleIntegracao (
codigo, descricao, pageSize, dataAtualizacao
)
VALUES (?, ?, ?, null);
`;

export const selectControleIntegracaoData = `SELECT * FROM ControleIntegracao WHERE dataAtualizacao IS NULL AND codigo = ?;`;

export const updateControleIntegracaoData = `
UPDATE ControleIntegracao
SET dataAtualizacao = CURRENT_TIMESTAMP
WHERE codigo = ?;
`;

export const selectControleIntegracaoDataAtualizacao = `SELECT COUNT(*) FROM ControleIntegracao WHERE dataAtualizacao IS NULL;`;

export const updateControleIntegracaoDataAtualizacaoNull = `
UPDATE ControleIntegracao
SET dataAtualizacao = NULL;
`;
