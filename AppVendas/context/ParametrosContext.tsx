import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as SQLite from "expo-sqlite";

// Abre/cria o banco de dados SQLite local do dispositivo
// Este banco fica armazenado apenas no dispositivo, não é sincronizado
const db = SQLite.openDatabaseSync("user_data.db");

// Identificador fixo para a configuração do dispositivo

const DEVICE_CONFIG_ID = "DEVICE_CONFIG";

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

export interface ParametrosData {
  exibirPreVenda: boolean;
  exibirDesconto: boolean;
  pilotarReajuste: boolean;
  porcentagemReajuste: number;
  parametrosListaProdutos: ParametrosListaProdutos;
  parametrosOnePage: ParametrosOnePage;
}

export interface ParametrosContextProps {
  exibirPreVenda: boolean;
  exibirDesconto: boolean;
  pilotarReajuste: boolean;
  porcentagemReajuste: number;
  parametrosListaProdutos: ParametrosListaProdutos;
  parametrosOnePage: ParametrosOnePage;
  setParametros: (params: Partial<ParametrosContextProps>) => void;
  setParametrosListaProdutos: (
    params: Partial<ParametrosListaProdutos> | ParametrosListaProdutos
  ) => void;
  setParametrosOnePage: (
    params: Partial<ParametrosOnePage> | ParametrosOnePage
  ) => void;
  isLoading: boolean;
  loadParametros: () => Promise<void>;
  saveToDatabase: (data?: ParametrosData) => Promise<boolean>;
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

let tableInitPromise: Promise<boolean> | null = null;

const ensureTableExists = async (): Promise<boolean> => {
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
        // Cria tabela local para armazenar configurações do dispositivo
        // IMPORTANTE: Esta tabela é LOCAL, não sincroniza com servidor
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS ParametrosDispositivo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            configId TEXT UNIQUE NOT NULL,
            exibirPreVenda INTEGER DEFAULT 0,
            exibirDesconto INTEGER DEFAULT 0,
            pilotarReajuste INTEGER DEFAULT 0,
            porcentagemReajuste REAL DEFAULT 0,
            parametrosListaProdutos TEXT,
            parametrosOnePage TEXT,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
        // console.log(
        //   "✅ Tabela ParametrosDispositivo criada/verificada com sucesso (armazenamento local)"
        // );
        return true;
      } catch (error) {
        console.error("❌ Erro ao criar tabela ParametrosDispositivo:", error);
        return false;
      }
    })();
  }
  return tableInitPromise;
};

// Inicia a criação da tabela assim que o arquivo é carregado
ensureTableExists();

const ParametrosContext = createContext<ParametrosContextProps | undefined>(
  undefined
);

