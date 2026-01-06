import { executeQuery } from "@/services/dbService";
import {
  queryBuscarCatalogoPaginado,
  queryBuscarCatalogoPorTermo,
  querySelectCodigoEImagens,
  queryCountCatalogo,
} from "@/database/queries/catalogoQueries";
import {
  queryBuscarTabelaPrecoPorTermo,
  queryBuscarTabelaPrecoPaginado,
} from "@/database/queries/tabelaPrecoProdutoQueries";

const DEBUG_SQL = __DEV__; // habilita logs úteis em dev

function parseProduto(produto: any) {
  return {
    ...produto,
    imagens: produto?.imagens ? safeJsonArray(produto.imagens) : [],
    quantidadeEstoquePA: produto?.quantidadeEstoquePA || 0,
  };
}

function safeJsonArray(s: any) {
  try {
    const v = typeof s === "string" ? JSON.parse(s) : s;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Injeta condicionalExtra em SQL (string), antes de ORDER BY / LIMIT se existirem.
 * Se a base já tiver WHERE, usa AND; senão cria WHERE.
 */
function attachCondicionalExtra(sql: string, condicionalExtra: string): string {
  if (!condicionalExtra || !condicionalExtra.trim()) return sql;

  // ponto de inserção: antes de ORDER BY ou LIMIT; se não houver, no final
  const ORDER_RE = /\border\s+by\b[\s\S]*$/i;
  const LIMIT_RE = /\blimit\b[\s\S]*$/i;

  let insertionIdx = sql.search(ORDER_RE);
  if (insertionIdx === -1) insertionIdx = sql.search(LIMIT_RE);
  if (insertionIdx === -1) insertionIdx = sql.length;

  const head = sql.slice(0, insertionIdx);
  const tail = sql.slice(insertionIdx);

  const hasWhere = /\bwhere\b/i.test(head);
  const glue = hasWhere ? " AND " : " WHERE ";

  return `${head}${glue}(${condicionalExtra}) ${tail}`;
}

export const ProdutoRepository = {
  async listarPorPagina(
    PAGE_SIZE: number,
    page: number,
    tabelaPreco: string,
    condicionalExtra: string = ""
  ) {
    const offset = (Math.max(page, 1) - 1) * PAGE_SIZE;
    //tabelaPreco = "006";
    if (tabelaPreco === "999999") {
      // Catálogo
      let query: string;
      if (typeof (queryBuscarCatalogoPaginado as any) === "function") {
        // função deve aceitar o condicionalExtra
        query = (queryBuscarCatalogoPaginado as any)(condicionalExtra);
      } else {
        // base é string => injeta condicionalExtra
        query = attachCondicionalExtra(
          String(queryBuscarCatalogoPaginado),
          condicionalExtra
        );
      }

      // if (DEBUG_SQL) {
      //   console.log(`[SQL catálogo '${tabelaPreco}'] condicionalExtra=`, condicionalExtra);
      //   console.log(`[SQL catálogo '${tabelaPreco}'] final=`, query.replace(/\s+/g, " ").trim());
      //   console.log(`[SQL catálogo '${tabelaPreco}']=`, query);
      // }

      const result = await executeQuery(query, [PAGE_SIZE, offset]);
      return result.map(parseProduto);
    } else {
      // Tabela de preço
      let query: string;
      if (typeof (queryBuscarTabelaPrecoPaginado as any) === "function") {
        query = (queryBuscarTabelaPrecoPaginado as any)(condicionalExtra);
      } else {
        query = attachCondicionalExtra(
          String(queryBuscarTabelaPrecoPaginado),
          condicionalExtra
        );
      }

      const result = await executeQuery(query, [
        tabelaPreco,
        PAGE_SIZE,
        offset,
      ]);

      //  if (DEBUG_SQL) {
      //   console.log(`[SQL TabelaPreco '${tabelaPreco}'] condicionalExtra=`, condicionalExtra);
      //   console.log(`[SQL TabelaPreco '${tabelaPreco}'] final=`, query.replace(/\s+/g, " ").trim());
      //   console.log(`[SQL TabelaPreco '${tabelaPreco}']=`, query);
      //   //console.log(`[SQL TabelaPreco Result'${tabelaPreco}']=`, result);
      // }

      return result.map(parseProduto);
    }
  },

  async buscarPorTermoCatalogo(searchTerm: string, condicionalExtra?: string) {
    const camposBusca = [
      "codigo",
      "descricaoMarca",
      "codigoBarra",
      "codigoBarraFeiras",
      "descricaoLinha",
      "genero",
      "descricaoTipoProduto",
    ];

    const condicoesBusca = camposBusca
      .map((campo) => `UPPER(${campo}) LIKE ?`)
      .join(" OR ");

    const parametros = camposBusca.map(() => `%${searchTerm.toUpperCase()}%`);
    const query = queryBuscarCatalogoPorTermo(condicoesBusca, condicionalExtra);

    // if (DEBUG_SQL) {
    //   console.log("[SQL catálogo:buscar] condicionalExtra=", condicionalExtra);
    //   console.log(
    //     "[SQL catálogo:buscar] final=",
    //     query.replace(/\s+/g, " ").trim()
    //   );
    // }

    const result = await executeQuery(query, parametros);
    return result.map(parseProduto);
  },

  async buscarPorTermoTabelaPreco(
    codigoTabela: string,
    searchTerm: string,
    condicionalExtra?: string
  ) {
    const camposBusca = [
      "codigo",
      "descricaoMarca",
      "codigoBarra",
      "codigoBarraFeiras",
      "descricaoLinha",
      "genero",
      "descricaoTipoProduto",
    ];

    const condicoesBusca = camposBusca
      .map((campo) => `UPPER(tpp.${campo}) LIKE ?`)
      .join(" OR ");

    const parametros = [
      codigoTabela,
      ...camposBusca.map(() => `%${searchTerm.toUpperCase()}%`),
    ];

    const query = queryBuscarTabelaPrecoPorTermo(
      condicoesBusca,
      condicionalExtra
    );

    // if (DEBUG_SQL) {
    //   console.log(
    //     "[SQL tabelaPreço:buscar] condicionalExtra=",
    //     condicionalExtra
    //   );
    //   console.log(
    //     "[SQL tabelaPreço:buscar] final=",
    //     query.replace(/\s+/g, " ").trim()
    //   );
    // }

    const result = await executeQuery(query, parametros);
    return result.map(parseProduto);
  },

  /**
   * DEV: conta total (base) e total filtrado, para conferência rápida.
   */
  async debugCountFiltered(tabelaPreco: string, whereSql: string) {
    if (tabelaPreco === "999999") {
      const baseSql = `SELECT COUNT(*) AS n FROM Catalogo`;
      const withSql = whereSql?.trim()
        ? `SELECT COUNT(*) AS n FROM Catalogo WHERE (${whereSql})`
        : baseSql;

      const [baseRow] = await executeQuery(baseSql, []);
      const [withRow] = await executeQuery(withSql, []);

      const base = Number(baseRow?.n ?? 0);
      const filtered = Number(withRow?.n ?? 0);

      // console.log(
      //   `[DEBUG COUNT catálogo] base=${base} filtered=${filtered} where=(${whereSql})`
      // );
      return { base, filtered };
    } else {
      const baseSql = `SELECT COUNT(*) AS n FROM TabelaPrecoProduto WHERE codigoTabelaPreco  = ?`;
      const withSql = whereSql?.trim()
        ? `SELECT COUNT(*) AS n FROM TabelaPrecoProduto WHERE codigoTabelaPreco  = ? AND (${whereSql})`
        : baseSql;

      const [baseRow] = await executeQuery(baseSql, [tabelaPreco]);
      const [withRow] = await executeQuery(withSql, [tabelaPreco]);

      const base = Number(baseRow?.n ?? 0);
      const filtered = Number(withRow?.n ?? 0);

      // console.log(
      //   `[DEBUG COUNT tabela] tabela=${tabelaPreco} base=${base} filtered=${filtered} where=(${whereSql})`
      // );
      return { base, filtered };
    }
  },
  async debuggGetAllNotFiltered() {
    const baseSql = `SELECT * AS n FROM Catalogo`;
    const result = await executeQuery(baseSql);
    return result.map(parseProduto);
  },

  async listarCodigosEImagens() {
    // para ImageResyncService: ler do Catalogo local e repovoar ProdutoImagem
    return await executeQuery<{ codigo: string; imagens: string }>(
      querySelectCodigoEImagens,
      []
    );
  },

  async countCatalogo() {
    const r = await executeQuery<any>(queryCountCatalogo, []);
    return Number(r?.[0]?.total ?? 0);
  },
};
