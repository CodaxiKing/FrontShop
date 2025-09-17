import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  FlatList,
  Alert,
  ScrollView,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import {
  ModalContainer,
  ContentContainer,
  Title,
  Subtitle,
  Input,
  ButtonContainer,
  ContainerTitle,
  ProductInfo,
  CheckBoxContainer,
  DestinatariosContainer,
  ProductsContainer,
  FormContainer,
  CardTitle,
  TextArea,
} from "./style";
import CardDestinatarioMalaDireta from "@/components/CardDestinatarioMalaDireta";
import CardProdutoMalaDireta from "@/components/CardProdutoMalaDireta";
import CheckboxGroup from "@/components/CheckboxGroup";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useOrientation } from "@/context/OrientationContext";
import { useAuth } from "@/context/AuthContext";
import * as SQLite from "expo-sqlite";
import { CONFIGS } from "@/constants/Configs";
import { useSelectedProducts } from "@/context/SelectedProductsContext";
import CheckBox from "@/components/Checkbox";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import ModalEmailMalaDireta from "../ModalEmailMalaDireta";
import { fetchDestinatarios, PAGE_SIZE_DEFAULT } from "./databaseService";
import { Destinatario } from "./types";

const db = SQLite.openDatabaseSync("user_data.db");

interface MalaDiretaSelecaoDestinatarioProps {
  visible: boolean;
  onClose: () => void;
}

interface RouteParams {
  selectedProducts?: {
    codigo: string;
    precoUnitario: number;
    productImage: { uri: string };
    nomeEcommerce?: string;
  }[];
}

interface Pedido {
  id: string;
}

export const MalaDiretaSelecaoDestinatario: React.FC<
  MalaDiretaSelecaoDestinatarioProps
