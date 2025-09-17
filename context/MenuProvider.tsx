import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AuthContext from "./AuthContext";

type LojasSelecionadasPorCliente = {
  [cpfCnpj: string]: string[];
};
interface MenuContextProps {
  modalParcialVisible: boolean;
  setModalParcialVisible: (visible: boolean) => void;
  profileName: string;
  syncStatus: string;

  lojasSelecionadasMap: LojasSelecionadasPorCliente;
  getLojasSelecionadasParaCliente: (cpfCnpj: string) => string[];
  setLojasParaCliente: (cpfCnpj: string, lojas: string[]) => void;

  limparLojasSelecionadas: () => void;
}

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [modalParcialVisible, setModalParcialVisible] = useState(false);
  // const [modalLojasVisible, setModalLojasVisible] = useState(false);
  const [lojasSelecionadas, setLojasSelecionadas] = useState<string[]>([]);
  const [lojasSelecionadasMap, setLojasSelecionadasMap] =
    useState<LojasSelecionadasPorCliente>({});

  const { userData } = useContext(AuthContext);

  const profileName = `${userData?.nome}`;
  const syncStatus = "Sincronizado em: Ambiente Dev";

  const getLojasSelecionadasParaCliente = (cpfCnpj: string): string[] => {
    return lojasSelecionadasMap[cpfCnpj] || [];
  };

  const setLojasParaCliente = (cpfCnpj: string, lojas: string[]) => {
    setLojasSelecionadasMap((prev) => ({
      ...prev,
      [cpfCnpj]: lojas,
    }));
  };

  const limparLojasSelecionadas = () => {
    setLojasSelecionadasMap({});
  };

  useEffect(() => {
    console.log("📦 selectedStores (contexto):", lojasSelecionadas);
  }, [lojasSelecionadas]);

  return (
    <MenuContext.Provider
      value={{
        modalParcialVisible,
        setModalParcialVisible,
        // modalLojasVisible,
        // setModalLojasVisible,
        profileName,
        syncStatus,
        lojasSelecionadasMap,
        getLojasSelecionadasParaCliente,
        setLojasParaCliente,

        limparLojasSelecionadas,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = (): MenuContextProps => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenuContext must be used within a MenuProvider");
  }
  return context;
};
