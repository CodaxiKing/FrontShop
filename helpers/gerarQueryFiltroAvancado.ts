/**
 * Gera query SQL com parâmetros a partir de filtros avançados do catálogo.
 *
 * @param filtro - Objeto com tipo e código JSON dos filtros
 * @param allSinalizadores - Lista de todos os sinalizadores disponíveis
 * @param routeParams - Parâmetros adicionais vindos da rota (ex: precoMinimo)
 * @returns Objeto contendo query SQL parcial e array de parâmetros
 */
export function gerarQueryFiltroAvancado(
  filtro: any,
  allSinalizadores: { value: string }[],
  routeParams: any
): { query: string; params: any[] } {
  let query = "";
  let params: any[] = [];

  console.log("🛠️ Filtro recebido em gerarQueryFiltroAvancado:", filtro);
  console.log("🛠️ Recebido em gerarQueryFiltroAvancado:", routeParams);

  // let filtrosMultiplo: any = {};
  // try {
  //   if (filtro.codigo && filtro.codigo.trim() !== "") {
  //     filtrosMultiplo = JSON.parse(filtro.codigo);
  //   }
  // } catch (e) {
  //   console.warn("⚠️ Erro ao processar filtros avançados:", e);
  //   return { query, params }; // retorna vazio se o parse falhar
  // }

  const filtrosMultiplo = routeParams || {};

  // Ranges numéricos
  const ranges = [
    ["precoMinimo", "precoUnitario", ">="],
    ["precoMaximo", "precoUnitario", "<="],
    ["estoqueMinimo", "quantidadeEstoquePA", ">="],
    ["estoqueMaximo", "quantidadeEstoquePA", "<="],
    ["tamanhoCaixaMinimo", "CAST(tamanhoCaixa AS INTEGER)", ">="],
    ["tamanhoCaixaMaximo", "CAST(tamanhoCaixa AS INTEGER)", "<="],
  ];

  ranges.forEach(([chave, campo, operador]) => {
    if (typeof routeParams[chave] === "number") {
      if (campo.startsWith("CAST")) {
        query += ` AND ${campo} ${operador} ?`; // <- sem p.
      } else {
        query += ` AND p.${campo} ${operador} ?`;
      }
      params.push(routeParams[chave]);
    }
  });

  // Marcas, Linhas, Subgrupos
  ["marcas", "linhas", "subGrupos"].forEach((key) => {
    console.log(`📦 Filtro múltiplo encontrado: ${key}`, filtrosMultiplo[key]);
    if (filtrosMultiplo[key]?.length > 0) {
      query += ` AND p.codigo${capitalize(
        key.slice(0, -1)
      )} IN (${filtrosMultiplo[key].map(() => "?").join(", ")})`;
      params.push(...filtrosMultiplo[key]);
    }
  });

  // Filtros de "outros" → gênero e origem
  if (filtrosMultiplo.outros?.length > 0) {
    const generos = ["MASCULINO", "FEMININO", "UNISSEX"];
    const origemImportado = ["IMPORTADO"];
    const origemNacional = ["NACIONAL"];

    const condicoes: string[] = [];

    // const filtrosGenero = filtrosMultiplo.outros.filter((v: string) =>
    //   generos.includes(v.toUpperCase())
    // );

    const filtrosGenero = filtrosMultiplo.outros.filter((v: string) =>
      generos.includes(v.toUpperCase())
    );

    if (filtrosGenero.length === 1) {
      condicoes.push(`p.Genero = ?`);
      params.push(filtrosGenero[0]);
    } else if (filtrosGenero.length > 1) {
      condicoes.push(`0 = 1`); // Nenhum produto atende a dois gêneros ao mesmo tempo
    }

    const incluirImportado = filtrosMultiplo.outros.some((v: string) =>
      origemImportado.includes(v.toUpperCase())
    );
    const incluirNacional = filtrosMultiplo.outros.some((v: string) =>
      origemNacional.includes(v.toUpperCase())
    );

    if (filtrosGenero.length > 0) {
      condicoes.push(
        `p.Genero IN (${filtrosGenero.map(() => "?").join(", ")})`
      );
      params.push(...filtrosGenero);
    }

    if (incluirImportado) {
      condicoes.push(`p.codigoOrigem IN (?, ?)`);
      params.push("000005", "000006");
    }

    if (incluirNacional) {
      condicoes.push(`p.codigoOrigem = ?`);
      params.push("000007");
    }

    if (condicoes.length > 0) {
      query += ` AND (${condicoes.join(" AND ")})`;
    }
  }

  // Sinalizadores
  if (filtrosMultiplo.sinalizadores?.length > 0) {
    const modo = (filtro.modo as "incluir" | "excluir") || "incluir";
    const selecionados = filtrosMultiplo.sinalizadores;
    const todos = allSinalizadores.map((s) => s.value);

    if (modo === "incluir") {
      const orConds = selecionados
        .map(() => `p.sinalizadores LIKE ?`)
        .join(" OR ");
      query += ` AND (${orConds})`;
      selecionados.forEach((v: string) => params.push(`%"descricao":"${v}"%`));
    } else {
      const notConds = selecionados
        .map(() => `p.sinalizadores NOT LIKE ?`)
        .join(" AND ");
      query += ` AND (${notConds})`;
      selecionados.forEach((v: string) => params.push(`%"descricao":"${v}"%`));
    }
  }

  return { query, params };
}

// Utilitário para capitalizar nomes de campos
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
