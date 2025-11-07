/**
 * Path: src/database/queries/filtros/catalogo/subgrupoQueriesTabelaPreco.ts
 * Propósito: listar opções de SUBGRUPO para TabelaPrecoProduto (filtradas pela tabela ativa).
 */
export const querySubgrupoOptionsTabelaPreco = `
  SELECT DISTINCT
    TRIM(codigoSubGrupo)    AS value,
    TRIM(descricaoSubGrupo) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND codigoSubGrupo IS NOT NULL
    AND TRIM(codigoSubGrupo) <> ''
  ORDER BY label COLLATE NOCASE ASC
`;
