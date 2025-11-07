// Lê apenas o que precisamos do Catalogo para repovoar ProdutoImagem
export class CatalogoAuxQueries {
  static readonly TABLE = "Catalogo";

  // Seleciona todos os produtos com o JSON de imagens já salvo localmente
  static selectCodigoEImagens(): string {
    return `
      SELECT codigo, imagens
        FROM ${this.TABLE}
       ORDER BY codigo ASC
    `;
  }

  // Opcional: contar quantos produtos existem (para validação dependência)
  static countAll(): string {
    return `SELECT COUNT(*) AS total FROM ${this.TABLE}`;
  }
}
