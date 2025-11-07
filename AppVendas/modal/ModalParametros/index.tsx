import React, { useEffect, useState } from "react";
import { Modal, View, Text } from "react-native";
import { Switch, TextInput } from "react-native";
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ButtonCancel,
  ButtonSave,
  ButtonTextCancel,
  ButtonTextSave,
  InputContainer,
  Label,
  BoxContainer,
} from "./style";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useParametros } from "@/context/ParametrosContext";

interface ParametrosModalProps {
  visible: boolean;
  onClose: () => void;
}

const ParametrosModal: React.FC<ParametrosModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    exibirPreVenda,
    exibirDesconto,
    pilotarReajuste,
    porcentagemReajuste,
    setParametros,
  } = useParametros();

  const [localExibirPreVenda, setLocalExibirPreVenda] =
    useState(exibirPreVenda);
  const [localExibirDesconto, setLocalExibirDesconto] =
    useState(exibirDesconto);
  const [localPilotarReajuste, setLocalPilotarReajuste] =
    useState(pilotarReajuste);
  const [localPorcentagemReajuste, setLocalPorcentagemReajuste] =
    useState(porcentagemReajuste);

  useEffect(() => {
    if (visible) {
      setLocalExibirPreVenda(exibirPreVenda);
      setLocalExibirDesconto(exibirDesconto);
      setLocalPilotarReajuste(pilotarReajuste);
      setLocalPorcentagemReajuste(porcentagemReajuste);
    }
  }, [
    visible,
    exibirPreVenda,
    exibirDesconto,
    pilotarReajuste,
    porcentagemReajuste,
  ]);

  const handleSave = () => {
    // Atualiza os parâmetros no contexto com os valores
    try {
      setParametros({
        exibirPreVenda: localExibirPreVenda,
        exibirDesconto: localExibirDesconto,
        pilotarReajuste: localPilotarReajuste,
        porcentagemReajuste: localPorcentagemReajuste,
      });
    } catch (error) {
      console.error("Erro ao atualizar parâmetros:", error);
    } finally {
      // Fecha o modal após salvar
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ModalContainer>
        <BoxContainer>
          <ModalHeader>
            <ModalTitle>Parâmetros</ModalTitle>
          </ModalHeader>

          <ModalBody>
            <InputContainer>
              <Label>Exibir Pré-Venda</Label>
              <Switch
                value={localExibirPreVenda}
                onValueChange={setLocalExibirPreVenda}
              />
            </InputContainer>
            <InputContainer>
              <Label>Exibir Flag de desconto</Label>
              <Switch
                value={localExibirDesconto}
                onValueChange={setLocalExibirDesconto}
              />
            </InputContainer>
            <InputContainer>
              <Label>Pilotar Reajuste</Label>
              <Switch
                value={localPilotarReajuste}
                onValueChange={setLocalPilotarReajuste}
              />
            </InputContainer>
            <InputContainer>
              <Label>Valor de Reajuste (%)</Label>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: localPilotarReajuste ? "#ccc" : "#e2e2e2",
                  backgroundColor: localPilotarReajuste ? "white" : "#e0e0e0",
                  borderRadius: 10,
                  padding: 5,
                  width: 100,
                  textAlign: "center",
                }}
                value={localPorcentagemReajuste.toString()}
                onChangeText={(text) =>
                  setLocalPorcentagemReajuste(parseFloat(text) || 0)
                }
                keyboardType="numeric"
                editable={localPilotarReajuste}
              />
            </InputContainer>
          </ModalBody>

          <ModalFooter>
            <ConfirmacaoModalButton
              text="Cancelar"
              variant="exit"
              onPress={onClose}
            />
            <ConfirmacaoModalButton text="Salvar" onPress={handleSave} />
          </ModalFooter>
        </BoxContainer>
      </ModalContainer>
    </Modal>
  );
};

export default ParametrosModal;
