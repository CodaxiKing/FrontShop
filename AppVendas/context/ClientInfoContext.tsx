import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthContext from "./AuthContext";

export interface ClientInfoContextProps {
  cpfCnpjContext: string | null;
  clienteIdContext: string | number | null;
  razaoSocialContext: string | null;
  selectedTabelaPrecoContext: {
    value: string;
    tipo: string;
  };
  produtosFiltradosTabelaPrecoContext: any[] | null;
  selectedClientContext: {
    cpfCnpj: string;
    clienteId: string | number;
    codigoCliente: string | number;
    razaoSocial: string;
    enderecoCompleto: string;
    enderecos: any[];
  } | null;
  setClientInfo: (info: Partial<ClientInfoContextProps>) => void;
}

const ClientInfoContext = createContext<ClientInfoContextProps>(
  {} as ClientInfoContextProps
);

interface ClientInfoProviderProps {
  children: ReactNode;
}

export const ClientInfoProvider: React.FC<ClientInfoProviderProps> = ({
  children,
}) => {
  //const { userData } = useContext(AuthContext);

  // Estados internos para armazenar as informações do cliente
  const [cpfCnpjContext, setCpfCnpjContext] = useState<string | null>(null);
  const [clienteIdContext, setClienteIdContext] = useState<
    string | number | null
  >(null);
  const [razaoSocialContext, setRazaoSocialContext] = useState<string | null>(
    null
  );
  const [selectedTabelaPrecoContext, setSelectedTabelaPrecoContext] = useState<{
    value: string;
    tipo: string;
  }>({ value: "", tipo: "" });
  const [
    produtosFiltradosTabelaPrecoContext,
    setProdutosFiltradosTabelaPrecoContext,
  ] = useState<any[] | null>(null);
  const [selectedClientContext, setSelectedClientContext] =
    useState<ClientInfoContextProps["selectedClientContext"]>(null);

  // Função para atualizar os valores do contexto
  const setClientInfo = (info: Partial<ClientInfoContextProps>) => {
    if (info.cpfCnpjContext !== undefined)
      setCpfCnpjContext(info.cpfCnpjContext);
    if (info.clienteIdContext !== undefined)
      setClienteIdContext(info.clienteIdContext);
    if (info.razaoSocialContext !== undefined)
      setRazaoSocialContext(info.razaoSocialContext);
    if (info.selectedTabelaPrecoContext !== undefined)
      setSelectedTabelaPrecoContext(
        info.selectedTabelaPrecoContext as {
          value: string;
          tipo: string;
        }
      );
    if (info.produtosFiltradosTabelaPrecoContext !== undefined)
      setProdutosFiltradosTabelaPrecoContext(
        info.produtosFiltradosTabelaPrecoContext
      );
    if (info.selectedClientContext !== undefined)
      setSelectedClientContext(info.selectedClientContext);
  };

  return (
    <ClientInfoContext.Provider
      value={{
        cpfCnpjContext,
        clienteIdContext,
        razaoSocialContext,
        selectedTabelaPrecoContext,
        produtosFiltradosTabelaPrecoContext,
        selectedClientContext,
        setClientInfo,
      }}
    >
      {children}
    </ClientInfoContext.Provider>
  );
};

export const useClientInfoContext = (): ClientInfoContextProps => {
  const context = useContext(ClientInfoContext);
  if (!context) {
    throw new Error(
      "useClientInfoContext must be used within ClientInfoProvider"
    );
  }
  return context;
};
