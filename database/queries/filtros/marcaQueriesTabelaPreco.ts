/**
 * Path: src/database/queries/filtros/catalogo/marcaQueriesTabelaPreco.ts
 * Propósito: listar opções de MARCA para TabelaPrecoProduto (filtradas pela tabela ativa).
 */
export const queryMarcaOptionsTabelaPreco = `
  SELECT DISTINCT
    TRIM(codigoMarca)    AS value,
    TRIM(descricaoMarca) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND codigoMarca IS NOT NULL
    AND TRIM(codigoMarca) <> ''
  ORDER BY label COLLATE NOCASE ASC
`;
