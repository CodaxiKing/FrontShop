/**
 * Path: src/repositories/FiltroRepository.ts
 * Propósito: leitura de OPÇÕES para filtros (DISTINCT/json_each/bandejas).
 * Padrão: todos os getters retornam Option[] { value, label } e aceitam (kind, ctx).
 */
import { executeQuery } from "@/services/dbService";

// Marca
import { queryMarcaOptionsCatalogo } from "@/database/queries/filtros/marcaQueriesCatalogo";
import { queryMarcaOptionsTabelaPreco } from "@/database/queries/filtros/marcaQueriesTabelaPreco";

// Linha
import { queryLinhaOptionsCatalogo } from "@/database/queries/filtros/linhaQueriesCatalogo";
import { queryLinhaOptionsTabela } from "@/database/queries/filtros/linhaQueriesTabelaPreco";

// Subgrupo
import { querySubgrupoOptionsCatalogo } from "@/database/queries/filtros/subgrupoQueriesCatalogo";
import { querySubgrupoOptionsTabelaPreco } from "@/database/queries/filtros/subgrupoQueriesTabelaPreco";

// Bandeja (padronizado)
import { queryBandejaOptions } from "@/database/queries/filtros/bandejaOpcoes";
import { queryBandejaOptionsByRep } from "@/database/queries/filtros/bandejaOpcoesPorRepresentante";

// (opcional) Grupo — se/quando for habilitar, seguirá o mesmo padrão
import { queryGrupoOpcoesCatalogo } from "@/database/queries/filtros/grupoQueriesCatalogo";
import { queryGrupoOpcoesTabelaPreco } from "@/database/queries/filtros/grupoQueriesTabelaPreco";
import { queryMaterialCaixaOptionsCatalogo, queryMaterialCaixaOptionsTabelaPreco } from "@/database/queries/filtros/advanced/materialCaixaQueries";
import { queryTamanhoPulseiraOptionsCatalogo, queryTamanhoPulseiraOptionsTabelaPreco } from "@/database/queries/filtros/advanced/tamanhoPulseiraQueries";
import { queryCorPulseiraOptionsCatalogo, queryCorPulseiraOptionsTabelaPreco } from "@/database/queries/filtros/advanced/corPulseiraQueries";
import { queryMaterialPulseiraOptionsCatalogo, queryMaterialPulseiraOptionsTabelaPreco } from "@/database/queries/filtros/advanced/materialPulseiraQueries";
import { queryDisplayOptionsCatalogo, queryDisplayOptionsTabelaPreco } from "@/database/queries/filtros/advanced/displayQueries";
import { queryCorMostradorOptionsCatalogo, queryCorMostradorOptionsTabelaPreco } from "@/database/queries/filtros/advanced/corMostradorQueries";
import { queryFuncaoMecanismoOptionsCatalogo, queryFuncaoMecanismoOptionsTabelaPreco } from "@/database/queries/filtros/advanced/funcaoMecanismoQueries";

export type Option = { value: string; label: string };
export type Kind = "catalogo" | "tabela";
export type RepoCtx = { tabelaPreco?: string; representanteId?: string };


export const FiltroRepository = {
  
  async getMarcaOptions(kind: Kind, ctx: RepoCtx): Promise<Option[]> {
    if (kind === "catalogo") {
      const rows = await executeQuery(queryMarcaOptionsCatalogo, []);
      return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
    }
    const tabela = String(ctx?.tabelaPreco ?? "");
    const rows = await executeQuery(queryMarcaOptionsTabelaPreco, [tabela]);
    return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
  },

  async getLinhaOptions(kind: Kind, ctx: RepoCtx): Promise<Option[]> {
    if (kind === "catalogo") {
      const rows = await executeQuery(queryLinhaOptionsCatalogo, []);
      return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
    }
    const tabela = String(ctx?.tabelaPreco ?? "");
    const rows = await executeQuery(queryLinhaOptionsTabela, [tabela]);
    return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
  },

  async getSubgrupoOptions(kind: Kind, ctx: RepoCtx): Promise<Option[]> {
    if (kind === "catalogo") {
      const rows = await executeQuery(querySubgrupoOptionsCatalogo, []);
      return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
    }
    const tabela = String(ctx?.tabelaPreco ?? "");
    const rows = await executeQuery(querySubgrupoOptionsTabelaPreco, [tabela]);
    return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
  },

  // Bandeja padronizado (mesma assinatura/shape dos demais)
  async getBandejaOptions(_kind: Kind, ctx: RepoCtx): Promise<Option[]> {
    const rep = String(ctx?.representanteId ?? "").trim();
    const rows = rep
      ? await executeQuery(queryBandejaOptionsByRep, [rep])
      : await executeQuery(queryBandejaOptions, []);
    return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
  },

  // Grupo padronizado
  async getGrupoOptions(kind: Kind, ctx: RepoCtx): Promise<Option[]> {
    if (kind === "catalogo") {
      const rows = await executeQuery(queryGrupoOpcoesCatalogo, []);
      return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
    }
    const tabela = String(ctx?.tabelaPreco ?? "");
    const rows = await executeQuery(queryGrupoOpcoesTabelaPreco, [tabela]);
    return rows.map((r: any) => ({ value: String(r.value), label: String(r.label) }));
  },


  async getAdvancedOptions(
    kind: "catalogo" | "tabela",
    campo:
      | "materialCaixa"
      | "tamanhoPulseira"
      | "corPulseira"
      | "materialPulseira"
      | "display"
      | "corMostrador"
      | "funcaoMecanismo",
    ctx: { tabelaPreco?: string }
  ) {
    const map = {
      materialCaixa:   [queryMaterialCaixaOptionsCatalogo,   queryMaterialCaixaOptionsTabelaPreco],
      tamanhoPulseira: [queryTamanhoPulseiraOptionsCatalogo, queryTamanhoPulseiraOptionsTabelaPreco],
      corPulseira:     [queryCorPulseiraOptionsCatalogo,     queryCorPulseiraOptionsTabelaPreco],
      materialPulseira:[queryMaterialPulseiraOptionsCatalogo,queryMaterialPulseiraOptionsTabelaPreco],
      display:         [queryDisplayOptionsCatalogo,         queryDisplayOptionsTabelaPreco],
      corMostrador:    [queryCorMostradorOptionsCatalogo,    queryCorMostradorOptionsTabelaPreco],
      funcaoMecanismo: [queryFuncaoMecanismoOptionsCatalogo, queryFuncaoMecanismoOptionsTabelaPreco],
    } as const;

    const [qCat, qTab] = map[campo];
    const rows =
      kind === "catalogo"
        ? await executeQuery(qCat, [])
        : await executeQuery(qTab, [String(ctx?.tabelaPreco ?? "")]);

    return rows.map((r: any) => ({
      value: String(r.label),
      label: String(r.label),
    }));
  },  


};
