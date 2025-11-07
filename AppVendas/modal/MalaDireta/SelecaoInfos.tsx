import React from "react";
import { View } from "react-native";
import {
  ContainerTitle,
  Title,
  ProductsContainer,
  CardTitle,
  TextArea,
  FormContainer,
  Subtitle,
  CheckBoxContainer,
  ProductInfo,
  Input,
  ButtonContainer,
} from "./style";
import CardProdutoMalaDireta from "@/components/CardProdutoMalaDireta";
import CheckboxGroup from "@/components/CheckboxGroup";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

interface SelecaoInfosProps {
  codigo: string;
  productImage: string;
  nomeEcommerce?: string;
  precoUnitario?: number;
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
  assunto: string;
  setAssunto: (text: string) => void;
  texto: string;
  setTexto: (text: string) => void;
  onBack: () => void;
  onEnviar: () => void;
}

const SelecaoInfos = ({
  codigo,
  productImage,
  nomeEcommerce,
  precoUnitario,
  selectedOptions,
  setSelectedOptions,
  assunto,
  setAssunto,
  texto,
  setTexto,
  onBack,
  onEnviar,
}: SelecaoInfosProps) => {
  const toggleOption = (option: string) => {
    const newOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    setSelectedOptions(newOptions);
  };

  return (
    <>
      <ContainerTitle>
        <Title>Mala Direta</Title>
      </ContainerTitle>
      <ProductsContainer>
        <View style={{ flex: 0.5 }}>
          <Subtitle>Produtos a serem enviados:</Subtitle>
          <ProductInfo>
            <CardProdutoMalaDireta
              refer={`REF ${codigo}`}
              productImage={{ uri: productImage }}
              nomeEcommerce={nomeEcommerce}
              precoUnitario={precoUnitario}
            />
          </ProductInfo>
        </View>
        <CheckBoxContainer>
          <Subtitle>Informações disponíveis no e-mail:</Subtitle>
          <CheckboxGroup value={selectedOptions} onToggle={toggleOption} />
        </CheckBoxContainer>
      </ProductsContainer>
      <FormContainer>
        <CardTitle>Assunto</CardTitle>
        <Input placeholder="Assunto do email" value={assunto} onChangeText={setAssunto} />
        <CardTitle>Corpo do email</CardTitle>
        <TextArea placeholder="Texto" value={texto} onChangeText={setTexto} />
      </FormContainer>
      <ButtonContainer>
        <ConfirmacaoModalButton text="Voltar" onPress={onBack} variant="exit" />
        <ConfirmacaoModalButton text="Enviar" onPress={onEnviar} />
      </ButtonContainer>
    </>
  );
};

export default SelecaoInfos;
