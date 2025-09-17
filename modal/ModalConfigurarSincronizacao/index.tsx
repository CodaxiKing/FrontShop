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

interface ConfiguracaoSincronizacaoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ModalConfigurarSincronizacao: React.FC<
  ConfiguracaoSincronizacaoModalProps
> = ({ visible, onClose }) => {
  const [intervalo, setIntervalo] = useState("1800");
  const [sincronizacaoAutomatica, setSincronizacaoAutomatica] =
    useState<boolean>(false);

  const handleSave = () => {
    console.log("Intervalo:", intervalo);
    console.log("Sincronização Automática:", sincronizacaoAutomatica);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <ModalOverlay>
        <ModalContainer>
          <ModalContent>
            <SectionContainer>
              <SectionHeader>Configuração de Sincronização</SectionHeader>
            </SectionContainer>
            <SectionContainer>
              <InputFieldComponent
                placeholder="1800"
                label="Intervalo de sincronização automática (Em Segundos)"
                value={intervalo}
                onChangeText={setIntervalo}
              />

              <CheckboxContainer>
                <TouchableOpacity
                  style={{ marginRight: 10 }}
                  onPress={() =>
                    setSincronizacaoAutomatica(!sincronizacaoAutomatica)
                  }
                >
                  <CheckBox
                    label="Sincronização Automática?"
                    isChecked={sincronizacaoAutomatica}
                    onPress={() =>
                      setSincronizacaoAutomatica(!sincronizacaoAutomatica)
                    }
                  />
                </TouchableOpacity>
              </CheckboxContainer>
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
              text="Salvar"
              variant="confirm"
              onPress={handleSave}
              width="100"
            />
          </ButtonContainer>
        </ModalContainer>
      </ModalOverlay>
    </Modal>
  );
};
