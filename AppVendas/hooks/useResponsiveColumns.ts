// hooks/useResponsiveColumns.ts
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";

interface Options {
  minCardWidth?: number; // largura mínima do card
  gutter?: number;       // espaço horizontal entre cards
  maxColumns?: number;   // limite superior
  minColumns?: number;   // limite inferior
}

export function useResponsiveColumns(opts: Options = {}): number {
  const {
    minCardWidth = 240,
    gutter = 12,
    maxColumns = 6,
    minColumns = 4,
  } = opts;

  const { width } = useWindowDimensions();

  const computed = useMemo(() => {
    if (!width || width <= 0) return minColumns;

    // espaço útil considerando gutters entre colunas
    // regra simples: quantas vezes (minCardWidth + gutter) cabem na largura
    const cols = Math.floor((width + gutter) / (minCardWidth + gutter));
    const clamped = Math.max(minColumns, Math.min(maxColumns, cols || 1));
    return clamped;
  }, [width, minCardWidth, gutter, maxColumns, minColumns]);

  const [numColumns, setNumColumns] = useState(computed);

  useEffect(() => {
    setNumColumns((prev) => (prev !== computed ? computed : prev));
  }, [computed]);

  return numColumns;
}
