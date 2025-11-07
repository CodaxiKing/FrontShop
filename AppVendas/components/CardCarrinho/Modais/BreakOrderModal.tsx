// BreakOrderModal.tsx
import React, { useState } from "react";
import { Modal } from "react-native";
import {
  Container,
  ModalContent,
  Title,
  Message,
  RadioContainer,
  RadioButton,
  RadioLabel,
  ButtonContainer,
  CancelButton,
  ConfirmButton,
  ButtonText,
} from "./style.modal.breakorder.style";
import {
  CardSection,
  ContainerBody,
  ContainerTitle,
  ModalContainer,
  ModalTitle,
} from "./style.modal.billing";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

interface BreakOrderModalProps {
  visible: boolean;
  pedidoNumber: number | string;
  onCancel: () => void;
  onSelect: (choice: "sim" | "não") => void;
}

const BreakOrderModal: React.FC<BreakOrderModalProps> = ({
  visible,
  pedidoNumber,
  onCancel,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] = useState<"sim" | "não" | null>(
    null
  );

  const handleConfirm = () => {
    if (selectedOption) {
      onSelect(selectedOption);
      setSelectedOption(null);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <ModalContainer>
        <ModalContent>
          <ContainerTitle>
            <ModalTitle>Confirmar Quebra de Pedido</ModalTitle>
          </ContainerTitle>
          <ContainerBody>
            <CardSection>
              <Message>Deseja quebrar o pedido #{pedidoNumber}?</Message>
              <RadioContainer>
                <RadioButton
                  selected={selectedOption === "sim"}
                  onPress={() => setSelectedOption("sim")}
                />
                <RadioLabel style={{ marginRight: 40 }}>Sim</RadioLabel>
                <RadioButton
                  selected={selectedOption === "não"}
                  onPress={() => setSelectedOption("não")}
                />
                <RadioLabel>Não</RadioLabel>
              </RadioContainer>
            </CardSection>
          </ContainerBody>
          <ButtonContainer>
            <ConfirmacaoModalButton
              text="Cancelar"
              variant="exit"
              onPress={() => {
                setSelectedOption(null);
                onCancel();
              }}
            />
            <ConfirmacaoModalButton
              text="Salvar"
              onPress={handleConfirm}
              disabled={!selectedOption}
            />
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default BreakOrderModal;
