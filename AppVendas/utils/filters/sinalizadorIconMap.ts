/**
 * Path: src/utils/filters/sinalizadorIconMap.ts
 * Propósito: adaptar chamada para o padrão repository.
 * Observação: mantido para não quebrar imports existentes.
 */

import { SinalizadorRepository } from "@/repositories/SinalizadorRepository";
import type { IconKey } from "@/utils/sinalizadorIcon";

export async function fetchIconToCodesMap(): Promise<Partial<Record<IconKey, string[]>>> {
  return SinalizadorRepository.fetchIconToCodesMap();
}
