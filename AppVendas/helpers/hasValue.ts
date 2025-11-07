/**
 * Verifica se a variável possui um valor válido (não é nula, vazia ou contém apenas espaços).
 * @param value - Qualquer valor que precisa ser validado.
 * @returns boolean - Retorna `true` se houver um valor válido, `false` caso contrário.
 */
export const hasValue = (value: any): boolean => {
  return typeof value === "string"
    ? value.trim().length > 0 // Remove espaços e verifica se há conteúdo
    : value !== null && value !== undefined;
};
