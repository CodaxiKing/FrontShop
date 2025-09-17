/**
 * Path: src/database/queries/filtros/catalogo/marcaQueriesCatalogo.ts
 * Propósito: listar opções de MARCA a partir do Catalogo.
 */
export const queryMarcaOptionsCatalogo = `
  SELECT DISTINCT
    TRIM(codigoMarca)    AS value,
    TRIM(descricaoMarca) AS label
  FROM Catalogo
  WHERE codigoMarca IS NOT NULL
    AND TRIM(codigoMarca) <> ''
  ORDER BY label COLLATE NOCASE ASC
`;
