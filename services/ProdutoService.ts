/**
 * Path: src/services/ProdutoService.ts
 * Propósito: expor listagem paginada COM filtros, reaproveitando o condicionalExtra de bloqueios.
 * Uso: só será chamado quando houver whereSql (advancedFilter) — senão continua tudo como está.
 */
import { ProdutoRepository } from "@/repositories/ProdutoRepository";
import { hasValue } from "@/helpers/hasValue";
import { BloqueioItem } from "@/context/interfaces/BloqueioItem";

export class ProdutoService {
  static gerarCondicionalBloqueio(
    bloqueios?: BloqueioItem[] | null,
    tabelaPreco?: string
  ): string {
    const list = Array.isArray(bloqueios) ? bloqueios : [];
    const condicoes: string[] = [];

    if (list.length === 0) return "";

    const codigosProduto = list
      .filter((b) => hasValue(b.codigoProduto))
      .map((b) => `'${b.codigoProduto}'`)
      .join(",");
    if (hasValue(codigosProduto)) {
      condicoes.push(`codigo NOT IN (${codigosProduto})`);
    }

    const codigosMarca = list
      .filter((b) => hasValue(b.codigoMarca))
      .map((b) => `'${b.codigoMarca}'`)
      .join(",");
    if (hasValue(codigosMarca)) {
      condicoes.push(`codigoMarca NOT IN (${codigosMarca})`);
    }

    const codigosSinalizadores = list
      .filter((b) => hasValue(b.codigoSinalizador))
      .map((b) => `'${b.codigoSinalizador}'`)
      .join(",");

    if (hasValue(codigosSinalizadores)) {
      const origemJson =
        tabelaPreco === "999999" ? "Catalogo" : "TabelaPrecoProduto";
      condicoes.push(`NOT EXISTS (
        SELECT 1
        FROM json_each(${origemJson}.sinalizadores)
        WHERE json_each.value ->> '$.codigo' IN (${codigosSinalizadores})
      )`);
    }

    return condicoes.length > 0 ? condicoes.join(" AND ") : "";
  }

  static async listarProdutosPagina(
    PAGE_SIZE: number,
    page: number,
    tabelaPreco: string,
    bloqueios?: BloqueioItem[]
  ) {
    const condicionalExtra = this.gerarCondicionalBloqueio(bloqueios, tabelaPreco);
    const data = await ProdutoRepository.listarPorPagina(
      PAGE_SIZE,
      page,
      tabelaPreco,
      condicionalExtra
    );
    return Array.isArray(data) ? data : [];
  }

  static async buscarPorTermo(
    searchTerm: string,
    tabelaPreco: string,
    bloqueios?: BloqueioItem[]
  ) {
    const condicionalExtra = this.gerarCondicionalBloqueio(bloqueios, tabelaPreco);
    const data =
      tabelaPreco === "999999"
        ? await ProdutoRepository.buscarPorTermoCatalogo(searchTerm, condicionalExtra)
        : await ProdutoRepository.buscarPorTermoTabelaPreco(
            tabelaPreco,
            searchTerm,
            condicionalExtra
          );
    return Array.isArray(data) ? data : [];
  }

  static async listarProdutosPaginaComFiltro(
    PAGE_SIZE: number,
    page: number,
    tabelaPreco: string,
    bloqueios?: BloqueioItem[],
    whereSql: string = ""
  ) {
    // reaproveita a sua regra atual:
    const condicionalExtra = this.gerarCondicionalBloqueio(bloqueios, tabelaPreco);

    // junta bloqueios + filtros do drawer (se tiver):
    const cond = [condicionalExtra, whereSql].filter(Boolean).join(" AND ");

    // NÃO muda o repositório — usa o mesmo listarPorPagina passando cond como condicionalExtra
    return await ProdutoRepository.listarPorPagina(
      PAGE_SIZE,
      page,
      tabelaPreco,
      cond
    );
  }
}
