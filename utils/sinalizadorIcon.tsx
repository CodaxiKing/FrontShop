// utils/sinalizadorIcon.tsx
import React from "react";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";



export type IconKey =
  | "star"
  | "trophy"
  | "gift"
  | "new"
  | "calendar"
  | "return"
  | "cart"
  | "info";

export function iconFromKey(raw: string, size = 27, color?: string) {
  const key = String(raw ?? "").trim() as IconKey;
  const s = size;
  switch (key) {
    case "trophy":
      return <Entypo name="trophy" size={s} color={color ?? "orange"} />;
    case "gift":
      return <AntDesign name="gift" size={s} color={color ?? "#BA55D3"} />;
    case "star":
      return <AntDesign name="star" size={s} color={color ?? "#F2EB46"} />;
    case "new":
      return (
        <MaterialIcons
          name="new-releases"
          size={s}
          color={color ?? "#00A3D9"}
        />
      );
    case "calendar":
      return (
        <MaterialIcons name="calendar-month" size={s} color={color ?? "#DC143C"} />
      );
    case "return":
      return (
        <Entypo
          name="back-in-time"
          size={s}
          color={color ?? "#8C0000"}
        />
      );
    case "cart":      
     return <AntDesign name="pushpin" size={s} color={color ?? "#87CEEB"} />;
    case "info":      
      return <AntDesign name="infocirlce" size={s} color={color ?? "#000000"} />;
    default:
      // mantém o mesmo nome que você já usava
      return <AntDesign name="questioncirlce" size={s} color={color ?? "#000000"} />;
  }
}

export const SINALIZADORES_OPCOES = [
  { codigo: "000", label: "Ja Comprou" },
  { codigo: "001", label: "Campeões" },
  { codigo: "002", label: "Com kit" },
  { codigo: "003", label: "Lançamentos" },
  { codigo: "004", label: "Pré-venda" },  
  { codigo: "005", label: "Retorno" },  
];

export const ICON_LABELS: Record<IconKey, string> = {
  star: "Favorito",
  trophy: "Campeões",
  gift: "Com Kit",
  new: "Lançamentos",
  calendar: "Pre Venda",
  return: "Retorno",
  cart: "Ja Comprou",
  info: "Info",
};

export const DEFAULT_LEGEND: { key: IconKey; label: string }[] = [
  { key: "star", label: ICON_LABELS.star },  
  { key: "trophy", label: ICON_LABELS.trophy },
  { key: "gift", label: ICON_LABELS.gift },
  { key: "new", label: ICON_LABELS.new },
  { key: "calendar", label: ICON_LABELS.calendar },
  { key: "return", label: ICON_LABELS.return },
  { key: "cart", label: ICON_LABELS.cart },
  //{ key: "info", label: ICON_LABELS.info },
  
];
