const COL = "corMostrador";

export const queryCorMostradorOptionsCatalogo = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM Catalogo
  WHERE TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;

export const queryCorMostradorOptionsTabelaPreco = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;
