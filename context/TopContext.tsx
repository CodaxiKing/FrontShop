// context/TopContext.tsx
import { RootStackParamList } from "@/types/types";
import { useNavigation } from "expo-router";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NovoPedidoItem } from "./interfaces/NovoPedidoItem";
import { Alert } from "react-native";
import { useCarrinho } from "@/hooks/useCarrinho";
import { eventBus } from "@/core/eventBus"; // nomeado
import AuthContext from "@/context/AuthContext"; // pegar representanteId



interface TopContextProps {
  isSidebarVisible: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  dropdownVisible: boolean;
  toggleDropdown: () => void;
  isMalaDiretaModalVisible: boolean;
  openMalaDiretaModal: () => void;
  closeMalaDiretaModal: () => void;
  isLogoutModalVisible: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  isSyncModalVisible: boolean;
  openSyncModal: () => void;
  closeSyncModal: () => void;
  handleCarrinhoNavigation: (carrinho: NovoPedidoItem) => void;

  isLoadingSync: boolean;
  setIsLoadingSync: (loading: boolean) => void;

  incrementPendingSync: () => void;
  decrementPendingSync: () => void;

  totalCarrinhosCount: number;
  updateCarrinhosCount: () => Promise<void>;
  carrinhosUpdated: NovoPedidoItem[];
}

const TopContext = createContext<TopContextProps | undefined>(undefined);
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TopProviderProps {
  children: ReactNode;
}

export const TopProvider: React.FC<TopProviderProps> = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMalaDiretaModalVisible, setIsMalaDiretaModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const navigation = useNavigation<NavigationProp>();

  // representanteId do AuthContext
  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId ?? "";  

  // representanteId para o hook  
  //console.warn(`[TopContext.tsx->TopProvider] → [${representanteId}]`);    
  const { total, carrinhos, refresh } = useCarrinho(representanteId);

  const openSidebar = () => setSidebarVisible(true);
  const closeSidebar = () => setSidebarVisible(false);
  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const openMalaDiretaModal = () => setIsMalaDiretaModalVisible(true);
  const closeMalaDiretaModal = () => setIsMalaDiretaModalVisible(false);
  const openLogoutModal = () => setIsLogoutModalVisible(true);
  const closeLogoutModal = () => setIsLogoutModalVisible(false);
  const openSyncModal = () => setIsSyncModalVisible(true);
  const closeSyncModal = () => setIsSyncModalVisible(false);

  const handleCarrinhoNavigation = async (carrinho: NovoPedidoItem) => {
    try {
      const encontrado = carrinhos.find(
        (c) => c.clienteId === carrinho.clienteId || c.cpfCnpj === carrinho.cpfCnpj
      );
      if (encontrado) {
        navigation.navigate("Carrinho", {
          clienteId: encontrado.clienteId,
          pedidoId: encontrado.id,
          cpfCnpj: encontrado.cpfCnpj,
        });
      } else {
        Alert.alert("Carrinho não encontrado", "Nenhum carrinho em aberto para este cliente.");
      }
    } catch (error) {
      console.error("Erro ao navegar para o carrinho:", error);
      Alert.alert("Erro", "Houve um problema ao abrir o carrinho.");
    } finally {
      toggleDropdown();
    }
  };

  // Mantém a API do contexto: atualiza sob demanda
  const updateCarrinhosCount = async () => {
    await refresh();
    eventBus.emit("carrinho:changed"); // opcional: mantém outros ouvintes sincronizados
  };

  const incrementPendingSync = () => setPendingSyncCount((p) => p + 1);
  const decrementPendingSync = () => setPendingSyncCount((p) => Math.max(0, p - 1));

  useEffect(() => {
    setIsLoadingSync(pendingSyncCount > 0);
  }, [pendingSyncCount]);

  return (
    <TopContext.Provider
      value={{
        isSidebarVisible,
        openSidebar,
        closeSidebar,
        dropdownVisible,
        toggleDropdown,
        isMalaDiretaModalVisible,
        openMalaDiretaModal,
        closeMalaDiretaModal,
        isLogoutModalVisible,
        openLogoutModal,
        closeLogoutModal,
        handleCarrinhoNavigation,
        isSyncModalVisible,
        openSyncModal,
        closeSyncModal,
        isLoadingSync,
        setIsLoadingSync,
        updateCarrinhosCount,
        totalCarrinhosCount: total,   // vem do hook já filtrado
        carrinhosUpdated: carrinhos,  // vem do hook já filtrado
        incrementPendingSync,
        decrementPendingSync,
      }}
    >
      {children}
    </TopContext.Provider>
  );
};

export const useTopContext = (): TopContextProps => {
  const context = useContext(TopContext);
  if (!context) throw new Error("useTopContext must be used within a TopProvider");
  return context;
};
