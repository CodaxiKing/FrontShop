//  Lista paginada do catálogo com filtro de estoque + caminho local da imagem principal
export const queryBuscarCatalogoPaginado = `
  SELECT c.*, v.imagemLocal
    FROM Catalogo c
    LEFT JOIN _ProdutoImagemPrincipalLocal v
      ON v.codigoProduto = c.codigo
   WHERE c.quantidadeEstoquePA > 0
   ORDER BY c.codigo ASC
   LIMIT ? OFFSET ?;
`;

// Busca por termo com filtro de estoque + caminho local da imagem principal
export const queryBuscarCatalogoPorTermo = (condicoesBusca: string, condicionalExtra?: string) => `
  SELECT c.*, v.imagemLocal
    FROM Catalogo c
    LEFT JOIN _ProdutoImagemPrincipalLocal v
      ON v.codigoProduto = c.codigo
   WHERE c.quantidadeEstoquePA > 0 AND (${condicoesBusca})
   ${condicionalExtra ? `AND ${condicionalExtra}` : ""}
   ORDER BY c.codigo;
`;

// ➕ Auxiliares para "recarregar só imagens" sem reler a API
export const querySelectCodigoEImagens = `
  SELECT codigo, imagens
    FROM Catalogo
   ORDER BY codigo ASC;
`;

export const queryCountCatalogo = `
  SELECT COUNT(*) AS total FROM Catalogo;
`;
