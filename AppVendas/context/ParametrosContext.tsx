import React, { createContext, useContext, useState } from "react";

export interface ParametrosListaProdutos {
  exibirProdutosMaisComprados: boolean;
  exibicaoMaisComprados: number;
  mesesMaisComprados: number;
  exibirLinhasMaisCompradas: boolean;
  exibicaoLinhasMaisCompradas: number;
  mesesLinhasMaisCompradas: number;
  exibirCampeoesRegionais: boolean;
  exibicaoCampeoesRegionais: number;
}

export interface ParametrosOnePage {
  exibirOtimizacaoAnual: boolean;
  defaultAnos: number;
  quantidadeExibicaoADIDAS: number;
  defaultAnosADIDAS: number;
  quantidadeExibicaoTECHNOS: number;
  defaultAnosTECHNOS: number;
  quantidadeExibicaoCONDOR: number;
  defaultAnosCONDOR: number;
  quantidadeExibicaoEURO: number;
  defaultAnosEURO: number;
  quantidadeExibicaoFOSSIL: number;
  defaultAnosFOSSIL: number;
  quantidadeExibicaoMARINER: number;
  defaultAnosMARINER: number;
}

export interface ParametrosContextProps {
  exibirPreVenda: boolean;
  exibirDesconto: boolean;
  pilotarReajuste: boolean;
  porcentagemReajuste: number;
  parametrosListaProdutos: ParametrosListaProdutos;
  parametrosOnePage: ParametrosOnePage;
  setParametros: (params: Partial<ParametrosContextProps>) => void;
  setParametrosListaProdutos: (params: Partial<ParametrosListaProdutos>) => void;
  setParametrosOnePage: (params: Partial<ParametrosOnePage>) => void;
}

const defaultParametrosListaProdutos: ParametrosListaProdutos = {
  exibirProdutosMaisComprados: false,
  exibicaoMaisComprados: 10,
  mesesMaisComprados: 6,
  exibirLinhasMaisCompradas: false,
  exibicaoLinhasMaisCompradas: 10,
  mesesLinhasMaisCompradas: 6,
  exibirCampeoesRegionais: false,
  exibicaoCampeoesRegionais: 10,
};

const defaultParametrosOnePage: ParametrosOnePage = {
  exibirOtimizacaoAnual: true,
  defaultAnos: 5,
  quantidadeExibicaoADIDAS: 10,
  defaultAnosADIDAS: 5,
  quantidadeExibicaoTECHNOS: 10,
  defaultAnosTECHNOS: 5,
  quantidadeExibicaoCONDOR: 10,
  defaultAnosCONDOR: 5,
  quantidadeExibicaoEURO: 10,
  defaultAnosEURO: 5,
  quantidadeExibicaoFOSSIL: 10,
  defaultAnosFOSSIL: 5,
  quantidadeExibicaoMARINER: 10,
  defaultAnosMARINER: 5,
};

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
  const [parametrosListaProdutos, setParametrosListaProdutosState] = useState<ParametrosListaProdutos>(
    defaultParametrosListaProdutos
  );
  const [parametrosOnePage, setParametrosOnePageState] = useState<ParametrosOnePage>(
    defaultParametrosOnePage
  );

  const setParametros = (params: Partial<ParametrosContextProps>) => {
    if (params.exibirPreVenda !== undefined) setExibirPreVenda(params.exibirPreVenda);
    if (params.exibirDesconto !== undefined) setExibirDesconto(params.exibirDesconto);
    if (params.pilotarReajuste !== undefined) setPilotarReajuste(params.pilotarReajuste);
    if (params.porcentagemReajuste !== undefined) setPorcentagemReajuste(params.porcentagemReajuste);
  };

  const setParametrosListaProdutos = (params: Partial<ParametrosListaProdutos>) => {
    setParametrosListaProdutosState((prev) => ({ ...prev, ...params }));
  };

  const setParametrosOnePage = (params: Partial<ParametrosOnePage>) => {
    setParametrosOnePageState((prev) => ({ ...prev, ...params }));
  };

  return (
    <ParametrosContext.Provider
      value={{
        exibirPreVenda,
        exibirDesconto,
        pilotarReajuste,
        porcentagemReajuste,
        parametrosListaProdutos,
        parametrosOnePage,
        setParametros,
        setParametrosListaProdutos,
        setParametrosOnePage,
      }}
    >
      {children}
    </ParametrosContext.Provider>
  );
};

export const useParametros = () => {
  const context = useContext(ParametrosContext);
  if (!context) {
    throw new Error("useParametros must be used within a ParametrosProvider");
  }
  return context;
};
