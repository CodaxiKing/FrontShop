const COL = "corPulseira";

export const queryCorPulseiraOptionsCatalogo = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM Catalogo
  WHERE TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;

export const queryCorPulseiraOptionsTabelaPreco = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;
