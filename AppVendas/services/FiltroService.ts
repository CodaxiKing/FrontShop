/**
 * Path: /services/FiltroService.ts
 * Propósito: compilar estados dos filtros (drawer/modal) em WHERE.
 * Segmentos suportados:
 *  - marca        : CÓDIGO (codigoMarca) OU NOME (descricaoMarca)
 *  - linha        : CÓDIGO (codigoLinha)
 *  - subgrupo     : CÓDIGO (codigoSubGrupo)
 *  - grupo        : CÓDIGO (codigoGrupo)
 *  - outros       :
 *      • Gênero  -> por NOME: UPPER(genero) IN ('MASCULINO','FEMININO','UNISSEX')
 *      • Origem  -> por CÓDIGO: IMPORTADO -> IN ('000005','000006'), NACIONAL -> = '000007'
 *  - sinalizadores: include/exclude via json_each(sinalizadores)
 *      • especial: "000" = JÁ COMPROU (via TEMP _ComprasClienteAtual)
 *      • especial: "111" = FAVORITO (via tabela favoritos por contexto do usuário)
 *  - bandeja      : via relação BandejaProduto (EXISTS), por CÓDIGO
 *  - avançados    : selects (materialCaixa, ...) e faixas (preço, estoque, tamanhoCaixa)
 */

export const FILTERS_EVENTS = {
  APPLIED: "filters:applied",
  CLEARED: "filters:cleared",
} as const;

export type CompileContext = {
  tabelaPreco: string;
  codigoCliente?: string | number;        // (para "já comprou")
  cpfCnpj?: string | number;              // (favoritos)
  clienteId?: string | number;            // (favoritos)
  representanteId?: string | number;      // (favoritos)
};
export type SegmentsState = Record<string, any>;

type CompiledWhere = { whereSql: string };
export type CompiledFilter = {
  catalogo: CompiledWhere;
  tabela: CompiledWhere;
  rawState?: SegmentsState;
};

// normalizador para listas de códigos
import { normalizeCodes } from "@/utils/normalizeSinalizador";

// helpers
function quoteList(values: string[]) {
  return values.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(",");
}
function andJoin(parts: string[]) {
  return parts.filter((s) => s && s.trim().length > 0).join(" AND ");
}
function pull(seg: any): any {
  return Array.isArray(seg?.values) ? seg.values : seg;
}
function splitCodesAndNames(values: string[]) {
  const codes: string[] = [];
  const names: string[] = [];
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s) continue;
    if (/^\d+$/.test(s)) codes.push(s); else names.push(s);
  }
  return { codes, names };
}
function upperList(values: string[]) {
  return values.map((v) => String(v).trim().toUpperCase()).filter((v) => v.length > 0);
}
const normalizeMulti = (val: any): string[] => normalizeCodes(val);
const inUpper = (col: string, values: string[]) =>
  values.length ? `UPPER(${col}) IN (${quoteList(values.map((v) => v.toUpperCase()))})` : "";

// helper para quotar valor único (favorito)
const q = (v: any) => `'${String(v ?? "").replace(/'/g, "''")}'`;

