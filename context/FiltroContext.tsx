import React, { createContext, useState, useContext } from "react";

interface FiltroContextType {
  limparFiltrosSidebar: boolean;
  limparFiltrosCatalogo: boolean;
  acionarLimparFiltrosSidebar: () => void;
  resetarLimparFiltrosSidebar: () => void;
  acionarLimparFiltrosCatalogo: () => void;
  resetarLimparFiltrosCatalogo: () => void;
}

const FiltroContext = createContext<FiltroContextType | undefined>(undefined);

export const FiltroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [limparFiltrosSidebar, setLimparFiltrosSidebar] = useState(false);
  const [limparFiltrosCatalogo, setLimparFiltrosCatalogo] = useState(false);

  const acionarLimparFiltrosSidebar = () => setLimparFiltrosSidebar(true);
  const resetarLimparFiltrosSidebar = () => setLimparFiltrosSidebar(false);

  const acionarLimparFiltrosCatalogo = () => setLimparFiltrosCatalogo(true);
  const resetarLimparFiltrosCatalogo = () => setLimparFiltrosCatalogo(false);

  return (
    <FiltroContext.Provider
      value={{
        limparFiltrosSidebar,
        limparFiltrosCatalogo,
        acionarLimparFiltrosSidebar,
        resetarLimparFiltrosSidebar,
        acionarLimparFiltrosCatalogo,
        resetarLimparFiltrosCatalogo,
      }}
    >
      {children}
    </FiltroContext.Provider>
  );
};

export const useFiltroContext = () => {
  const context = useContext(FiltroContext);
  if (!context)
    throw new Error("useFiltroContext must be used within FiltroProvider");
  return context;
};
