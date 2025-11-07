import React, { useState } from "react";
import { Modal, ScrollView, TouchableOpacity, Text, View } from "react-native";
import {
  ModalContainer,
  ModalHeader,
  Title,
  Subtitle,
  Section,
  SectionTitle,
  Row,
  Input,
  RadioGroup,
  RadioButton,
  RadioLabel,
  TextArea,
  CardContainer,
  CardRow,
  CardInput,
  AddCardButton,
  ButtonContainer,
  CancelButton,
  SaveButton,
  ModalBackground,
} from "./style";
import { AntDesign } from "@expo/vector-icons";

const ModalPagamento: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState("Sim");

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalBackground>
        <ModalContainer>
          {/* Header */}
          <ModalHeader>
            <Title>Opção de Pagamento Selecionada:</Title>
            <Subtitle>Cartão de Crédito</Subtitle>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity>
          </ModalHeader>

          {/* Lojas Selecionadas */}
          <Section>
            <SectionTitle>Lojas Selecionadas:</SectionTitle>
            <Row>
              {[
                "Loja Exemplo 01 - RJ",
                "Loja Exemplo 02 - MG",
                "Loja Exemplo 03 - SP",
              ].map((loja, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    {loja}
                  </Text>
                  <AntDesign name="close" size={16} color="#fff" />
                </TouchableOpacity>
              ))}
            </Row>
          </Section>

          {/* Inputs */}
          <Section>
            <Row>
              <Input placeholder="Pedido Interno" />
              <Input placeholder="% Frete" />
            </Row>
            <Row>
              <RadioGroup>
                <RadioButton onPress={() => setSelectedOption("Sim")}>
                  {selectedOption === "Sim" && (
                    <View style={{ backgroundColor: "#007bff", flex: 1 }} />
                  )}
                </RadioButton>
                <RadioLabel>Sim</RadioLabel>
                <RadioButton onPress={() => setSelectedOption("Não")}>
                  {selectedOption === "Não" && (
                    <View style={{ backgroundColor: "#007bff", flex: 1 }} />
                  )}
                </RadioButton>
                <RadioLabel>Não</RadioLabel>
              </RadioGroup>
              <TextArea
                placeholder="Dados complementares (máx 500 caracteres)"
                multiline
              />
            </Row>
          </Section>

          {/* Condição de Pagamento */}
          <Section>
            <SectionTitle>Condição de Pagamento</SectionTitle>
            <ScrollView>
              {[1, 2].map((item, index) => (
                <CardContainer key={index}>
                  <CardRow>
                    <Text>#0{item}</Text>
                    <CardInput placeholder="Bandeira" />
                    <CardInput placeholder="Valor" />
                    <CardInput placeholder="Parcela" />
                  </CardRow>
                </CardContainer>
              ))}
              <AddCardButton>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Adicionar Outro Cartão
                </Text>
              </AddCardButton>
            </ScrollView>
          </Section>

          {/* Botões */}
          <ButtonContainer>
            <CancelButton onPress={onClose}>
              <Text style={{ color: "#007bff", fontWeight: "bold" }}>
                Cancelar
              </Text>
            </CancelButton>
            <SaveButton>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Salvar</Text>
            </SaveButton>
          </ButtonContainer>
        </ModalContainer>
      </ModalBackground>
    </Modal>
  );
};

export default ModalPagamento;
