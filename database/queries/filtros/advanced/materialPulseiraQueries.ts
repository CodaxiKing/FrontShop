const COL = "materialPulseira";

export const queryMaterialPulseiraOptionsCatalogo = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM Catalogo
  WHERE TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;

export const queryMaterialPulseiraOptionsTabelaPreco = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;
