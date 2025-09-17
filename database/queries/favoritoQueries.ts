// database/queries/favoritoQueries.ts
export const queryCreateFavoritosTable = `
CREATE TABLE IF NOT EXISTS favoritos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produtoId TEXT NOT NULL,
  cpfCnpj TEXT NOT NULL,
  clienteId TEXT NOT NULL,
  representanteId TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_favoritos_ctx
  ON favoritos (produtoId, cpfCnpj, clienteId, representanteId);
`;

export const queryAddFavorito = `
INSERT OR IGNORE INTO favoritos (produtoId, cpfCnpj, clienteId, representanteId)
VALUES (?, ?, ?, ?);
`;

export const queryRemoveFavorito = `
DELETE FROM favoritos
 WHERE produtoId = ? AND cpfCnpj = ? AND clienteId = ? AND representanteId = ?;
`;

export const queryIsFavorito = `
SELECT 1
  FROM favoritos
 WHERE produtoId = ? AND cpfCnpj = ? AND clienteId = ? AND representanteId = ?
 LIMIT 1;
`;

// Monta dinamicamente a lista para a tela atual (página) evitando N+1
export const buildQueryFavoritosMapIn = (qtde: number) => `
SELECT produtoId
  FROM favoritos
 WHERE cpfCnpj = ? AND clienteId = ? AND representanteId = ?
   AND produtoId IN (${Array(qtde).fill("?").join(",")});
`;
