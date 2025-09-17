import React, { useState } from "react";
import {
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import {
  ModalOverlay,
  ModalContainer,
  ModalContent,
  CheckboxContainer,
  ButtonContainer,
  SectionContainer,
  SectionHeader,
} from "./style";
import CheckBox from "@/components/Checkbox";
import InputFieldComponent from "@/components/InputFieldComponent";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

interface CopiaConfirmacaoProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ModalCopiaPedidoConfirmacao: React.FC<CopiaConfirmacaoProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <ModalOverlay>
        <ModalContainer>
          <ModalContent>
            <SectionContainer>
              <SectionHeader>
                Tem certeza que deseja copiar o mesmo pedido para os clientes
                selecionados?
              </SectionHeader>
            </SectionContainer>
          </ModalContent>
          <ButtonContainer>
            <ConfirmacaoModalButton
              text="Cancelar"
              variant="exit"
              onPress={onClose}
              width="114"
            />
            <ConfirmacaoModalButton
              text="Confirmar"
              variant="confirm"
              onPress={onConfirm}
              width="100"
            />
          </ButtonContainer>
        </ModalContainer>
      </ModalOverlay>
    </Modal>
  );
};
