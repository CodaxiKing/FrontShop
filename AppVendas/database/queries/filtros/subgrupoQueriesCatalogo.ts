/**
 * Path: src/database/queries/filtros/catalogo/subgrupoQueriesCatalogo.ts
 * Propósito: listar opções de SUBGRUPO a partir do Catalogo.
 */
export const querySubgrupoOptionsCatalogo = `
  SELECT DISTINCT
    TRIM(codigoSubGrupo)    AS value,
    TRIM(descricaoSubGrupo) AS label
  FROM Catalogo
  WHERE codigoSubGrupo IS NOT NULL
    AND TRIM(codigoSubGrupo) <> ''
  ORDER BY label COLLATE NOCASE ASC
`;
