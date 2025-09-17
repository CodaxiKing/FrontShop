import React, { useEffect, useState } from "react";
import { Modal, View, FlatList, ScrollView, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
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
import ModalRepresentante from "../ModalRepresentante";
import { useOrientation } from "@/context/OrientationContext";
import { useAuth } from "@/context/AuthContext";
import * as SQLite from "expo-sqlite";
import { CONFIGS } from "@/constants/Configs";

const db = SQLite.openDatabaseSync("user_data.db");

interface MalaDiretaSelecaoDestinatarioProps {
  visible: boolean;
  onClose: () => void;
}

interface RouteParams {
  codigo?: string;
  productImage?: string;
  nomeEcommerce?: string;
  precoUnitario?: number;
}

export const MalaDiretaSelecaoDestinatario = ({
  visible,
  onClose,
}: MalaDiretaSelecaoDestinatarioProps) => {
  const [selectedId, setSelectedId] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [representanteModalVisible, setRepresentanteModalVisible] =
    useState(false);
  const [step, setStep] = useState<
    "SelecionarDestinatario" | "SelecionarInfos"
  >("SelecionarDestinatario");
  const { isModoPaisagem, width } = useOrientation();
  const [destinatarios, setDestinatarios] = useState<
    {
      representanteId: string;
      codigoFilial: string;
      nome: string;
      email: string;
    }[]
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [assunto, setAssunto] = useState(""); // Removido valor padrão
  const [texto, setTexto] = useState(""); // Removido valor padrão
  const [formatoEnvio, setFormatoEnvio] = useState<"PDF" | "Excel" | null>(
    null
  );

  const { userData, accessToken } = useAuth();

  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const codigo = params?.codigo;
  const productImage = params?.productImage;
  const nomeEcommerce = params?.nomeEcommerce;
  const precoUnitario = params?.precoUnitario;

  const handleSelect = (id: string) => {
    setSelectedId((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenRepresentanteModal = () => {
    setRepresentanteModalVisible(true);
  };

  const getNumColumns = (isModoPaisagem: boolean, width: number) => {
    if (isModoPaisagem && width >= 1500) return 4;
    if (isModoPaisagem && width >= 1200) return 3;
    if (isModoPaisagem && width >= 800) return 2;
    return 2;
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) => {
      const newOptions = prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option];
      console.log("Opções selecionadas:", newOptions);
      return newOptions;
    });
  };

  useEffect(() => {
    const fetchDestinatarios = async () => {
      try {
        const queryRepresentantes =
          "SELECT * FROM Representante WHERE email IS NOT NULL AND email <> ''";
        const result = await db.getAllAsync<{
          representanteId: string;
          codigoFilial: string;
          nome: string;
          email: string;
        }>(queryRepresentantes);
        setDestinatarios(result);
      } catch (error) {
        console.error(
          "Erro ao buscar representantes no banco de dados:",
          error
        );
      }
    };

    fetchDestinatarios();
  }, []);

  const handleEnviarMalaDireta = async () => {
    if (!assunto || !texto) {
      Alert.alert("Erro", "Preencha o assunto e o texto do email.");
      return;
    }

    if (selectedId.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos um destinatário.");
      return;
    }

    const payload = {
      representanteId: userData?.representanteId,
      assunto: assunto,
      texto: texto,
      sendReferencia: selectedOptions.includes("referencia"),
      sendCaixa: selectedOptions.includes("caixa"),
      sendPulseira: selectedOptions.includes("pulseira"),
      sendResistencia: selectedOptions.includes("resistencia"),
      sendCodigoBarra: selectedOptions.includes("codigoBarra"),
      sendNCM: selectedOptions.includes("ncm"),
      sendValor: selectedOptions.includes("valor"),
      sendPDF: formatoEnvio === "PDF",
      sendExcel: formatoEnvio === "Excel",
      sendEmail: true,
      produtos: codigo
        ? [
            {
              codigoProduto: codigo,
            },
          ]
        : [],
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
        const errorText = await response.text();
        console.error("Erro na resposta da API:", errorText);
        Alert.alert(
          "Erro",
          "Falha ao enviar mala direta. Resposta inválida da API."
        );
        return;
      }

      const responseText = await response.text();

      let data = null;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Erro ao parsear o JSON:", jsonError);
          Alert.alert("Erro", "Falha ao processar a resposta da API.");
          return;
        }
      }

      Alert.alert("Sucesso", "Mala direta enviada com sucesso!");
      console.log("Resposta da API:", data);
      onClose(); // Fechar o modal após o envio
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

  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <ModalContainer>
          <ContentContainer>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
            >
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
                      <ConfirmacaoModalButton
                        onPress={handleOpenRepresentanteModal}
                        text="Selecionar Representante"
                      />
                    </View>

                    <FlatList
                      data={destinatarios.filter(
                        (item) =>
                          item.nome
                            .toLowerCase()
                            .includes(search.toLowerCase()) ||
                          item.email
                            .toLowerCase()
                            .includes(search.toLowerCase())
                      )}
                      keyExtractor={(item) => item.representanteId}
                      renderItem={({ item }) => (
                        <CardDestinatarioMalaDireta
                          id={item.representanteId}
                          name={item.nome}
                          email={item.email}
                          selected={selectedId.includes(item.representanteId)}
                          onSelect={() => handleSelect(item.representanteId)}
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
                <>
                  <ContainerTitle>
                    <Title>Mala Direta</Title>
                  </ContainerTitle>
                  <ProductsContainer>
                    <View style={{ flex: 0.5 }}>
                      <Subtitle>Produtos a serem enviados:</Subtitle>
                      {codigo && (
                        <ProductInfo>
                          <CardProdutoMalaDireta
                            refer={`REF ${codigo}`}
                            productImage={{ uri: productImage || "" }}
                            nomeEcommerce={nomeEcommerce}
                            precoUnitario={precoUnitario}
                          />
                        </ProductInfo>
                      )}
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
                </>
              )}
            </ScrollView>
          </ContentContainer>
        </ModalContainer>
      </Modal>

      <ModalRepresentante
        isVisible={representanteModalVisible}
        onClose={() => setRepresentanteModalVisible(false)}
        onConfirm={() => setRepresentanteModalVisible(false)}
      />
    </>
  );
};
