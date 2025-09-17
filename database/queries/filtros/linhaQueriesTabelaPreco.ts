/**
 * Path: src/database/queries/filtros/linhaQueries.ts
 * Propósito: listar opções de LINHA para a TabelaPrecoProduto (filtradas pela tabela ativa).
 */
export const queryLinhaOptionsTabela = `
  SELECT DISTINCT
    TRIM(codigoLinha)    AS value,
    TRIM(descricaoLinha) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND codigoLinha IS NOT NULL
    AND TRIM(codigoLinha) <> ''
  ORDER BY label COLLATE NOCASE ASC
`;
