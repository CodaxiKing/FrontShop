import React, { createContext, useContext, useState } from "react";

export interface ParametrosContextProps {
  exibirPreVenda: boolean;
  exibirDesconto: boolean;
  pilotarReajuste: boolean;
  porcentagemReajuste: number;
  setParametros: (params: ParametrosContextProps) => void; // Método para atualizar os parâmetros
}

const ParametrosContext = createContext<ParametrosContextProps | undefined>(
  undefined
);

export const ParametrosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [exibirPreVenda, setExibirPreVenda] = useState(false);
  const [exibirDesconto, setExibirDesconto] = useState(false);
  const [pilotarReajuste, setPilotarReajuste] = useState(false);
  const [porcentagemReajuste, setPorcentagemReajuste] = useState(0);

  // ✅ Função para atualizar os valores do contexto
  const setParametros = (params: ParametrosContextProps) => {
    setExibirPreVenda(params.exibirPreVenda);
    setExibirDesconto(params.exibirDesconto);
    setPilotarReajuste(params.pilotarReajuste);
    setPorcentagemReajuste(params.porcentagemReajuste);
  };

  return (
    <ParametrosContext.Provider
      value={{
        exibirPreVenda,
        exibirDesconto,
        pilotarReajuste,
        porcentagemReajuste,
        setParametros,
      }}
    >
      {children}
    </ParametrosContext.Provider>
  );
};

// ✅ Hook para acessar os parâmetros em qualquer tela do app
export const useParametros = () => {
  const context = useContext(ParametrosContext);
  if (!context) {
    throw new Error("useParametros must be used within a ParametrosProvider");
  }
  return context;
};
