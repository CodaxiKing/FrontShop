import React from "react";
import { Modal } from "react-native";
import {
  ModalContainer,
  ModalContent,
  SuccessIcon,
  SuccessText,
} from "./style.modal.success";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface ModalSuccessProps {
  visible: boolean;
  onClose: () => void;
  text: string;
}

const ModalSuccess: React.FC<ModalSuccessProps> = ({
  visible,
  onClose,
  text,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <SuccessText>{text}</SuccessText>
          <SuccessIcon>
            <FontAwesome name="check" size={50} color="white" />
          </SuccessIcon>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalSuccess;
