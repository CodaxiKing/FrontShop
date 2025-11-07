import { BandejaItem } from "./interfaces/BandejaItem";
import { UserData } from "./interfaces/UserData";
import { UserFilial } from "./UserFilial";

export interface AuthContextData {
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
    setLoading: (loading: boolean) => void
  ) => Promise<void>;
  signOut: () => void;
  goBackToLogin: () => void;
  accessToken?: string;
  refreshToken?: string;
  userData?: UserData;
  setUserData: (userData: UserData) => void;
  bandejaData?: BandejaItem[];
  syncProgress?: number;
  syncData?: () => Promise<void>;
  fetchAllPedidos?: (token: string) => Promise<void>;
  fetchAllData?: (token: string) => Promise<void>;
  fetchAllClientes?: (token: string) => Promise<void>;
  fetchAllFreteData?: (token: string) => Promise<void>;
  fetchAllPagamentoCliente?: (token: string) => Promise<void>;
  fetchAllRepresentanteData?: (token: string) => Promise<void>;
  fetchAllSinalizadoresData?: (token: string) => Promise<void>;
  fetchAllCatalogoData?: (token: string) => Promise<void>;
  seedControleIntegracaoData?: () => Promise<void>;

  filiais: UserFilial[];
  filialSelecionada?: UserFilial;
  selectFilial: (filialCodigo: string) => void;
  setFilialSelecionada: (filial: UserFilial) => void;
}
