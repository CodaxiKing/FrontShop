// database/queries/filtros/grupoQueriesCatalogo.ts
export const queryGrupoOpcoesCatalogo = `
  SELECT DISTINCT
    COALESCE(codigoGrupo, '')    AS codigo,
    COALESCE(descricaoGrupo, '') AS descricao
  FROM Catalogo
  WHERE TRIM(COALESCE(codigoGrupo, '')) <> ''
  ORDER BY 2;
`;
