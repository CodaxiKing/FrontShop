/**
 * Path: src/database/queries/historicoComprasCacheQueries.ts
 * Propósito: SQLs para a tabela TEMP de “já comprou” (_ComprasClienteAtual)
 * Observação: usa sempre a MESMA conexão SQLite (dbService) para a TEMP persistir na sessão.
 */

// Expressões de código-base (antes da barra "/")
export const CAT_BASE_EXPR = `CASE
  WHEN instr(codigo,'/')>0 THEN substr(codigo,1,instr(codigo,'/')-1)
  ELSE codigo
END`;

// Versão parametrizada para qualquer alias/tabela de histórico
export const HIST_BASE_EXPR_FOR = (alias: string) => `CASE
  WHEN instr(${alias}.codigoProduto,'/')>0 THEN substr(${alias}.codigoProduto,1,instr(${alias}.codigoProduto,'/')-1)
  ELSE ${alias}.codigoProduto
END`;

// (mantida para compat com uso direto em HistoricoCompraCliente)
export const HIST_BASE_EXPR = `CASE
  WHEN instr(codigoProduto,'/')>0 THEN substr(codigoProduto,1,instr(codigoProduto,'/')-1)
  ELSE codigoProduto
END`;

// Criação da TEMP + índice
export const queryCreateTempCompras = `
  CREATE TEMP TABLE IF NOT EXISTS _ComprasClienteAtual (
    codigoBase TEXT PRIMARY KEY
  );
`;

export const queryCreateIndexTempCompras = `
  CREATE INDEX IF NOT EXISTS idx_tmp_compra_base ON _ComprasClienteAtual(codigoBase);
`;

// Limpar conteúdo
export const queryClearTempCompras = `DELETE FROM _ComprasClienteAtual;`;

// Popular a TEMP a partir do histórico do cliente (DEFAULT: HistoricoCompraCliente)
export const queryPopulateTempCompras = `
  INSERT OR IGNORE INTO _ComprasClienteAtual(codigoBase)
  SELECT DISTINCT ${HIST_BASE_EXPR} AS codigoBase
  FROM HistoricoCompraCliente
  WHERE codigoCliente = ?;
`;

// Detecção dinâmica da tabela de histórico disponível
export const queryDetectHistoricoTable = `
  SELECT name
  FROM sqlite_master
  WHERE type = 'table'
    AND name IN ('HistoricoCompraCliente','HistoricoCompraClienteItem')
  LIMIT 1;
`;

// Monta um populate específico para a tabela detectada
export function buildQueryPopulateTempComprasFor(tableName: string): string {
  const h = "h";
  const HIST = HIST_BASE_EXPR_FOR(h);
  return `
    INSERT OR IGNORE INTO _ComprasClienteAtual(codigoBase)
    SELECT DISTINCT ${HIST} AS codigoBase
    FROM ${tableName} ${h}
    WHERE ${h}.codigoCliente = ?;
  `;
}

export const queryListAllTempCompras = `
  SELECT codigoBase FROM _ComprasClienteAtual;
`;

// Diagnóstico (opcional)
export const queryCountTempCompras = `SELECT COUNT(*) AS n FROM _ComprasClienteAtual;`;
