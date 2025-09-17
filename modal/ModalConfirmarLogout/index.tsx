import React from "react";
import { Modal, TouchableWithoutFeedback } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalTitle,
  ModalButtonContainer,
  ModalButton,
  ModalCancelButton,
  ModalButtonText,
} from "./style";
import { useOrientation } from "@/context/OrientationContext";

interface ConfirmLogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalConfirmarLogout: React.FC<ConfirmLogoutModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const { isModoPaisagem, width } = useOrientation();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <ModalContainer>
          <ModalContent isModoPaisagem={isModoPaisagem} deviceWidth={width}>
            <ModalTitle>Tem certeza que deseja sair?</ModalTitle>
            <ModalButtonContainer>
              <ModalCancelButton onPress={onClose}>
                <ModalButtonText color="#000">Cancelar</ModalButtonText>
              </ModalCancelButton>
              <ModalButton onPress={onConfirm}>
                <ModalButtonText color="#fff">Sair</ModalButtonText>
              </ModalButton>
            </ModalButtonContainer>
          </ModalContent>
        </ModalContainer>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalConfirmarLogout;
