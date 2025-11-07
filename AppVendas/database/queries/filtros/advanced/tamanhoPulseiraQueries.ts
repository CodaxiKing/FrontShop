const COL = "tamanhoPulseira";

export const queryTamanhoPulseiraOptionsCatalogo = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM Catalogo
  WHERE TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;

export const queryTamanhoPulseiraOptionsTabelaPreco = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;
