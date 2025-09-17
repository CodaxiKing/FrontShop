// database/queries/createTabelaPrecoProdutoIndexes.ts (sugestão de arquivo novo)
export const createTabelaPrecoProdutoIndexes = `
  CREATE INDEX IF NOT EXISTS idx_tpp_codigo            ON TabelaPrecoProduto (codigo);
  CREATE INDEX IF NOT EXISTS idx_tpp_codigobarra       ON TabelaPrecoProduto (codigoBarra);
  CREATE INDEX IF NOT EXISTS idx_tpp_codigotabela      ON TabelaPrecoProduto (codigoTabelaPreco);
`;
