/**
 * Gera uma chave curta e determinística para strings longas.
 * - FNV-1a 32-bit -> base36 (~7-8 chars)
 * - Seguro o suficiente para uso como "key" de remount.
 */
export function makeShortKey(input?: string) {
  const s = String(input ?? "");
  if (!s) return "nofilter";
  let h = 0x811c9dc5; // offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV_prime
  }
  // base36 deixa mais compacto que hex
  return (h >>> 0).toString(36); // ex: "k3w9p1d"
}
