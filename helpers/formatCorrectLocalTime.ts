import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Pegando a data UTC
const utcDate = new Date();
const timeZone = "America/Sao_Paulo"; // Define o fuso correto
const localDate = toZonedTime(utcDate, timeZone);

// Formata a data no formato do SQLite
export const formatCorrectLocalTime = format(localDate, "yyyy-MM-dd HH:mm:ss");
