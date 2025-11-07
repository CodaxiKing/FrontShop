import React, { useEffect, useState, useMemo } from "react";
import { Modal, View, FlatList, Alert, ScrollView } from "react-native";
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
import { CarteiraClienteItem } from "@/context/interfaces/CarteiraClienteItem";

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
  const [search, setSearch] = useState<string>("");

  const [step, setStep] = useState<
    "SelecionarDestinatario" | "SelecionarInfos"
  >("SelecionarDestinatario");
  const { isModoPaisagem, width } = useOrientation();
  const [destinatarios, setDestinatarios] = useState<CarteiraClienteItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState({
    sendReferencia: false,
    sendCaixa: false,
    sendPulseira: false,
    sendResitencia: false,
    sendCodigoBarra: false,
    sendNCM: false,
    sendValor: false,
    sendPDF: false,
    sendExcel: false,
    sendEmail: false,
  });
  const [assunto, setAssunto] = useState<string>("");
  const [texto, setTexto] = useState<string>("");
  const [enviarEmail, setEnviarEmail] = useState<boolean>(false);
  const [formatoEnvio, setFormatoEnvio] = useState<"PDF" | "Excel" | null>(
    null
  );
  const [emailChecked, setEmailChecked] = useState<boolean>(false);

  const { userData, accessToken } = useAuth();
  const representanteId = userData?.representanteId;

  const { selectedProducts } = useSelectedProducts();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  useEffect(() => {
    // console.log("selectedOptions atual:", selectedOptions);
  }, [selectedOptions]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  console.log("Mala Direta: ID Selecionado: ", selectedId);

  const getNumColumns = (isModoPaisagem: boolean, width: number): number => {
    if (isModoPaisagem && width >= 1500) return 4;
    if (isModoPaisagem && width >= 1200) return 3;
    if (isModoPaisagem && width >= 800) return 2;
    return 2;
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) => {
      const newValue = !prev[option as keyof typeof prev];
      return { ...prev, [option]: newValue };
    });
  };

  useEffect(() => {
    const fetchDestinatarios = async () => {
      try {
        const queryDestinatarios =
          "SELECT * FROM CarteiraCliente WHERE email IS NOT NULL AND email <> ''";
        const result = await db.getAllAsync<CarteiraClienteItem>(
          queryDestinatarios
        );
        setDestinatarios(result);
      } catch (error) {
        console.error(
          "Mala Direta 2 - Erro ao buscar clientes no banco de dados:",
          error
        );
      }
    };

    fetchDestinatarios();
  }, []);

  const handleEmailCheck = () => {
    setEmailChecked(!emailChecked);
  };

  const handleEnviarMalaDireta = async () => {
    if (selectedId.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos um cliente para envio.");
      return;
    }

    // console.log("Vai entrar no Payload agora");
    const payload = {
      representanteId: representanteId || "",
      clienteId: destinatarios || "",
      assunto,
      texto,
      ...selectedOptions,
      produtos: selectedProducts.map((product) => ({
        codigoProduto: product.codigo,
      })),
      clientes: selectedId.map((clienteId) => ({ clienteId })),
    };

    try {
      if (!accessToken) {
        Alert.alert(
          "Erro",
          "Token de autenticação não encontrado. Faça login novamente."
        );
        return;
      }

      const response = await fetch(`${CONFIGS.BASE_URL}/api/maladireta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

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

      Alert.alert("Sucesso", "Mala direta enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao enviar mala direta:", error);
      if (error instanceof SyntaxError) {
        Alert.alert("Erro", "Resposta inválida da API. Verifique o servidor.");
      } else if (error.message === "Network request failed") {
        Alert.alert("Erro", "Falha na conexão. Verifique sua internet.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao enviar a mala direta.");
      }
    }
  };

  const filteredDestinatarios = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return destinatarios.filter((destinatario) => {
      return (
        destinatario.clienteId.toLowerCase().includes(lowerSearch) ||
        destinatario.nomeReduzido.toLowerCase().includes(lowerSearch) ||
        destinatario.email.toLowerCase().includes(lowerSearch)
      );
    });
  }, [search, destinatarios]);

  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <ModalContainer>
          <ContentContainer>
            {step === "SelecionarDestinatario" && (
              <>
                <ContainerTitle>
                  <Title>Seleção de Destinatários</Title>
                </ContainerTitle>
                <DestinatariosContainer>
                  <Subtitle>
                    Toque nos clientes que você deseja enviar as informações.
                  </Subtitle>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      marginBottom: 16,
                      width: "98%",
                    }}
                  >
                    <Input
                      placeholder="Filtrar por Código, Cliente ou E-mail"
                      value={search}
                      onChangeText={setSearch}
                    />
                  </View>
                  <FlatList
                    data={filteredDestinatarios}
                    keyExtractor={(item) => item.clienteId}
                    renderItem={({ item }) => (
                      <CardDestinatarioMalaDireta
                        id={item.clienteId}
                        name={item.nomeReduzido}
                        email={item.email}
                        selected={selectedId.includes(item.clienteId)}
                        onSelect={() => handleSelect(item.clienteId)}
                        logo={0}
                      />
                    )}
                    numColumns={getNumColumns(isModoPaisagem, width)}
                    columnWrapperStyle={{
                      justifyContent: "space-between",
                      paddingHorizontal: 10,
                      marginBottom: 10,
                      gap: 20,
                    }}
                    style={{
                      maxHeight: isModoPaisagem ? 400 : 600,
                      minHeight: isModoPaisagem ? 400 : 600,
                    }}
                  />
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
                  maxHeight: isModoPaisagem ? 600 : 800,
                  minHeight: isModoPaisagem ? 600 : 800,
                }}
              >
                <ScrollView>
                  <ContainerTitle>
                    <Title>Mala Direta</Title>
                  </ContainerTitle>
                  <ProductsContainer>
                    <View style={{ flex: 0.5 }}>
                      <Subtitle>Produtos a serem enviados:</Subtitle>
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
                      <View style={{ position: "relative", top: 230 }}>
                        <CheckBox
                          label={"Email"}
                          isChecked={emailChecked}
                          onPress={handleEmailCheck}
                        />
                      </View>
                    </View>
                    <CheckBoxContainer>
                      <Subtitle>Informações disponíveis no e-mail:</Subtitle>
                      <CheckboxGroup
                        value={selectedOptions}
                        onToggle={toggleOption}
                      />
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
                    onPress={
                      () => (
                        console.log("Clicou no botão de enviar"),
                        handleEnviarMalaDireta()
                      )
                      // onPress={() => onClose()
                    }
                  />
                </ButtonContainer>
              </View>
            )}
          </ContentContainer>
        </ModalContainer>
      </Modal>
    </>
  );
};