> = ({ visible, onClose }) => {
  const [selectedId, setSelectedId] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [step, setStep] = useState<
    "SelecionarDestinatario" | "SelecionarInfos"
  >("SelecionarDestinatario");
  const { isModoPaisagem, width } = useOrientation();
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selectedOptions, setSelectedOptions] = useState({
    sendReferencia: false,
    sendCaixa: false,
    sendPulseira: false,
    sendResistencia: false,
    sendCodigoBarra: false,
    sendNCM: false,
    sendValor: false,
    sendPDF: false,
    sendExcel: false,
    sendEmail: false,
  });
  const [assunto, setAssunto] = useState<string>("");
  const [texto, setTexto] = useState<string>("");

  const [emailModalVisible, setEmailModalVisible] = useState<boolean>(false);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailChecked, setEmailChecked] = useState<boolean>(false);

  const { userData, accessToken } = useAuth();
  const { selectedProducts } = useSelectedProducts();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Número de colunas dinâmico
  const getNumColumns = () =>
    Dimensions.get("window").width >= 1500
      ? 3
      : Dimensions.get("window").width >= 1000
      ? 3
      : 2;
  const [numColumns, setNumColumns] = useState(getNumColumns());

  const PAGE_SIZE = 100;

  // Função para lidar com a mudança de orientação
  useEffect(() => {
    const handleOrientationChange = () => {
      const newNumColumns = getNumColumns();

      if (newNumColumns !== numColumns) {
        setNumColumns(newNumColumns);
      }
    };

    // Adiciona o ouvinte de mudança de orientação
    const subscription = Dimensions.addEventListener(
      "change",
      handleOrientationChange
    );

    // Certifique-se de limpar o ouvinte quando o componente for desmontado
    return () => {
      subscription?.remove();
    };
  }, [numColumns]); // Isso vai garantir que a cada mudança no numColumns o effect seja reexecutado

  // carrega 1 página (reset opcional)
  const loadPage = async (reset = false) => {
    if (loading || loadingMore) return;
    if (!reset && !hasMore) return;

    reset ? setLoading(true) : setLoadingMore(true);
    const offset = reset ? 0 : page * PAGE_SIZE_DEFAULT;

    const rows = await fetchDestinatarios({
      limit: PAGE_SIZE,
      offset,
      search, // filtra no SQL
    });

    setDestinatarios((prev) => (reset ? rows : [...prev, ...rows]));
    setPage((prev) => (reset ? 1 : prev + 1));
    setHasMore(rows.length === PAGE_SIZE);

    reset ? setLoading(false) : setLoadingMore(false);
  };

  // carga inicial
  useEffect(() => {
    loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // busca com debounce (refaz do zero)
  useEffect(() => {
    const id = setTimeout(() => loadPage(true), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const keyExtractor = React.useCallback(
    (item: Destinatario) => String(item.clienteId),
    []
  );

  const columnWrapperStyle = React.useMemo(
    () => ({
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginBottom: 10,
      gap: 20,
    }),
    []
  );

  const handleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // console.log("Clientes Selecionados:", Array.from(selectedIds).join(", "));

  const renderItem = React.useCallback(
    ({ item }: { item: Destinatario }) => (
      <CardDestinatarioMalaDireta
        codigo={item.codigo}
        name={item.nomeReduzido}
        email={item.email}
        selected={selectedIds.has(item.clienteId)}
        onSelect={() => handleSelect(item.clienteId)}
        logo={0}
      />
    ),
    [selectedIds, handleSelect]
  );

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) => {
      const newValue = !prev[option as keyof typeof prev];

      // console.log("Estado atualizado toogleOption:", selectedOptions);

      return {
        ...prev,

        [option]: newValue,
      };
    });
  };

  const handleEmailCheck = () => {
    setEmailChecked(!emailChecked);
    setSelectedOptions((prev) => ({
      ...prev,
      sendEmail: !prev.sendEmail, // Atualiza dentro de selectedOptions
    }));
  };

  const resetModal = () => {
    setSelectedIds(new Set()); // Reseta IDs selecionados
    setSearch(""); // Limpa o campo de busca
    setStep("SelecionarDestinatario"); // Volta para o primeiro passo
    setSelectedOptions({
      sendReferencia: false,
      sendCaixa: false,
      sendPulseira: false,
      sendResistencia: false,
      sendCodigoBarra: false,
      sendNCM: false,
      sendValor: false,
      sendPDF: false,
      sendExcel: false,
      sendEmail: false,
    }); // Reseta checkboxes
    setAssunto(""); // Limpa o campo de assunto
    setTexto(""); // Limpa o campo de texto
    setEmailChecked(false); // Reseta checkbox de email
  };

  const handleEnviarMalaDireta = async () => {
    // verifica se existe um destinatario selecionado ou um email adicionado, tem que ter pelo menos um dos dois.
    if (selectedIds.size === 0 && emailList.length === 0) {
      Alert.alert(
        "Atenção",
        "Nenhum Destinatário selecionado ou Email inserido. Por favor, selecione ou insira pelo menos um."
      );
      return;
    }

    // Verifica se pelo menos um produto foi selecionado
    if (selectedProducts.length === 0) {
      Alert.alert(
        "Atenção",
        "Nenhum produto selecionado. Por favor, selecione pelo menos um produto."
      );
      return;
    }

    const payload = {
      representanteId: userData?.representanteId || "",
      clientes: Array.from(selectedIds).map((clienteId) => ({ clienteId })),
      emails: emailList,
      assunto: assunto,
      texto: texto,
      ...selectedOptions,
      produtos: selectedProducts.map((product) => ({
        codigoProduto: product.codigo,
      })),
    };

    console.log("Payload(Mala Direta):", JSON.stringify(payload, null, 2));

    const enviarMalaDireta = async (payload: any) => {
      try {
        const response = await fetch(`${CONFIGS.BASE_URL}/api/maladireta`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        // Verifica se a resposta da API é bem-sucedida
        if (!response.ok) {
          let errorText = await response.text();
          console.error("Erro na resposta da API:", errorText);

          let errorJson;
          try {
            errorJson = JSON.parse(errorText); // Tenta converter para JSON
          } catch (parseError) {
            console.warn("Erro ao converter resposta para JSON:", parseError);
          }

          // Captura a mensagem do erro se disponível
          errorText =
            errorJson?.message ||
            errorJson?.error ||
            (errorJson?.errors
              ? Object.values(errorJson.errors).flat().join(", ")
              : errorText);

          Alert.alert("Erro", `Falha ao enviar mala direta: ${errorText}`);
          return;
        }

        // Se a resposta for bem-sucedida, processa o texto da resposta
        const responseText = await response.text();
        if (responseText) {
          try {
            JSON.parse(responseText);
          } catch (jsonError) {
            console.error("Erro ao parsear o JSON:", jsonError);
            Alert.alert("Erro", "Falha ao processar a resposta da API.");
            return;
          }
        } else {
          console.log("Sucesso no envio de mala direta. Resposta vazia.");
        }

        Alert.alert("Sucesso", "Mala direta enviada com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              console.log("Fechando modal e resetando dados.");
              resetModal(); // Reseta os estados antes de fechar
              onClose();
            },
          },
        ]);
      } catch (error: any) {
        console.error("Erro ao enviar mala direta:", error);
        if (error instanceof SyntaxError) {
          Alert.alert(
            "Erro",
            "Resposta inválida da API. Verifique o servidor."
          );
        } else if (error.message === "Network request failed") {
          Alert.alert("Erro", "Falha na conexão. Verifique sua internet.");
        } else {
          Alert.alert("Erro", "Ocorreu um erro ao enviar a mala direta.");
        }
      }
    };

    try {
      if (!accessToken) {
        Alert.alert(
          "Erro",
          "Token de autenticação não encontrado. Faça login novamente."
        );
        return;
      }

      // caso assunto e texto estejam vazios, exibe um alerta informando que estão vazios com opção de continuar ou cancelar.
      if (!assunto.trim() || !texto.trim()) {
        Alert.alert(
          "Atenção",
          "Assunto e/ou corpo do email estão vazios. Deseja continuar?",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Continuar",
              onPress: () => enviarMalaDireta(payload),
            },
          ]
        );
      } else {
        enviarMalaDireta(payload);
      }
    } catch (error) {
      console.error("Erro ao enviar mala direta:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao enviar a mala direta. Tente novamente mais tarde."
      );
    }
  };

  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <ModalContainer>
          <ContentContainer>
            {step === "SelecionarDestinatario" && (
              <>
                <ContainerTitle>
                  <Title>Seleção de Destinatárioss</Title>
                </ContainerTitle>
                <DestinatariosContainer>
                  <Subtitle>
                    Toque nos clientes que você deseja enviar as informações.
                  </Subtitle>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 16,
                      // width: "96%",
                    }}
                  >
                    <Input
                      placeholder="Filtrar por Código, Cliente ou E-mail"
                      value={search}
                      onChangeText={setSearch}
                      style={{
                        width: "90%",
                        // height: 50,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setEmailModalVisible(true);
                        // setStep("SelecionarInfos");
                      }}
                    >
                      <MaterialIcons name="email" size={50} color="black" />
                    </TouchableOpacity>
                  </View>

                  {loading ? (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        height: 200,
                      }}
                    >
                      <ActivityIndicator size="large" color="#0000ff" />
                      <Text
                        style={{ marginTop: 10, color: "#555", fontSize: 16 }}
                      >
                        ⏳ Carregando destinatários...
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      key={String(numColumns)}
                      data={destinatarios}
                      keyExtractor={(item) => item.clienteId}
                      renderItem={renderItem}
                      initialNumToRender={16}
                      maxToRenderPerBatch={24}
                      updateCellsBatchingPeriod={50}
                      windowSize={7}
                      removeClippedSubviews
                      keyboardShouldPersistTaps="handled"
                      onEndReachedThreshold={0.4}
                      onEndReached={() => loadPage(false)} // ✅ busca próxima página
                      numColumns={numColumns}
                      columnWrapperStyle={columnWrapperStyle}
                      ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: "center" }}>
                          <Text>Nenhum cliente encontrado.</Text>
                        </View>
                      }
                      ListFooterComponent={
                        loadingMore ? (
                          <View style={{ paddingVertical: 12 }}>
                            <ActivityIndicator size={42} color="#0000ff" />
                          </View>
                        ) : null
                      }
                      style={{
                        height: isModoPaisagem ? "50%" : "73%",
                      }}
                    />
                  )}
                </DestinatariosContainer>
                <ButtonContainer>
                  <ConfirmacaoModalButton
                    text="Cancelar"
                    onPress={onClose}
                    variant="exit"
                  />
                  <ConfirmacaoModalButton
                    text="Selecionar"
                    onPress={() => setStep("SelecionarInfos")}
                  />
                </ButtonContainer>
              </>
            )}
            {step === "SelecionarInfos" && (
              <View
                style={{
                  maxHeight: isModoPaisagem ? "100%" : "100%",
                  minHeight: isModoPaisagem ? 400 : 600,
                }}
              >
                <ScrollView>
                  <ContainerTitle>
                    <Title>Mala Direta</Title>
                  </ContainerTitle>
                  <ProductsContainer>
                    <View>
                      <Subtitle>Produtos a serem enviados:</Subtitle>
                      <View
                        style={{
                          maxHeight: 700,
                          width: 310,
                        }}
                      >
                        <ScrollView
                          nestedScrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                          contentContainerStyle={{
                            paddingVertical: 5,
                          }}
                        >
                          {selectedProducts.map((product) => (
                            <ProductInfo key={product.codigo}>
                              <CardProdutoMalaDireta
                                refer={`REF ${product.codigo || ""}`}
                                productImage={product.productImage}
                                codigo={product.codigo}
                                precoUnitario={product.precoUnitario}
                                nomeEcommerce={product.nomeEcommerce || ""}
                              />
                            </ProductInfo>
                          ))}
                        </ScrollView>
                      </View>

                      {/* <View
                        style={{ position: "relative", bottom: 10, left: 20 }}
                      >
                        <CheckBox
                          label={"Email"}
                          isChecked={emailChecked}
                          onPress={handleEmailCheck}
                        />
                      </View> */}
                    </View>
                    <CheckBoxContainer>
                      <Subtitle>Informações disponíveis no e-mail:</Subtitle>
                      <CheckboxGroup
                        value={selectedOptions}
                        onToggle={toggleOption}
                        isModoPaisagem={isModoPaisagem}
                      />
                      <View style={{ marginTop: 50 }}>
                        <Subtitle>Enviar email ?</Subtitle>
                        <CheckBox
                          label={"Email"}
                          isChecked={emailChecked}
                          onPress={handleEmailCheck}
                        />
                      </View>
                    </CheckBoxContainer>
                  </ProductsContainer>
                  <FormContainer>
                    <CardTitle>Assunto</CardTitle>
                    <Input
                      placeholder="Assunto do email"
                      value={assunto}
                      onChangeText={setAssunto}
                    />
                    <CardTitle>Corpo do email</CardTitle>
                    <TextArea
                      placeholder="Texto"
                      value={texto}
                      onChangeText={setTexto}
                    />
                  </FormContainer>
                </ScrollView>
                <ButtonContainer>
                  <ConfirmacaoModalButton
                    text="Voltar"
                    onPress={() => setStep("SelecionarDestinatario")}
                    variant="exit"
                  />
                  <ConfirmacaoModalButton
                    text="Enviar"
                    onPress={handleEnviarMalaDireta}
                  />
                </ButtonContainer>
              </View>
            )}
          </ContentContainer>
        </ModalContainer>
      </Modal>

      {emailModalVisible && (
        <ModalEmailMalaDireta
          isVisible={emailModalVisible}
          onClose={() => setEmailModalVisible(false)}
          emails={emailList}
          onConfirm={(emails) => {
            setEmailList(emails);
            setEmailModalVisible(false);
          }}
        />
      )}
    </>
  );
};
