// database/queries/catalogoQueries.ts

// Lista paginada do catálogo + caminho local da imagem principal (se já baixada)
export const queryBuscarCatalogoPaginado = `
  SELECT c.*, v.imagemLocal
    FROM Catalogo c
    LEFT JOIN _ProdutoImagemPrincipalLocal v
      ON v.codigoProduto = c.codigo
   ORDER BY c.codigo ASC
   LIMIT ? OFFSET ?;
`;

// Busca por termo + caminho local da imagem principal
export const queryBuscarCatalogoPorTermo = (condicoesBusca: string, condicionalExtra?: string) => `
  SELECT c.*, v.imagemLocal
    FROM Catalogo c
    LEFT JOIN _ProdutoImagemPrincipalLocal v
      ON v.codigoProduto = c.codigo
   WHERE (${condicoesBusca})
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
