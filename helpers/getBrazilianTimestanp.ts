export const getBrazilianTimestamp = () => {
  const now = new Date();
  const offset = -3; // Fuso horário de Brasília (UTC-3)
  now.setHours(now.getHours() + offset); // Ajusta para o fuso horário do Brasil
  return now.toISOString().replace("T", " ").split(".")[0]; // Formato YYYY-MM-DD HH:MM:SS
};
