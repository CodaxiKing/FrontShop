/**
 * Path: src/database/queries/sinalizadores/sinalizadorIconQueries.ts
 * Propósito: consultas para mapear (descricao ↔ códigos) dos sinalizadores no catálogo.
 */

export const queryListDistinctSinalizadorCodDesc = `
  SELECT DISTINCT
    json_extract(j.value,'$.codigo')    AS codigo,
    json_extract(j.value,'$.descricao') AS descricao
  FROM Catalogo
  JOIN json_each(Catalogo.sinalizadores) AS j
  WHERE json_extract(j.value,'$.codigo')    IS NOT NULL
    AND json_extract(j.value,'$.descricao') IS NOT NULL;
`;
