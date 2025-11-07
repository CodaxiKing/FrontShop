const COL = "display"; // troque para o nome legado se for diferente

export const queryDisplayOptionsCatalogo = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM Catalogo
  WHERE TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;

export const queryDisplayOptionsTabelaPreco = `
  SELECT DISTINCT TRIM(${COL}) AS label
  FROM TabelaPrecoProduto
  WHERE codigoTabela = ?
    AND TRIM(COALESCE(${COL}, '')) <> ''
  ORDER BY label;
`;
