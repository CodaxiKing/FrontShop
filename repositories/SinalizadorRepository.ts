/**
 * Path: src/repositories/SinalizadorRepository.ts
 * Propósito: encapsular lógica de leitura e normalização de sinalizadores.
 */

import { executeQuery } from "@/services/dbService";
import { queryListDistinctSinalizadorCodDesc } from "@/database/queries/sinalizadorIconQueries";
import { DEFAULT_LEGEND, IconKey } from "@/utils/sinalizadorIcon";

// normaliza texto p/ casar labels independente de acentos/caixa/espaços
const norm = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

type Row = { codigo: string | null; descricao: string | null };

export const SinalizadorRepository = {
  /**
   * Mapeia cada ícone (IconKey) -> lista de códigos de sinalizador.
   * Usa os labels do DEFAULT_LEGEND para correlacionar com as descrições do banco.
   * Garante incluir o pseudo-sinalizador "000" (JÁ COMPROU) no ícone correspondente.
   */
  async fetchIconToCodesMap(): Promise<Partial<Record<IconKey, string[]>>> {
    const rows = (await executeQuery(queryListDistinctSinalizadorCodDesc, [])) as Row[];

    // descricao (normalizada) -> Set(códigos)
    const byDesc = new Map<string, Set<string>>();
    for (const r of rows) {
      const desc = norm(r.descricao ?? "");
      const cod = String(r.codigo ?? "").trim();
      if (!desc || !cod) continue;
      const set = byDesc.get(desc) ?? new Set<string>();
      set.add(cod);
      //console.warn(`desc [${desc}], codes [${cod}]`)
      byDesc.set(desc, set);
    }

    // monta IconKey -> códigos usando os labels do DEFAULT_LEGEND
    const out: Partial<Record<IconKey, string[]>> = {};
    for (const item of DEFAULT_LEGEND) {
      const labelN = norm(item.label);
      const codes = byDesc.get(labelN);
      //console.warn(`codes [${labelN}]`)
      if (codes && codes.size > 0) {
        out[item.key] = Array.from(codes);
      }
    }

    // garante o pseudo-sinalizador "JÁ COMPROU" (código "000") no ícone correto
    // Ajuste a chave abaixo se o seu ícone para "Já comprou" NÃO for "cart".
    const JA_COMPROU_ICON_KEY: IconKey = "cart";
    out[JA_COMPROU_ICON_KEY] = Array.from(new Set([...(out[JA_COMPROU_ICON_KEY] ?? []), "000"]));

    // garante o pseudo-sinalizador "FAVORITO" (código "111") no ícone correto
    // Ajuste a chave abaixo se o ícone de favorito for outro que não "star".
    const FAVORITO_ICON_KEY: IconKey = "star";
    out[FAVORITO_ICON_KEY] = Array.from(new Set([...(out[FAVORITO_ICON_KEY] ?? []), "111"]));

    return out;
  },
};
