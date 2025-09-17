/**
 * Formata uma data do tipo Date para o padrão "DD/MM/YYYY HH:mm:ss"
 * @param data A data a ser formatada
 * @returns A string da data formatada
 */
export const formatarDataParaExibicao = (data: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dia = pad(data.getDate());
  const mes = pad(data.getMonth() + 1);
  const ano = data.getFullYear();
  const hora = pad(data.getHours());
  const minuto = pad(data.getMinutes());
  const segundo = pad(data.getSeconds());
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  // return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
};

/**
 * Converte uma string no formato "DD/MM/YYYY, HH:mm:ss" em um objeto Date
 * @param str A string da data a ser convertida
 * @returns Objeto Date correspondente ou data mínima em caso de erro
 */
export const parseDate = (str: string): Date => {
  if (!str) return new Date(0); // evita crash
  const [datePart, timePart] = str.split(", ");
  if (!datePart || !timePart) return new Date(0);
  const [day, month, year] = datePart.split("/");
  const pad = (s: string) => s.padStart(2, "0");
  return new Date(`${year}-${pad(month)}-${pad(day)}T${timePart}`);
};
