// =====================================================
// ParametersScreen.tsx
// 
// Essa é a tela de configurações do app!
// Aqui o usuário pode mudar várias preferências como:
// - Exibir ou não produtos em pré-venda
// - Ativar reajuste de preços
// - Configurar como os produtos aparecem na lista
// - Configurar parâmetros por marca no One Page
// 
// As configurações são salvas automaticamente no banco de dados
// e no AsyncStorage para persistir entre sessões.
// =====================================================

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Top from "@/components/Top";
import { useParametros } from "@/context/ParametrosContext";
import { useAuth } from "@/context/AuthContext";
import { CONFIGS } from "@/constants/Configs";
import * as SQLite from "expo-sqlite";

// Abre o banco de dados local
// Usamos o mesmo banco que o resto do app
const db = SQLite.openDatabaseSync("user_data.db");

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
const ParametersScreen: React.FC = () => {
  // Hook de navegação - permite voltar para a tela anterior
  const navigation = useNavigation();
  
  // Dados do usuário logado - pegamos do contexto de autenticação
  const { userData } = useAuth();
  
  // ===================================================
  // CONTEXTO DE PARÂMETROS
  // Aqui pegamos todos os valores e funções do contexto
  // que criamos para gerenciar as configurações
  // ===================================================
  const {
    exibirPreVenda,
    exibirDesconto,
    pilotarReajuste,
    porcentagemReajuste,
    parametrosListaProdutos,
    parametrosOnePage,
    setParametros,
    setParametrosListaProdutos,
    setParametrosOnePage,
    isLoading: isLoadingContext,  // Loading do contexto (carregando do banco)
    loadParametros,               // Função para carregar do banco
    saveToDatabase,               // Função para salvar manualmente
  } = useParametros();

  // ===================================================
  // ESTADOS LOCAIS
  // Usamos estados locais para editar os valores
  // antes de salvar. Isso evita que mudanças parciais
  // sejam salvas enquanto o usuário ainda está editando.
  // ===================================================
  
  // Configurações básicas
  const [localExibirPreVenda, setLocalExibirPreVenda] = useState(exibirPreVenda);
  const [localExibirDesconto, setLocalExibirDesconto] = useState(exibirDesconto);
  const [localPilotarReajuste, setLocalPilotarReajuste] = useState(pilotarReajuste);
  const [localPorcentagemReajuste, setLocalPorcentagemReajuste] = useState(porcentagemReajuste);
  
  // Configurações complexas (objetos)
  const [localListaProdutos, setLocalListaProdutos] = useState(parametrosListaProdutos);
  const [localOnePage, setLocalOnePage] = useState(parametrosOnePage);
  
  // Nome do representante para exibir no header
  const [nomeRepresentante, setNomeRepresentante] = useState<string | undefined>(undefined);
  
  // Estados de UI
  const [isSaving, setIsSaving] = useState(false);  // Mostra loading enquanto salva
  const [saveMessage, setSaveMessage] = useState<string | null>(null);  // Mensagem de feedback
  
  // Email do usuário logado
  const email = userData?.email;
  
  // ID do representante - usamos para salvar os parâmetros
  const representanteId = userData?.representanteId?.toString() || "";

  // ===================================================
  // EFEITO: Esconde o header padrão do React Navigation
  // Usamos nosso próprio componente Top no lugar
  // ===================================================
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // ===================================================
  // EFEITO: Carrega os parâmetros quando a tela abre
  // useFocusEffect executa toda vez que a tela ganha foco
  // ===================================================
  useFocusEffect(
    useCallback(() => {
      if (representanteId) {
        console.log("🔄 Tela focada, carregando parâmetros para:", representanteId);
        loadParametros(representanteId);
      }
    }, [representanteId, loadParametros])
  );

  // ===================================================
  // EFEITO: Busca o nome do representante no banco
  // Isso é apenas para exibir no header da tela
  // ===================================================
  useEffect(() => {
    const fetchRepresentante = async () => {
      // Se não tiver email, usa o nome do userData
      if (!email) {
        setNomeRepresentante(userData?.nome || "Representante");
        return;
      }

      try {
        // Valida se o email é válido
        if (email === "undefined" || email === null || email === "") {
          setNomeRepresentante(userData?.nome || "Representante");
          return;
        }
        
        // Busca o nome na tabela Representante
        const query = `SELECT nome FROM Representante WHERE UPPER(Email) = UPPER(?)`;
        const nameResult: { nome: string }[] = await db.getAllAsync(query, [email]);

        // Se encontrou, usa o nome do banco
        if (nameResult[0]?.nome) {
          setNomeRepresentante(nameResult[0].nome);
        } else {
          setNomeRepresentante(userData?.nome || "Representante");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar representante:", error);
        setNomeRepresentante(userData?.nome || "Representante");
      }
    };

    fetchRepresentante();
  }, [email, userData?.nome]);

  // ===================================================
  // EFEITO: Sincroniza estados locais com o contexto
  // Quando os valores do contexto mudam (ex: após carregar),
  // atualizamos os estados locais para refletir
  // ===================================================
  useEffect(() => {
    setLocalExibirPreVenda(exibirPreVenda);
    setLocalExibirDesconto(exibirDesconto);
    setLocalPilotarReajuste(pilotarReajuste);
    setLocalPorcentagemReajuste(porcentagemReajuste);
    setLocalListaProdutos(parametrosListaProdutos);
    setLocalOnePage(parametrosOnePage);
  }, [
    exibirPreVenda,
    exibirDesconto,
    pilotarReajuste,
    porcentagemReajuste,
    parametrosListaProdutos,
    parametrosOnePage,
  ]);

  // ===================================================
  // FUNÇÃO: Salva todas as configurações
  // Atualiza o contexto e força o salvamento no banco
  // Passamos os dados explícitos para evitar race conditions
  // ===================================================
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      console.log("💾 Iniciando salvamento de parâmetros...");
      
      // Monta o objeto com todos os dados atuais da tela
      // Passamos explicitamente para evitar problemas de "stale state"
      const dataToSave = {
        exibirPreVenda: localExibirPreVenda,
        exibirDesconto: localExibirDesconto,
        pilotarReajuste: localPilotarReajuste,
        porcentagemReajuste: localPorcentagemReajuste,
        parametrosListaProdutos: localListaProdutos,
        parametrosOnePage: localOnePage,
      };
      
      // Atualiza os parâmetros básicos no contexto
      // Isso atualiza a UI em outras telas que usam esses valores
      setParametros({
        exibirPreVenda: localExibirPreVenda,
        exibirDesconto: localExibirDesconto,
        pilotarReajuste: localPilotarReajuste,
        porcentagemReajuste: localPorcentagemReajuste,
      });
      
      // Atualiza os parâmetros da lista de produtos
      setParametrosListaProdutos(localListaProdutos);
      
      // Atualiza os parâmetros do One Page
      setParametrosOnePage(localOnePage);
      
      // Força o salvamento no banco passando os dados explícitos
      // Isso garante que salvamos exatamente o que o usuário vê na tela
      if (representanteId) {
        const success = await saveToDatabase(representanteId, dataToSave);
        
        if (success) {
          console.log("✅ Parâmetros salvos com sucesso!");
          setSaveMessage("Configurações salvas com sucesso!");
          
          // Mostra a mensagem por 1.5 segundos e volta
          setTimeout(() => {
            setSaveMessage(null);
            navigation.goBack();
          }, 1500);
        } else {
          throw new Error("Falha ao salvar no banco");
        }
      } else {
        // Se não tem representanteId, só volta (salvou no contexto)
        // Isso pode acontecer em ambiente de teste
        setSaveMessage("Configurações salvas!");
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      setSaveMessage("Erro ao salvar. Tente novamente.");
      
      // Mostra alerta de erro para o usuário
      Alert.alert(
        "Erro ao Salvar",
        "Não foi possível salvar as configurações. Por favor, tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ===================================================
  // FUNÇÃO: Cancela as alterações
  // Simplesmente volta para a tela anterior sem salvar
  // ===================================================
  const handleCancel = () => {
    navigation.goBack();
  };

  // ===================================================
  // COMPONENTE: Linha de input numérico reutilizável
  // Usamos isso várias vezes na tela, então criamos
  // uma função que retorna o JSX para evitar repetição
  // ===================================================
  const renderInputRow = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    suffix?: string
  ) => (
    <View style={styles.inlineInputRow}>
      <Text style={styles.inlineInputLabel}>{label}</Text>
      <TextInput
        style={styles.numberInput}
        value={value.toString()}
        onChangeText={(text) => onChange(parseInt(text) || 0)}
        keyboardType="numeric"
      />
      {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
    </View>
  );

  // ===================================================
  // TELA DE LOADING
  // Mostra enquanto carrega os parâmetros do banco
  // ===================================================
  if (isLoadingContext) {
    return (
      <View style={styles.mainContainer}>
        <Top />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando configurações...</Text>
        </View>
      </View>
    );
  }

  // ===================================================
  // RENDER PRINCIPAL
  // ===================================================
  return (
    <View style={styles.mainContainer}>
      {/* Componente Top - Header do app */}
      <Top />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* =============================================== */}
        {/* HEADER: Avatar e informações do usuário */}
        {/* =============================================== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require("../../assets/images/avatar/avatar.png")} 
                style={styles.userAvatar}
              />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{nomeRepresentante || "Carregando..."}</Text>
              <Text style={styles.userEnvironment}>Ambiente: {CONFIGS.AMBIENTE_SINCRONIZACAO}</Text>
              <Text style={styles.userVersion}>Version: {CONFIGS.APP_VERSION}</Text>
            </View>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Parâmetros</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* =============================================== */}
        {/* MENSAGEM DE FEEDBACK */}
        {/* Aparece quando salva ou dá erro */}
        {/* =============================================== */}
        {saveMessage && (
          <View style={[
            styles.messageContainer,
            saveMessage.includes("Erro") ? styles.errorMessage : styles.successMessage
          ]}>
            <Text style={styles.messageText}>{saveMessage}</Text>
          </View>
        )}

        {/* =============================================== */}
        {/* SEÇÃO: Informações de Produtos */}
        {/* Configurações básicas de exibição */}
        {/* =============================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exibir Informações de Produtos</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Switch para Pré-Venda */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Exibir Pré-Venda</Text>
              <Switch
                value={localExibirPreVenda}
                onValueChange={setLocalExibirPreVenda}
                trackColor={{ false: "#ccc", true: "#007AFF" }}
              />
            </View>
            
            {/* Switch para Flag de Desconto */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Exibir Flag de desconto</Text>
              <Switch
                value={localExibirDesconto}
                onValueChange={setLocalExibirDesconto}
                trackColor={{ false: "#ccc", true: "#007AFF" }}
              />
            </View>
            
            {/* Switch para Pilotar Reajuste */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Pilotar Reajuste</Text>
              <Switch
                value={localPilotarReajuste}
                onValueChange={setLocalPilotarReajuste}
                trackColor={{ false: "#ccc", true: "#007AFF" }}
              />
            </View>
            
            {/* Input para porcentagem do reajuste */}
            {/* Só fica habilitado se pilotarReajuste estiver ativo */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Valor de Reajuste (%)</Text>
              <TextInput
                style={[
                  styles.numberInput,
                  !localPilotarReajuste && styles.disabledInput,
                ]}
                value={localPorcentagemReajuste.toString()}
                onChangeText={(text) =>
                  setLocalPorcentagemReajuste(parseFloat(text) || 0)
                }
                keyboardType="numeric"
                editable={localPilotarReajuste}
              />
            </View>
          </View>
        </View>

        {/* =============================================== */}
        {/* SEÇÃO: Lista de Produtos */}
        {/* Configura como os produtos aparecem nas listas */}
        {/* =============================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parâmetros Lista de Produtos</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Produtos Mais Comprados */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Exibir Produtos Mais Comprados no Carrinho</Text>
              <Switch
                value={localListaProdutos.exibirProdutosMaisComprados}
                onValueChange={(val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    exibirProdutosMaisComprados: val,
                  }))
                }
                trackColor={{ false: "#ccc", true: "#007AFF" }}
              />
            </View>
            <View style={styles.subInputRow}>
              {renderInputRow(
                "Exibição",
                localListaProdutos.exibicaoMaisComprados,
                (val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    exibicaoMaisComprados: val,
                  }))
              )}
              {renderInputRow(
                "Meses",
                localListaProdutos.mesesMaisComprados,
                (val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    mesesMaisComprados: val,
                  }))
              )}
            </View>

            {/* Linhas Mais Compradas */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Exibir Linhas Mais Compradas</Text>
              <Switch
                value={localListaProdutos.exibirLinhasMaisCompradas}
                onValueChange={(val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    exibirLinhasMaisCompradas: val,
                  }))
                }
                trackColor={{ false: "#ccc", true: "#007AFF" }}
              />
            </View>
            <View style={styles.subInputRow}>
              {renderInputRow(
                "Exibição",
                localListaProdutos.exibicaoLinhasMaisCompradas,
                (val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    exibicaoLinhasMaisCompradas: val,
                  }))
              )}
              {renderInputRow(
                "Meses",
                localListaProdutos.mesesLinhasMaisCompradas,
                (val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    mesesLinhasMaisCompradas: val,
                  }))
              )}
            </View>

            {/* Campeões Regionais */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Exibir Campeões Regionais</Text>
              <Switch
                value={localListaProdutos.exibirCampeoesRegionais}
                onValueChange={(val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    exibirCampeoesRegionais: val,
                  }))
                }
                trackColor={{ false: "#ccc", true: "#007AFF" }}
              />
            </View>
            <View style={styles.subInputRow}>
              {renderInputRow(
                "Exibição",
                localListaProdutos.exibicaoCampeoesRegionais,
                (val) =>
                  setLocalListaProdutos((prev) => ({
                    ...prev,
                    exibicaoCampeoesRegionais: val,
                  }))
              )}
            </View>
          </View>
        </View>

        {/* =============================================== */}
        {/* SEÇÃO: One Page */}
        {/* Configurações específicas por marca */}
        {/* =============================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parâmetros One Page</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Anos para Visão Acumulada */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Exibir Último(s) Ano(s) Visão Acumulada (YTD) e Anual R$</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 5</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.defaultAnos.toString().padStart(2, '0')}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      defaultAnos: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* ADIDAS */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Quantidade Exibição ADIDAS</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 10</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.quantidadeExibicaoADIDAS.toString()}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      quantidadeExibicaoADIDAS: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* TECHNOS */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Quantidade Exibição TECHNOS</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 10</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.quantidadeExibicaoTECHNOS.toString()}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      quantidadeExibicaoTECHNOS: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* CONDOR */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Quantidade Exibição CONDOR</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 10</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.quantidadeExibicaoCONDOR.toString()}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      quantidadeExibicaoCONDOR: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* EURO */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Quantidade Exibição EURO</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 10</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.quantidadeExibicaoEURO.toString()}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      quantidadeExibicaoEURO: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* FOSSIL */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Quantidade Exibição FOSSIL</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 10</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.quantidadeExibicaoFOSSIL.toString()}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      quantidadeExibicaoFOSSIL: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* MARINER */}
            <View style={styles.brandParamRow}>
              <Text style={styles.brandLabel}>Quantidade Exibição MARINER</Text>
              <View style={styles.brandInputGroup}>
                <Text style={styles.brandSubLabel}>Default: 10</Text>
                <TextInput
                  style={styles.brandInput}
                  value={localOnePage.quantidadeExibicaoMARINER.toString()}
                  onChangeText={(text) =>
                    setLocalOnePage((prev) => ({
                      ...prev,
                      quantidadeExibicaoMARINER: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* =============================================== */}
        {/* FOOTER: Botões de ação */}
        {/* =============================================== */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.saveButtonText}> Salvando...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// =====================================================
// ESTILOS
// Usamos StyleSheet.create para melhor performance
// =====================================================
const styles = StyleSheet.create({
  // Container principal - ocupa toda a tela
  mainContainer: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    width: "100%",
  },
  
  // Container do scroll
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    width: "100%",
  },
  
  // Conteúdo do scroll
  scrollContent: {
    width: "100%",
  },
  
  // Container de loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  
  // Mensagens de feedback (sucesso/erro)
  messageContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  
  // Header com avatar
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    width: "100%",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  avatarContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#bdbdbd",
  },
  userDetails: {
    flexDirection: "column",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 2,
  },
  userEnvironment: {
    fontSize: 12,
    color: "#666",
    marginBottom: 1,
  },
  userVersion: {
    fontSize: 12,
    color: "#666",
  },
  
  // Seções de configuração
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "stretch",
    width: "auto",
  },
  sectionHeader: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  sectionContent: {
    padding: 16,
  },
  
  // Linhas com switch
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  switchLabel: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  
  // Linhas com input
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: "center",
    backgroundColor: "#fff",
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: "#e0e0e0",
    borderColor: "#d0d0d0",
  },
  inputSuffix: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  
  // Sub-linhas de input
  subInputRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 16,
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  inlineInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineInputLabel: {
    fontSize: 14,
    color: "#333",
  },
  
  // Parâmetros por marca
  brandParamsContainer: {
    marginTop: 16,
  },
  brandParamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  brandLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  brandInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandSubLabel: {
    fontSize: 12,
    color: "#666",
  },
  brandInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    width: 60,
    textAlign: "center",
    backgroundColor: "#fff",
    fontSize: 13,
  },
  
  // Footer com botões
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  saveButtonDisabled: {
    backgroundColor: "#99c9ff",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ParametersScreen;
