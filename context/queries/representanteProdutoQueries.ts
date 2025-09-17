export const createRepresentanteProdutoTable = `
  CREATE TABLE IF NOT EXISTS RepresentanteProduto (
    produtoReferencia TEXT,
    representanteId TEXT,
    PRIMARY KEY (produtoReferencia, representanteId)
  );
`;

export const deleteRepresentanteProdutoData = `DELETE FROM RepresentanteProduto;`;

export const insertRepresentanteProdutoData = `
  INSERT INTO RepresentanteProduto (produtoReferencia, representanteId) VALUES (?, ?);
`;
