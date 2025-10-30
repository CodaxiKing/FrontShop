export const queryBuscarTabelaPrecoPorTermo = (condicoesBusca: string, condicionalExtra?: string) => `
  SELECT tpp.*, v.imagemLocal, c.imagens
    FROM TabelaPrecoProduto tpp
    LEFT JOIN _ProdutoImagemPrincipalLocal v
           ON v.codigoProduto = tpp.codigo
    LEFT JOIN Catalogo c
           ON c.codigo = tpp.codigo
   WHERE tpp.codigoTabelaPreco = ?
     AND (${condicoesBusca})
     ${condicionalExtra ? `AND ${condicionalExtra}` : ""}
   ORDER BY tpp.codigo;
`;


// Inclui imagemLocal (da VIEW) e imagens (do Catalogo) para manter o mesmo contrato visual dos cards
export const queryBuscarTabelaPrecoPaginado = (condicionalExtra = "") => `
  SELECT tpp.*, v.imagemLocal, c.imagens
    FROM TabelaPrecoProduto tpp
    LEFT JOIN _ProdutoImagemPrincipalLocal v
           ON v.codigoProduto = tpp.codigo
    LEFT JOIN Catalogo c
           ON c.codigo = tpp.codigo
   WHERE tpp.codigoTabelaPreco = ?
     ${condicionalExtra ? `AND ${condicionalExtra}` : ""}
   ORDER BY tpp.codigo ASC
   LIMIT ? OFFSET ?;
`;
