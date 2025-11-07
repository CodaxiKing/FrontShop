import React from "react";
import { View, FlatList } from "react-native";
import {
  ContainerTitle,
  Title,
  Subtitle,
  Input,
  ButtonContainer,
  DestinatariosContainer,
} from "./style";
import CardDestinatarioMalaDireta from "@/components/CardDestinatarioMalaDireta";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

interface SelecaoDestinatarioProps {
  search: string;
  setSearch: (text: string) => void;
  destinatarios: Array<{
    representanteId: string;
    nome: string;
    email: string;
  }>;
  selectedId: string[];
  onSelect: (ids: string[]) => void;
  onNext: () => void;
  onCancel: () => void;
  onOpenRepresentanteModal: () => void;
  isModoPaisagem: boolean;
  width: number;
}

const SelecaoDestinatario = ({
  search,
  setSearch,
  destinatarios,
  selectedId,
  onSelect,
  onNext,
  onCancel,
  onOpenRepresentanteModal,
  isModoPaisagem,
  width,
}: SelecaoDestinatarioProps) => {
  const handleSelect = (id: string) => {
    onSelect(
      selectedId.includes(id)
        ? selectedId.filter((item) => item !== id)
        : [...selectedId, id]
    );
  };

  const getNumColumns = (isModoPaisagem: boolean, width: number) => {
    if (isModoPaisagem && width >= 1500) return 4;
    if (isModoPaisagem && width >= 1200) return 3;
    if (isModoPaisagem && width >= 800) return 2;
    return 2;
  };

  return (
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
          {/* <ConfirmacaoModalButton onPress={onOpenRepresentanteModal} text="Selecionar Representante" /> */}
        </View>
        <FlatList
          data={destinatarios}
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
          onPress={onCancel}
          variant="exit"
        />
        <ConfirmacaoModalButton text="Selecionar" onPress={onNext} />
      </ButtonContainer>
    </>
  );
};

export default SelecaoDestinatario;
