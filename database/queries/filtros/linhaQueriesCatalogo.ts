/**
 * Path: src/database/queries/filtros/catalogo/linhaQueries.ts
 * Propósito: listar opções de LINHA a partir do Catalogo.
 */
export const queryLinhaOptionsCatalogo = `
  SELECT DISTINCT
    TRIM(codigoLinha)    AS value,
    TRIM(descricaoLinha) AS label
  FROM Catalogo
  WHERE codigoLinha IS NOT NULL
    AND TRIM(codigoLinha) <> ''
  ORDER BY label COLLATE NOCASE ASC
`;
