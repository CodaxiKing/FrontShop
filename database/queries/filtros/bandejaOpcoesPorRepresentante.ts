// database/filtros/bandejaOpcoesPorRepresentante.ts
export const queryBandejaOptionsByRep = `
  SELECT DISTINCT
    b.codigo AS value,
    b.nome   AS label
  FROM Bandeja b
  INNER JOIN BandejaVendedorProduto bvp ON bvp.codigoBandeja = b.codigo
  WHERE bvp.representanteId = ?
    AND TRIM(COALESCE(b.codigo, '')) <> ''
  ORDER BY 2;
`;
