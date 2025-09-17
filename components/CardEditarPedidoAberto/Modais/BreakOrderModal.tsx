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

const BreakOrderModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleClose = () => setIsVisible(false);

  const handleConfirm = () => {
    handleClose();
  };

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <Container>
        <ModalContent>
          <Title>Confirmar Quebra de Pedido</Title>
          <Message>Deseja quebrar o pedido #1001?</Message>
          <RadioContainer>
            <RadioButton
              selected={selectedOption === "sim"}
              onPress={() => setSelectedOption("sim")}
            />
            <RadioLabel>Sim</RadioLabel>
            <RadioButton
              selected={selectedOption === "não"}
              onPress={() => setSelectedOption("não")}
            />
            <RadioLabel>Não</RadioLabel>
          </RadioContainer>
          <ButtonContainer>
            <CancelButton onPress={handleClose}>
              <ButtonText>Cancelar</ButtonText>
            </CancelButton>
            <ConfirmButton onPress={handleConfirm}>
              <ButtonText>Confirmar</ButtonText>
            </ConfirmButton>
          </ButtonContainer>
        </ModalContent>
      </Container>
    </Modal>
  );
};

export default BreakOrderModal;
