import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { AuthContextData } from "@/context/AuthContextData";
import { UserData } from "@/context/interfaces/UserData";
import { BandejaItem } from "@/context/interfaces/BandejaItem";
import { createNovoPedidoTable } from "./queries/novoPedidoQueries";
import { CONFIGS } from "@/constants/Configs";
import {
  createControleIntegracaoTable,
  insertControleIntegracaoData,
} from "./queries/controleIntegracaoQueries";
import { CONTROLE_INTEGRACAO } from "@/constants/ControleIntegracaoConfig";

import * as SQLite from "expo-sqlite";
import { createPedidoTable } from "./queries/pedidoQueries";
import { queryCreateFavoritosTable } from "../database/queries/favoritoQueries";
import { UserFilial } from "./UserFilial";
const db = SQLite.openDatabaseSync("user_data.db");

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    undefined
  );
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [bandejaData, setBandejaData] = useState<BandejaItem[]>([]);
  // const [db, setDb] = useState<SQLite.WebSQLDatabase | null>(null);

  const router = useRouter();

  const [filiais, setFiliais] = useState<UserFilial[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState<UserFilial>();

  let totalClientesNaTabela = 0;

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await recreateTable(
          createControleIntegracaoTable,
          "ControleIntegracao"
        );
        await recreateTable(createNovoPedidoTable, "NovoPedido");
        await recreateTable(createPedidoTable, "Pedido");
        await recreateTable(queryCreateFavoritosTable, "favoritos");
        // é criada aqui pois não depende de endpoint para dar GET nos dados, ela é usada para criar carrinhos e finalizar pedido.
      } catch (error) {
        console.error("Erro ao inicializar o banco de dados:", error);
      }
    };

    initializeDatabase();
  }, []);

  const recreateTable = async (createTableSQL: string, tableName: string) => {
    try {
      const tableInfo = await db.getAllAsync(
        `PRAGMA table_info(${tableName});`
      );

      if (tableInfo.length === 0) {
        await db.execAsync(createTableSQL);
        console.log(`Tabela ${tableName} criada com sucesso!`);
      } else {
        console.log(`Tabela ${tableName} já existe.`);
      }
    } catch (error) {
      console.error(`Erro ao verificar/criar tabela ${tableName}:`, error);
    }
  };

  const seedControleIntegracaoData = async () => {
    const tableInfo = await db.getAllAsync(
      `PRAGMA table_info("ControleIntegracao");`
    );

    if (tableInfo.length === 0) {
      await db.execAsync(createControleIntegracaoTable);
    }

    try {
      for (const item of CONTROLE_INTEGRACAO) {
        await db.runAsync(insertControleIntegracaoData, [
          item.codigo,
          item.descricao,
          item.pageSize,
          item.dataAtualizacao,
        ]);
      }
    } catch (error) {
      console.error("Erro ao inserir dados:", error);
    }
  };

  // Função para escolher filial e completar o userData
  const selectFilial = (filialCodigo: string) => {
    const filial = filiais.find((f) => f.filialCodigo === filialCodigo);
    if (!filial) {
      Alert.alert("Erro", "Filial não encontrada. Por favor, tente novamente.");
      return;
    }

    // set selected branch
    setFilialSelecionada(filial);

    // assemble full userData with the fields from that filial
    setUserData({
      ...userData,
      codigo: filial.codigo,
      representanteId: filial.representanteId,
      representanteCreateId: filial.representanteId,
      nome: filial.nome,
      nomeReduzido: filial.nomeReduzido,
      endereco: filial.endereco,
      bairro: filial.bairro,
      cidade: filial.cidade,
      estado: filial.estado,
      cep: filial.cep,
      telefone: filial.telefone,
      filialCodigo: filial.filialCodigo,
      filialDescricao: filial.filialDescricao,
      filialPercentualRepasseFixo: filial.filialPercentualRepasseFixo,
      filialSigla: filial.filialSigla,
      filialValorRepasseFixo: filial.filialValorRepasseFixo,
      fax: filial.fax,
      cpfCnpj: filial.cpfCnpj,
      email: filial.email,
      gerente: filial.gerente,
      supervisor: filial.supervisor,
      diretor: filial.diretor,
      codigoCentroCusto: filial.codigoCentroCusto,
      codigoLoja: filial.codigoLoja,
      cargo: filial.cargo,
      pais: filial.pais,
      telefoneCelular: filial.telefoneCelular,
    } as UserData);

    router.replace("/views/Sincronizacao");
  };

  // Função para buscar todos os dados da API e salvar no banco de dados local
  const fetchAllData = async (token: string) => {
    const totalTasks = 16; // Quantidade de funções a serem chamadas (#TODO: Editar sempre que adicionar nova função)
    let completedTasks = 0;

    const incrementProgress = () => {
      completedTasks += 1;
      const progress = Math.round((completedTasks / totalTasks) * 100);
      setSyncProgress(progress); // Atualiza o progresso
    };

    try {
      setSyncProgress(0); // Reseta o progresso
      await seedControleIntegracaoData(), incrementProgress();
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);

    // const normalizedEmail = email.toLowerCase();

    try {
      const response = await fetch(`${CONFIGS.BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        setIsAuthenticated(true);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);

        // save the full array
        setFiliais(data.userFiliais);

        // **Novo**: se houver só uma filial, já confirmamos automaticamente
        // 2) Se só tiver UMA filial, já a escolhe sem depender de 'filiais' state
        if (data.userFiliais.length === 1) {
          const sole = data.userFiliais[0];

          // monta o userData direto a partir da resposta
          const userPayload: UserData = {
            codigo: sole.codigo,
            representanteId: sole.representanteId,
            representanteCreateId: sole.representanteId,
            nome: sole.nome,
            nomeReduzido: sole.nomeReduzido,
            endereco: sole.endereco,
            bairro: sole.bairro,
            cidade: sole.cidade,
            estado: sole.estado,
            cep: sole.cep,
            telefone: sole.telefone,
            fax: sole.fax,
            cpfCnpj: sole.cpfCnpj,
            email: sole.email,
            gerente: sole.gerente,
            supervisor: sole.supervisor,
            diretor: sole.diretor,
            codigoCentroCusto: sole.codigoCentroCusto,
            codigoLoja: sole.codigoLoja,
            cargo: sole.cargo,
            pais: sole.pais,
            telefoneCelular: sole.telefoneCelular,
            filialCodigo: sole.filialCodigo,
            filialDescricao: sole.filialDescricao,
            filialPercentualRepasseFixo: sole.filialPercentualRepasseFixo,
            filialSigla: sole.filialSigla,
            filialValorRepasseFixo: sole.filialValorRepasseFixo,
          };

          // define no contexto
          setFilialSelecionada(sole);
          setUserData(userPayload);

          // e navega direto

          return router.replace("/views/Home");
          // return router.replace("/views/Sincronizacao");
        }

        // 3) se tiver mais de 1, deixa o usuário escolher na UI
        setFilialSelecionada(undefined);
        setUserData(undefined);
        // caso contrário, fica na tela de seleção
      } else {
        const errorData = await response.json();
        Alert.alert("Erro", errorData.message || "Usuário ou senha inválidos");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Tentando fazer login offline...");

      // Caso não consiga conectar ao servidor, tenta login offline
      await tryOfflineLogin(email);
    } finally {
      setLoading(false); // Desativa o loading
    }
  };

  // Função para login offline através do banco de dados local
  const tryOfflineLogin = async (email: string) => {
    try {
      const query = `
      SELECT * FROM Representante WHERE UPPER(Email) = UPPER(?);
    `;
      const result = await db.getAllAsync(query, [email]);

      if (result.length > 0) {
        const representante = result[0];

        // Define como autenticado com os dados locais
        setIsAuthenticated(true);
        setUserData({
          email: representante.email,
          representanteId: representante.representanteId,
        } as UserData);

        Alert.alert(
          "Login Offline",
          "Sistema Offline. Você está logado com os dados locais."
        );

        router.replace("/views/Home");
        // router.replace("/views/Sincronizacao");
      } else {
        Alert.alert("Erro", "Usuário não encontrado para login offline.");
      }
    } catch (error) {
      console.error("Erro no login offline:", error);
      Alert.alert("Erro", "Ocorreu um erro ao verificar o login offline.");
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setAccessToken(undefined);
    setRefreshToken(undefined);
    setUserData(undefined);
    setFilialSelecionada(undefined);
    setFiliais([]);
    setBandejaData([]); // não sei se é necessário, testar depois
    router.replace("/");
  };
  const goBackToLogin = () => {
    setIsAuthenticated(false);
    setAccessToken(undefined);
    setRefreshToken(undefined);
    setUserData(undefined);
    setFilialSelecionada(undefined);
    setFiliais([]);
  };

  const syncData = async () => {
    if (!accessToken) {
      console.log("Não há token para sincronizar dados.");
      return;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
        signOut,
        accessToken,
        refreshToken,
        userData,
        setUserData,
        bandejaData,
        syncData,

        filiais,
        filialSelecionada,
        setFilialSelecionada, // só define, sem navegar
        selectFilial, // que faz define + monta userData + navega
        goBackToLogin,

        fetchAllData,
        seedControleIntegracaoData,
        syncProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