export const ParametrosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Estados dos parâmetros
  const [exibirPreVenda, setExibirPreVenda] = useState(false);
  const [exibirDesconto, setExibirDesconto] = useState(false);
  const [pilotarReajuste, setPilotarReajuste] = useState(false);
  const [porcentagemReajuste, setPorcentagemReajuste] = useState(0);
  const [parametrosListaProdutos, setParametrosListaProdutosState] =
    useState<ParametrosListaProdutos>(defaultParametrosListaProdutos);
  const [parametrosOnePage, setParametrosOnePageState] =
    useState<ParametrosOnePage>(defaultParametrosOnePage);
  const [isLoading, setIsLoading] = useState(true);

  // Função para atualizar parâmetros básicos
  const setParametros = (params: Partial<ParametrosContextProps>) => {
    if (params.exibirPreVenda !== undefined)
      setExibirPreVenda(params.exibirPreVenda);
    if (params.exibirDesconto !== undefined)
      setExibirDesconto(params.exibirDesconto);
    if (params.pilotarReajuste !== undefined)
      setPilotarReajuste(params.pilotarReajuste);
    if (params.porcentagemReajuste !== undefined)
      setPorcentagemReajuste(params.porcentagemReajuste);
  };

  // Função para atualizar parâmetros da lista de produtos
  const setParametrosListaProdutos = (
    params: Partial<ParametrosListaProdutos> | ParametrosListaProdutos
  ) => {
    if (
      "exibirProdutosMaisComprados" in params &&
      "exibicaoMaisComprados" in params &&
      "mesesMaisComprados" in params
    ) {
      setParametrosListaProdutosState(params as ParametrosListaProdutos);
    } else {
      setParametrosListaProdutosState((prev) => ({ ...prev, ...params }));
    }
  };

  // Função para atualizar parâmetros do One Page
  const setParametrosOnePage = (
    params: Partial<ParametrosOnePage> | ParametrosOnePage
  ) => {
    if (
      "exibirOtimizacaoAnual" in params &&
      "defaultAnos" in params &&
      "quantidadeExibicaoADIDAS" in params
    ) {
      setParametrosOnePageState(params as ParametrosOnePage);
    } else {
      setParametrosOnePageState((prev) => ({ ...prev, ...params }));
    }
  };

  const loadParametros = useCallback(async () => {
    setIsLoading(true);
    // console.log(
    //   "🔄 Carregando parâmetros do armazenamento LOCAL do dispositivo..."
    // );

    try {
      // Garante que a tabela local existe
      const tableReady = await ensureTableExists();
      if (!tableReady) {
        console.error("❌ Tabela local não está pronta para uso");
        return;
      }

      // Busca a configuração salva localmente
      const result = await db.getAllAsync<{
        exibirPreVenda: number;
        exibirDesconto: number;
        pilotarReajuste: number;
        porcentagemReajuste: number;
        parametrosListaProdutos: string | null;
        parametrosOnePage: string | null;
      }>(`SELECT * FROM ParametrosDispositivo WHERE configId = ?`, [
        DEVICE_CONFIG_ID,
      ]);

      if (result && result.length > 0) {
        // Encontrou configuração salva no dispositivo
        const row = result[0];
        // console.log("✅ Parâmetros encontrados no armazenamento LOCAL:", row);

        // Carrega os valores salvos
        setExibirPreVenda(row.exibirPreVenda === 1);
        setExibirDesconto(row.exibirDesconto === 1);
        setPilotarReajuste(row.pilotarReajuste === 1);
        setPorcentagemReajuste(row.porcentagemReajuste || 0);

        // Carrega parâmetros de lista de produtos (JSON)
        if (row.parametrosListaProdutos) {
          try {
            const parsed = JSON.parse(row.parametrosListaProdutos);
            setParametrosListaProdutosState(parsed);
          } catch (e) {
            console.error("❌ Erro ao parsear parametrosListaProdutos:", e);
            setParametrosListaProdutosState(defaultParametrosListaProdutos);
          }
        } else {
          setParametrosListaProdutosState(defaultParametrosListaProdutos);
        }

        // Carrega parâmetros do One Page (JSON)
        if (row.parametrosOnePage) {
          try {
            const parsed = JSON.parse(row.parametrosOnePage);
            setParametrosOnePageState(parsed);
          } catch (e) {
            console.error("❌ Erro ao parsear parametrosOnePage:", e);
            setParametrosOnePageState(defaultParametrosOnePage);
          }
        } else {
          setParametrosOnePageState(defaultParametrosOnePage);
        }
      } else {
        // Primeira vez usando o app neste dispositivo
        // Usa valores padrão
        // console.log(
        //   "ℹ️ Nenhum parâmetro encontrado no dispositivo, usando valores padrão"
        // );
        setExibirPreVenda(false);
        setExibirDesconto(false);
        setPilotarReajuste(false);
        setPorcentagemReajuste(0);
        setParametrosListaProdutosState(defaultParametrosListaProdutos);
        setParametrosOnePageState(defaultParametrosOnePage);
      }
    } catch (error) {
      console.error(
        "❌ Erro ao carregar parâmetros do armazenamento local:",
        error
      );
      // Em caso de erro, usa valores padrão
      setExibirPreVenda(false);
      setExibirDesconto(false);
      setPilotarReajuste(false);
      setPorcentagemReajuste(0);
      setParametrosListaProdutosState(defaultParametrosListaProdutos);
      setParametrosOnePageState(defaultParametrosOnePage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveToDatabase = useCallback(
    async (data?: ParametrosData): Promise<boolean> => {
      // console.log("💾 Salvando parâmetros no armazenamento LOCAL do dispositivo...");

      try {
        // Garante que a tabela local existe
        const tableReady = await ensureTableExists();
        if (!tableReady) {
          console.error("❌ Tabela local não está pronta para uso");
          return false;
        }

        // Dados a serem salvos (usa os passados ou os do estado atual)
        const dataToSave = data || {
          exibirPreVenda,
          exibirDesconto,
          pilotarReajuste,
          porcentagemReajuste,
          parametrosListaProdutos,
          parametrosOnePage,
        };

        // Converte objetos complexos para JSON
        const listaProdutosJson = JSON.stringify(
          dataToSave.parametrosListaProdutos
        );
        const onePageJson = JSON.stringify(dataToSave.parametrosOnePage);

        // Verifica se já existe configuração salva
        const existingResult = await db.getAllAsync<{ id: number }>(
          `SELECT id FROM ParametrosDispositivo WHERE configId = ?`,
          [DEVICE_CONFIG_ID]
        );

        if (existingResult && existingResult.length > 0) {
          // Atualiza a configuração existente
          await db.runAsync(
            `UPDATE ParametrosDispositivo SET 
            exibirPreVenda = ?,
            exibirDesconto = ?,
            pilotarReajuste = ?,
            porcentagemReajuste = ?,
            parametrosListaProdutos = ?,
            parametrosOnePage = ?,
            updatedAt = CURRENT_TIMESTAMP
          WHERE configId = ?`,
            [
              dataToSave.exibirPreVenda ? 1 : 0,
              dataToSave.exibirDesconto ? 1 : 0,
              dataToSave.pilotarReajuste ? 1 : 0,
              dataToSave.porcentagemReajuste,
              listaProdutosJson,
              onePageJson,
              DEVICE_CONFIG_ID,
            ]
          );
          // console.log("✅ Parâmetros atualizados no armazenamento LOCAL com sucesso!");
        } else {
          // Insere nova configuração (primeira vez)
          await db.runAsync(
            `INSERT INTO ParametrosDispositivo (
            configId,
            exibirPreVenda,
            exibirDesconto,
            pilotarReajuste,
            porcentagemReajuste,
            parametrosListaProdutos,
            parametrosOnePage
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              DEVICE_CONFIG_ID,
              dataToSave.exibirPreVenda ? 1 : 0,
              dataToSave.exibirDesconto ? 1 : 0,
              dataToSave.pilotarReajuste ? 1 : 0,
              dataToSave.porcentagemReajuste,
              listaProdutosJson,
              onePageJson,
            ]
          );
          // console.log(
          //   "✅ Parâmetros inseridos no armazenamento LOCAL com sucesso!"
          // );
        }

        // Atualiza o estado do contexto com os novos valores
        if (data) {
          setExibirPreVenda(data.exibirPreVenda);
          setExibirDesconto(data.exibirDesconto);
          setPilotarReajuste(data.pilotarReajuste);
          setPorcentagemReajuste(data.porcentagemReajuste);
          setParametrosListaProdutosState(data.parametrosListaProdutos);
          setParametrosOnePageState(data.parametrosOnePage);
        }

        return true;
      } catch (error) {
        console.error(
          "❌ Erro ao salvar parâmetros no armazenamento local:",
          error
        );
        return false;
      }
    },
    [
      exibirPreVenda,
      exibirDesconto,
      pilotarReajuste,
      porcentagemReajuste,
      parametrosListaProdutos,
      parametrosOnePage,
    ]
  );

  // Carrega os parâmetros automaticamente quando o app inicia
  useEffect(() => {
    loadParametros();
  }, [loadParametros]);

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
        isLoading,
        loadParametros,
        saveToDatabase,
      }}
    >
      {children}
    </ParametrosContext.Provider>
  );
};

// Hook para usar os parâmetros em qualquer componente
export const useParametros = () => {
  const context = useContext(ParametrosContext);
  if (!context) {
    throw new Error("useParametros must be used within a ParametrosProvider");
  }
  return context;
};
