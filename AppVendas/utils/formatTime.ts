// src/utils/formatTime.ts
export function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

interface FormatDateTime {
  (dataHora: string): string;
}

export const formatarDataManual: FormatDateTime = (dataHora) => {
  if (!dataHora) return "N/A";

  const [data, hora] = dataHora.split(" ");
  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano} - ${hora}`;
};
