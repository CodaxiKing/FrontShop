import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Classificação dos dispositivos com base na largura
export const classifyDevice = ():
  | "smallTablet"
  | "mediumTablet"
  | "largeTablet" => {
  if (width <= 700) return "smallTablet";
  if (width > 700 && width <= 900) return "mediumTablet";
  if (width > 900) return "largeTablet";
  return "smallTablet";
};

export const getIconSize = (width: number, isModoPaisagem: boolean) => {
  if (isModoPaisagem && width >= 1400) return 70; // Ícones maiores para tablets grandes
  if (isModoPaisagem && width >= 1200) return 60; // Ícones maiores para tablets grandes
  if (isModoPaisagem && width >= 800) return 42; // Ícones médios para tablets médios
  return 42; // Tamanho padrão para outros dispositivos
};

export const getCartIconSize = (width: number, isModoPaisagem: boolean) => {
  if (isModoPaisagem && width >= 1400) return 50; // Ícones maiores para tablets grandes
  if (isModoPaisagem && width >= 1200) return 42; // Ícones maiores para tablets grandes
  if (isModoPaisagem && width >= 800) return 32; // Ícones médios para tablets médios
  return 32; // Tamanho padrão para outros dispositivos
};

export const formatCurrency = (value: number) => {
  if (typeof value !== "number" || isNaN(value)) {
    return "R$ 0,00";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatDateToBR = (dateString: string | null | undefined) => {
  if (!dateString || typeof dateString !== "string") {
    return "Data inválida";
  }

  try {
    let dateParts: string[], timeParts: string[];

    // Caso 1: Formato "YYYY-MM-DD HH:mm:ss" ou ISO
    if (dateString.includes("-")) {
      const [date, time] =
        dateString.split("T").length > 1
          ? dateString.split("T") // ISO 8601 ex: "2025-04-10T18:49:26.549Z"
          : dateString.split(" "); // Formato "YYYY-MM-DD HH:mm:ss"

      dateParts = date.split("-");
      timeParts = (time || "").split(":");
      const [year, month, day] = dateParts;
      const [hours = "00", minutes = "00"] = timeParts;

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    // Caso 2: Formato "DD/MM/YYYY HH:mm:ss"
    if (dateString.includes("/")) {
      const [date, time] = dateString.split(" ");
      dateParts = date.split("/");
      timeParts = (time || "").split(":");
      const [day, month, year] = dateParts;
      const [hours = "00", minutes = "00"] = timeParts;

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    return "Data inválida";
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

enum PedidoStatus {
  EM_ABERTO = "Em Aberto",
  SINCRONIZADO = "Sincronizado",
  PRE_VENDA = "Pré-Venda",
}

export const getPedidoStatusLabel = (status: number | string): string => {
  const statusNumber = Number(status);
  switch (statusNumber) {
    case 1:
      return PedidoStatus.EM_ABERTO;

    case 2:
      return PedidoStatus.SINCRONIZADO;

    case 3:
      return PedidoStatus.PRE_VENDA;

    default:
      return "Desconhecido";
  }
};