export class FiltroService {
  static compile(segments: SegmentsState, ctx: CompileContext): CompiledFilter {
    const parts: string[] = [];

    // --- MARCA (código OU nome) ---
    {
      const marcaValues = normalizeCodes(pull(segments?.marca));
      if (marcaValues.length > 0) {
        const { codes, names } = splitCodesAndNames(marcaValues);
        if (codes.length > 0) parts.push(`codigoMarca IN (${quoteList(codes)})`);
        if (names.length > 0) parts.push(`UPPER(descricaoMarca) IN (${quoteList(upperList(names))})`);
      }
    }

    // --- LINHA (código) ---
    {
      const linhaValues = normalizeCodes(pull(segments?.linha));
      if (linhaValues.length > 0) parts.push(`codigoLinha IN (${quoteList(linhaValues)})`);
    }

    // --- SUBGRUPO (código) ---
    {
      const subgrupoValues = normalizeCodes(pull(segments?.subgrupo));
      if (subgrupoValues.length > 0) parts.push(`codigoSubGrupo IN (${quoteList(subgrupoValues)})`);
    }

    // --- GRUPO (código) ---
    {
      const grupoValues = normalizeCodes(pull(segments?.grupo));
      if (grupoValues.length > 0) parts.push(`codigoGrupo IN (${quoteList(grupoValues)})`);
    }

    // --- OUTROS (gênero/origem) ---
    {
      const outrosValues = normalizeCodes(pull(segments?.outros));
      if (outrosValues.length > 0) {
        const set = new Set(upperList(outrosValues));
        const generosPermitidos = ["MASCULINO", "FEMININO", "UNISSEX"];
        const generos = generosPermitidos.filter((g) => set.has(g));
        if (generos.length > 0) parts.push(`UPPER(genero) IN (${quoteList(generos)})`);

        const origemCodes: string[] = [];
        if (set.has("IMPORTADO")) origemCodes.push("000005", "000006");
        if (set.has("NACIONAL")) origemCodes.push("000007");
        if (origemCodes.length > 0) parts.push(`codigoOrigem IN (${quoteList(origemCodes)})`);

        if (generos.length === 0 && origemCodes.length === 0) parts.push("1=0");
      }
    }

    // --- SINALIZADORES (com especiais "000" e "111") ---
    {
      const raw = segments?.sinalizadores;
      let rawInclude: string[] = [];
      let rawExclude: string[] = [];

      if (Array.isArray(raw)) {
        rawInclude = normalizeCodes(raw);
      } else {
        rawInclude = normalizeCodes(raw?.include);
        rawExclude = normalizeCodes(raw?.exclude);
      }

      const INCLUDE_JA_COMPROU = rawInclude.includes("000");
      const EXCLUDE_JA_COMPROU = rawExclude.includes("000");

      const INCLUDE_FAVORITO = rawInclude.includes("111");
      const EXCLUDE_FAVORITO = rawExclude.includes("111");

      // remove especiais para processar os “comuns”
      const sinInclude = rawInclude.filter((c) => c !== "000" && c !== "111");
      const sinExclude = rawExclude.filter((c) => c !== "000" && c !== "111");

      // IMPORTANTE: em SQLite, use json_extract (não existe ->> como em PostgreSQL)
      // Nota: geramos duas variantes do where: uma para catálogo (referencia direta / Catalogo)
      // e outra para tabela (usa alias 'c' para a tabela Catalogo no contexto de TabelaPreco)
      if (sinInclude.length > 0) {
        parts.push(
          `EXISTS (
            SELECT 1
            FROM json_each(Catalogo.sinalizadores)
            WHERE json_extract(json_each.value, '$.codigo') IN (${quoteList(sinInclude)})
          )`
        );


      }
      if (sinExclude.length > 0) {
        parts.push(
          `NOT EXISTS (
            SELECT 1
            FROM json_each(Catalogo.sinalizadores)
            WHERE json_extract(json_each.value, '$.codigo') IN (${quoteList(sinExclude)})
          )`
        );


      }

      // --- "JÁ COMPROU" via TEMP (000) ---
      const cliente = String(ctx?.codigoCliente ?? "").trim();
      const CAT_BASE_EXPR = `CASE WHEN instr(codigo,'/')>0 THEN substr(codigo,1,instr(codigo,'/')-1) ELSE codigo END`;

      if (INCLUDE_JA_COMPROU) {
        if (cliente) {
          parts.push(
            `EXISTS (
               SELECT 1 FROM _ComprasClienteAtual t
               WHERE t.codigoBase = ${CAT_BASE_EXPR}
             )`
          );
        } else {
          parts.push("1=0");
        }
      }
      if (EXCLUDE_JA_COMPROU && cliente) {
        parts.push(
          `NOT EXISTS (
             SELECT 1 FROM _ComprasClienteAtual t
             WHERE t.codigoBase = ${CAT_BASE_EXPR}
           )`
        );
      }

      // --- "FAVORITO" via tabela favoritos (111) ---
      // Observação: use "codigo" (sem alias) para funcionar tanto no Catálogo (FROM Catalogo c)
      // quanto na Tabela de Preço (sem alias c). Evita quebra por alias.
      // --- "FAVORITO" via tabela favoritos (111) ---
      if (INCLUDE_FAVORITO || EXCLUDE_FAVORITO) {
        const cpf  = ctx?.cpfCnpj ? String(ctx.cpfCnpj).trim() : null;
        const rep  = ctx?.representanteId ? String(ctx.representanteId).trim() : null;

        // Monta condições dinamicamente
        const conds: string[] = [];
        if (cpf) conds.push(`f.cpfCnpj = ${q(cpf)}`);        
        if (rep) conds.push(`f.representanteId = ${q(rep)}`);

        if (conds.length > 0) {
          const FAV_EXISTS = `EXISTS (
            SELECT 1 FROM favoritos f
            WHERE f.produtoId = codigo
              AND ${conds.join(" AND ")}
          )`;

          if (INCLUDE_FAVORITO) parts.push(FAV_EXISTS);
          if (EXCLUDE_FAVORITO) parts.push(`NOT ${FAV_EXISTS}`);
        } else {
          // Sem nada para casar → não retorna
          if (INCLUDE_FAVORITO) parts.push("1=0");
        }
      }
    }

    // --- BANDEJA (via BandejaProduto) ---
    {
      const codes = normalizeCodes(pull(segments?.bandeja)).filter((s) => /^\d+$/.test(s));
      if (codes.length > 0) {
        const productCodeMatch = `(bp.codigoProduto = codigo OR codigo LIKE (bp.codigoProduto || '/%'))`;
        parts.push(
          `EXISTS (
            SELECT 1
            FROM BandejaProduto bp
            WHERE ${productCodeMatch}
              AND bp.codigoBandeja IN (${quoteList(codes)})
          )`
        );
      }
    }

    // --- AVANÇADOS: selects e faixas ---
    const addUpperSelect = (segKey: string, col: string) => {
      const vals = normalizeMulti(pull(segments?.[segKey]));
      const clause = inUpper(col, vals);
      if (clause) parts.push(clause);
    };
    addUpperSelect("materialCaixa", "materialCaixa");
    addUpperSelect("tamanhoPulseira", "tamanhoPulseira");
    addUpperSelect("corPulseira", "corPulseira");
    addUpperSelect("materialPulseira", "materialPulseira");
    addUpperSelect("display", "display");
    addUpperSelect("corMostrador", "corMostrador");
    addUpperSelect("funcaoMecanismo", "funcaoMecanismo");

    // Preço
    {
      const min = Number(segments?.preco?.min);
      const max = Number(segments?.preco?.max);
      if (!Number.isNaN(min)) parts.push(`precoUnitario >= ${min}`);
      if (!Number.isNaN(max)) parts.push(`precoUnitario <= ${max}`);
    }
    // Estoque
    {
      const ESTOQUE_COL = `COALESCE(quantidadeEstoquePA, inventoryQtd, 0)`;
      const min = Number(segments?.estoque?.min);
      const max = Number(segments?.estoque?.max);
      if (!Number.isNaN(min)) parts.push(`${ESTOQUE_COL} >= ${min}`);
      if (!Number.isNaN(max)) parts.push(`${ESTOQUE_COL} <= ${max}`);
    }
    // Tamanho da caixa
    {
      const col = "tamanhoCaixaMm"; 
      const min = Number(segments?.tamanhoCaixa?.min);
      const max = Number(segments?.tamanhoCaixa?.max);
      if (!Number.isNaN(min)) parts.push(`${col} >= ${min}`);
      if (!Number.isNaN(max)) parts.push(`${col} <= ${max}`);
    }

    // ---------- FINAL ----------
    // Para evitar ambiguidade em queries que usam alias (tabelaPreco: tpp LEFT JOIN Catalogo c)
    // geramos uma variante para 'tabela' qualificada com 'c.' nos casos de sinalizadores
    const partsTabela = parts.map((p) => p.replace(/json_each\(Catalogo\.sinalizadores\)/g, 'json_each(c.sinalizadores)'));

    const whereSqlCatalogo = andJoin(parts);
    const whereSqlTabela = andJoin(partsTabela);

    console.warn("[CTX]", ctx)
    console.warn("[whereSqlCatalogo]", whereSqlCatalogo)
    console.warn("[whereSqlTabela]", whereSqlTabela)
    return { catalogo: { whereSql: whereSqlCatalogo }, tabela: { whereSql: whereSqlTabela }, rawState: segments };
  }
}
