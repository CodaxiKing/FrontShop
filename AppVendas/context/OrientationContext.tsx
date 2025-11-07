// context/OrientationContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { classifyDevice } from "@/helpers";

type Ctx = {
  isModoPaisagem: boolean;
  deviceType: string;
  width: number;
  height: number;
  numColumns: number;
  cardWidth: number;
};

const OrientationContext = createContext<Ctx>({
  isModoPaisagem: false,
  deviceType: "",
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
  numColumns: 3,
  cardWidth: Math.floor(Dimensions.get("window").width / 3),
});

type Props = React.PropsWithChildren<{
  minCardWidth?: number; // ex.: 240
  gutter?: number;       // ex.: 12
  maxColumns?: number;   // ex.: 6
  minColumns?: number;   // ex.: 1
}>;

export const OrientationProvider: React.FC<Props> = ({
  children,
  minCardWidth = 240,
  gutter = 12,
  maxColumns = 6,
  minColumns = 4,
}) => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });
  const [isModoPaisagem, setIsModoPaisagem] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return width > height;
  });
  const [deviceType, setDeviceType] = useState(classifyDevice());

  useEffect(() => {
    const update = () => {
      const { width, height } = Dimensions.get("window");
      setIsModoPaisagem(width > height);
      setDeviceType(classifyDevice());
      setDimensions({ width, height });
    };
    update();
    const subscription = Dimensions.addEventListener("change", update);
    return () => subscription?.remove?.();
  }, []);

  // calcula numColumns/cardWidth de forma fluida
  const { numColumns, cardWidth } = useMemo(() => {
    const availableWidth = dimensions.width;
    if (!availableWidth || availableWidth <= 0) {
      return { numColumns: minColumns, cardWidth: availableWidth || 0 };
    }
    const cols = Math.floor((availableWidth + gutter) / (minCardWidth + gutter));
    const clamped = Math.max(minColumns, Math.min(maxColumns, cols || 1));
    const totalGutters = gutter * (clamped - 1);
    const w = Math.floor((availableWidth - totalGutters) / clamped);
    return { numColumns: clamped, cardWidth: w };
  }, [dimensions.width, minCardWidth, gutter, maxColumns, minColumns]);

  const value: Ctx = {
    isModoPaisagem,
    deviceType,
    width: dimensions.width,
    height: dimensions.height,
    numColumns,
    cardWidth,
  };

  return (
    <OrientationContext.Provider value={value}>
      {children}
    </OrientationContext.Provider>
  );
};

export const useOrientation = () => useContext(OrientationContext);
