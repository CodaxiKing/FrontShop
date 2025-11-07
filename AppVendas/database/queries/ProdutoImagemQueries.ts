// database/queries/ProdutoImagemQueries.ts
export class ProdutoImagemQueries {
  static readonly TABLE = "ProdutoImagem";

  static createTable(): string {
    return `
      CREATE TABLE IF NOT EXISTS ${this.TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigoProduto TEXT NOT NULL,
        ordem INTEGER NOT NULL,
        urlRemota TEXT NOT NULL,
        pathLocal TEXT NULL,
        status TEXT NOT NULL CHECK (status IN ('PENDENTE','BAIXANDO','OK','FALHA')) DEFAULT 'PENDENTE',
        updated_at INTEGER
      );
    `;
  }

  static createIndexes(): string {
    return `
      CREATE INDEX IF NOT EXISTS IDX_${this.TABLE}_Produto ON ${this.TABLE}(codigoProduto, ordem);
      CREATE INDEX IF NOT EXISTS IDX_${this.TABLE}_Status  ON ${this.TABLE}(status);
    `;
  }

  static deleteAll(): string {
    return `DELETE FROM ${this.TABLE};`;
  }

  static insertMany(count: number): string {
    const values = Array(count).fill(`(?, ?, ?, 'PENDENTE', strftime('%s','now'))`).join(", ");
    return `INSERT OR IGNORE INTO ${this.TABLE} (codigoProduto, ordem, urlRemota, status, updated_at) VALUES ${values};`;
  }

  static selectPendentes(limit: number): string {
    return `SELECT * FROM ${this.TABLE} WHERE status='PENDENTE' LIMIT ${limit};`;
  }

  static setStatus(): string {
    return `UPDATE ${this.TABLE} SET status=?, updated_at=strftime('%s','now') WHERE id=?;`;
  }

  static setPathOk(): string {
    return `UPDATE ${this.TABLE} SET pathLocal=?, status='OK', updated_at=strftime('%s','now') WHERE id=?;`;
  }

  static countAll(): string {
    return `SELECT COUNT(*) as total FROM ${this.TABLE};`;
  }

  static countOk(): string {
    return `SELECT COUNT(*) as ok FROM ${this.TABLE} WHERE status='OK';`;
  }
}

// VIEW para expor a imagem principal local (ordem=0) por produto:
export const viewProdutoImagemPrincipalLocal = `
  CREATE VIEW IF NOT EXISTS _ProdutoImagemPrincipalLocal AS
  SELECT c.codigo AS codigoProduto, i.pathLocal AS imagemLocal
    FROM Catalogo c
    LEFT JOIN ProdutoImagem i
      ON i.codigoProduto = c.codigo
     AND i.ordem = 0
     AND i.status = 'OK';
`;
