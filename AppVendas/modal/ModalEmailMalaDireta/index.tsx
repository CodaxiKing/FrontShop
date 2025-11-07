import React, { useEffect, useState } from "react";
import {
  ModalContainer,
  ModalHeader,
  Title,
  ButtonsContainer,
  ModalContent,
  ModalBody,
  Input,
} from "./style";
import { Alert, Modal, ScrollView, View, StyleSheet } from "react-native";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { Chip, TextInput } from "react-native-paper";

interface ModalEmailMalaDiretaProps {
  isVisible: boolean;
  emails: string[];
  onClose: () => void;
  onConfirm: (emailInserido: string[]) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ModalEmailMalaDireta: React.FC<ModalEmailMalaDiretaProps> = ({
  isVisible,
  onClose,
  emails,
  onConfirm,
}) => {
  const [emailInserido, setEmailInserido] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      setEmailInserido(emails);
    }
  }, [isVisible, emails]);

  const addEmail = (raw: string) => {
    const email = raw.trim();
    if (!email) return;
    if (!emailRegex.test(email)) {
      setError(`"${email}" não é um e-mail válido`);
      return;
    }
    if (emailInserido.includes(email)) {
      setError(`"${email}" já foi adicionado`);
      return;
    }
    setEmailInserido((prev) => [...prev, email]);
    setError(null);
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === "," || nativeEvent.key === "Enter") {
      addEmail(inputText.replace(/,$/, ""));
      setInputText("");
    }
  };

  const handleBlur = () => {
    if (inputText) {
      addEmail(inputText);
      setInputText("");
    }
  };

  const handleRemove = (email: string) => {
    setEmailInserido((prev) => prev.filter((e) => e !== email));
    setError(null);
  };

  const handleConfirm = () => {
    if (emailInserido.length === 0) {
      Alert.alert("Atenção", "Por favor, insira pelo menos um e-mail.");
      return;
    }

    // Envia lista para o pai
    onConfirm(emailInserido);
    // Fecha modal
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <Title>Insira o email</Title>
          </ModalHeader>

          <ModalBody>
            <View style={styles.chipContainer}>
              {emailInserido.map((email) => (
                <Chip
                  key={email}
                  style={styles.chip}
                  onClose={() => handleRemove(email)}
                >
                  {email}
                </Chip>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Insira o email e pressione Enter"
              autoCapitalize="none"
              placeholder="Digite e pressione Enter"
              value={inputText}
              onChangeText={setInputText}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              error={!!error}
              outlineColor="#ddd"
              activeOutlineColor="#000"
              style={styles.input}
            />
            {error ? (
              <View style={styles.errorContainer}>
                <Title style={styles.errorText}>{error}</Title>
              </View>
            ) : null}
          </ModalBody>

          {/* Botões */}
          <ButtonsContainer>
            <ConfirmacaoModalButton
              text="Fechar"
              variant="exit"
              onPress={onClose}
            />
            <ConfirmacaoModalButton
              text="Confirmar"
              variant="confirm"
              onPress={handleConfirm}
            />
          </ButtonsContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#006efd6f", // cor de fundo do chip
  },
  input: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
  },

  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    color: "#B00020", // padrão de erro do Paper
    fontSize: 12,
  },
});

export default ModalEmailMalaDireta;
