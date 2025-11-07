import { FiltroAtivo } from "@/context/interfaces/CatalogoItem";

export function getFiltroAtivoFromRouteParams(params: any): FiltroAtivo | null {
  if (!params?.filtroTipo) return null;

  // Filtro por sinalizadores
  if (params.filtroTipo === "sinalizadores" && params.filtroSinalizadores) {
    try {
      const sinalizadoresSelecionados = JSON.parse(params.filtroSinalizadores);
      const modoSinalizador =
        (params.modoSinalizadores as "incluir" | "excluir") || "incluir";

      if (
        Array.isArray(sinalizadoresSelecionados) &&
        sinalizadoresSelecionados.length > 0
      ) {
        const prefixo =
          modoSinalizador === "excluir" ? "Excluindo" : "Incluindo";
        const descricao = sinalizadoresSelecionados.join(", ");
        return {
          tipo: "sinalizadores",
          codigo: params.filtroSinalizadores,
          nome: `${prefixo} sinalizadores: ${descricao}`,
          modo: modoSinalizador,
        };
      }
    } catch (error) {
      console.error("Erro ao processar filtro de sinalizadores:", error);
      return null;
    }
  }

  // Filtros simples com filtroCodigo e filtroNome
  if (params.filtroCodigo && params.filtroNome) {
    return {
      tipo: params.filtroTipo,
      codigo: params.filtroCodigo,
      nome: params.filtroNome.replace(/_/g, " "),
    };
  }

  // Filtros Avançados por campos diretos
  if (
    params.filtroTipo === "filtrosAvancados" &&
    params.precoMinimo !== undefined
  ) {
    const {
      materialCaixa,
      tamanhoPulseira,
      corPulseira,
      materialPulseira,
      display,
      corMostrador,
      funcaoMecanismo,
      precoMinimo,
      precoMaximo,
      estoqueMinimo,
      estoqueMaximo,
      tamanhoCaixaMinimo,
      tamanhoCaixaMaximo,
    } = params;

    const partes: string[] = [];

    if (materialCaixa) partes.push(`Caixa: ${materialCaixa}`);
    if (tamanhoPulseira) partes.push(`Pulseira: ${tamanhoPulseira}`);
    if (corPulseira) partes.push(`Cor Pulseira: ${corPulseira}`);
    if (materialPulseira) partes.push(`Mat. Pulseira: ${materialPulseira}`);
    if (display) partes.push(`Display: ${display}`);
    if (corMostrador) partes.push(`Cor Mostrador: ${corMostrador}`);
    if (funcaoMecanismo) partes.push(`Função: ${funcaoMecanismo}`);
    if (precoMinimo || precoMaximo)
      partes.push(`Preço: R$${precoMinimo} à R$${precoMaximo}`);
    if (estoqueMinimo || estoqueMaximo)
      partes.push(`Estoque: ${estoqueMinimo}un à ${estoqueMaximo}un`);
    if (tamanhoCaixaMinimo || tamanhoCaixaMaximo)
      partes.push(
        `Tamanho Caixa: ${tamanhoCaixaMinimo}cm à ${tamanhoCaixaMaximo}cm`
      );

    return {
      tipo: "filtrosAvancados",
      codigo: "",
      nome: `Filtro Avançado: ${partes.join("; ")}`,
    };
  }

  // Filtros Avançados com estrutura filtros/filtrosNome
  if (
    params.filtroTipo === "filtrosAvancados" &&
    params.filtros &&
    params.precoMinimo === undefined
  ) {
    const filtros = params.filtros;
    const nomes = params.filtrosNome || {};
    const partes: string[] = [];

    if (nomes.sinalizadores?.length) {
      const modo =
        filtros.modoSinalizadores === "excluir" ? "Excluindo" : "Incluindo";
      partes.push(`${modo} sinalizadores: ${nomes.sinalizadores.join(", ")}`);
    }

    if (nomes.outros?.length) partes.push(`Outros: ${nomes.outros.join(", ")}`);
    if (nomes.marcas?.length) partes.push(`Marcas: ${nomes.marcas.join(", ")}`);
    if (nomes.subGrupos?.length)
      partes.push(`Subgrupos: ${nomes.subGrupos.join(", ")}`);
    if (nomes.linhas?.length) partes.push(`Linhas: ${nomes.linhas.join(", ")}`);

    if (
      filtros.precoMinimo !== undefined &&
      filtros.precoMaximo !== undefined
    ) {
      partes.push(`Preço: R$${filtros.precoMinimo} à R$${filtros.precoMaximo}`);
    }

    if (
      filtros.estoqueMinimo !== undefined &&
      filtros.estoqueMaximo !== undefined
    ) {
      partes.push(
        `Estoque: ${filtros.estoqueMinimo}un à ${filtros.estoqueMaximo}un`
      );
    }

    if (
      filtros.tamanhoCaixaMinimo !== undefined &&
      filtros.tamanhoCaixaMaximo !== undefined
    ) {
      partes.push(
        `Tamanho Caixa: ${filtros.tamanhoCaixaMinimo}cm à ${filtros.tamanhoCaixaMaximo}cm`
      );
    }

    if (filtros.materialCaixa)
      partes.push(`Material Caixa: ${filtros.materialCaixa}`);
    if (filtros.tamanhoPulseira)
      partes.push(`Tamanho Pulseira: ${filtros.tamanhoPulseira}`);
    if (filtros.corPulseira)
      partes.push(`Cor Pulseira: ${filtros.corPulseira}`);
    if (filtros.materialPulseira)
      partes.push(`Material Pulseira: ${filtros.materialPulseira}`);
    if (filtros.display) partes.push(`Display: ${filtros.display}`);
    if (filtros.corMostrador)
      partes.push(`Cor Mostrador: ${filtros.corMostrador}`);
    if (filtros.funcaoMecanismo)
      partes.push(`Função: ${filtros.funcaoMecanismo}`);
    if (filtros.tamanhoCaixa)
      partes.push(`Tamanho Caixa (fixo): ${filtros.tamanhoCaixa}`);

    return {
      tipo: "filtrosAvancados",
      codigo: JSON.stringify(filtros),
      nome: `Avançado: ${partes.join("; ")}`,
      modo: filtros.modoSinalizadores,
    };
  }

  // Busca geral
  if (params.filtroTipo === "buscaGeral" && params.filtroNome) {
    return {
      tipo: "buscaGeral",
      codigo: "",
      nome: params.filtroNome,
    };
  }

  return null;
}
