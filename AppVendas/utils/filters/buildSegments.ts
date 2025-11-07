// src/utils/filters/buildSegments.ts
import { normalizeCodes } from "@/utils/normalizeSinalizador";
import { FiltroService, FILTERS_EVENTS, type CompileContext, type SegmentsState } from "@/services/FiltroService";
import { eventBus } from "@/core/eventBus";

type ApplyArgs = {
  ui: {
    marca: string[];
    linha: string[];
    subgrupo: string[];
    outros: string[];
    bandeja: string[];
    sinalizadoresMode: "include" | "exclude";
    sinalizadores: string[];
    // (quando ligar avançados, só plugar aqui)
    // materialCaixa?: string[]; ...
    // preco?: {min?: number; max?: number};
    // estoque?: {min?: number; max?: number};
    // tamanhoCaixa?: {min?: number; max?: number};
  };
  ctx: CompileContext; // { tabelaPreco, codigoCliente? }
};

export function applyFiltersFromUI({ ui, ctx }: ApplyArgs) {
  const segments: SegmentsState = {};

  const marca    = normalizeCodes(ui.marca);
  const linha    = normalizeCodes(ui.linha);
  const subgrupo = normalizeCodes(ui.subgrupo);
  const outros   = normalizeCodes(ui.outros);
  const bandeja  = normalizeCodes(ui.bandeja);
  const sins     = normalizeCodes(ui.sinalizadores);

  if (marca.length)    segments.marca    = { values: marca };
  if (linha.length)    segments.linha    = { values: linha };
  if (subgrupo.length) segments.subgrupo = { values: subgrupo };
  if (outros.length)   segments.outros   = { values: outros };
  if (bandeja.length)  segments.bandeja  = { values: bandeja };

  if (sins.length) {
    segments.sinalizadores =
      ui.sinalizadoresMode === "exclude" ? { exclude: sins } : { include: sins };
  }

  const compiled = FiltroService.compile(segments, ctx);
  eventBus.emit(FILTERS_EVENTS.APPLIED, compiled);
}

export function clearFilters() {
  eventBus.emit(FILTERS_EVENTS.CLEARED);
}
