export const queryBuscarTabelaPrecoPorTermo = (condicoesBusca: string, condicionalExtra?: string) => `
  SELECT * FROM TabelaPrecoProduto
  WHERE codigoTabelaPreco  = ?
    AND (${condicoesBusca})
    ${condicionalExtra ? `AND ${condicionalExtra}` : ""}
  ORDER BY codigo;
`;

export const queryBuscarTabelaPrecoPaginado = (condicionalExtra = "") => `
  SELECT * FROM TabelaPrecoProduto
  WHERE codigoTabelaPreco  = ?
  ${condicionalExtra ? `AND ${condicionalExtra}` : ""}
  ORDER BY codigo ASC
  LIMIT ? OFFSET ?;
`;
