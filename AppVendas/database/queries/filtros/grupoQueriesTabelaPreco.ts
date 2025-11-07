// database/queries/filtros/grupoQueriesTabelaPreco.ts
export const queryGrupoOpcoesTabelaPreco = `
  SELECT DISTINCT
    COALESCE(codigoGrupo, '')    AS codigo,
    COALESCE(descricaoGrupo, '') AS descricao
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND TRIM(COALESCE(codigoGrupo, '')) <> ''
  ORDER BY 2;
`;
