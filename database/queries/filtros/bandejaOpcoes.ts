// /database/filtros/bandejaOpcoes.ts
export const queryBandejaOptions = `
  SELECT DISTINCT
    b.codigo AS value,
    b.nome   AS label
  FROM Bandeja b
  INNER JOIN BandejaProduto bp ON bp.codigoBandeja = b.codigo
  WHERE TRIM(COALESCE(b.codigo, '')) <> ''
  ORDER BY 2;
`;
