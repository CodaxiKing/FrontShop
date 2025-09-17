import React, { useContext, useEffect, useState } from "react";
import {
  ModalContainer,
  ModalHeader,
  Title,
  ButtonsContainer,
  ModalContent,
  ModalBody,
} from "./style";
import { Alert, Modal } from "react-native";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

import * as SQLite from "expo-sqlite";
import { RepresentanteItem } from "@/context/interfaces/RepresentanteItem";
import { CustomDropdown } from "@/components/SelectFieldComponent/CustomDropdown";
import AuthContext from "@/context/AuthContext";
const db = SQLite.openDatabaseSync("user_data.db");

interface ModalRepresentanteProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (representanteSelecionado: RepresentanteItem) => void;
}

const ModalRepresentante: React.FC<ModalRepresentanteProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const { userData, setUserData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;
  const codigo = userData?.codigo;

  const [representantes, setRepresentantes] = useState<RepresentanteItem[]>([]);
  const [representanteSelecionado, setRepresentanteSelecionado] =
    useState<RepresentanteItem | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchRepresentantes();
    }
  }, [isVisible]);

  const fetchRepresentantes = async () => {
    try {
      if (codigo) {
        const representantesQuery = `SELECT * FROM Representante WHERE Gerente = ? OR Supervisor = ? OR Diretor = ? ORDER BY nome;`;

        const representantesResult = (await db.getAllAsync(
          representantesQuery,
          [codigo, codigo, codigo]
        )) as RepresentanteItem[];

        // 🔍 Filtra representantes disponíveis com base na hierarquia
        const representantesFiltrados = representantesResult.filter(
          (rep) => rep.representanteId !== representanteId
        );

        setRepresentantes(representantesFiltrados);
      }
    } catch (error) {
      console.error("Erro ao buscar representantes:", error);
      Alert.alert("Erro", "Falha ao carregar representantes.");
    }
  };

  const handleConfirm = () => {
    if (!representanteSelecionado) {
      Alert.alert("Aviso", "Selecione um representante.");
      return;
    }

    onConfirm(representanteSelecionado);

    if (userData && setUserData) {
      setUserData({
        ...userData,
        representanteCreateId: representanteSelecionado.representanteId,
      });
    }
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <Title>Confirmação de Representante</Title>
          </ModalHeader>

          {/* Campo Representante */}

          <ModalBody>
            <CustomDropdown
              options={representantes.map((rep) => ({
                label: rep.nome,
                value: rep.representanteId,
              }))}
              selectedValue={representanteSelecionado?.representanteId || ""}
              onValueChange={(value) => {
                const representante = representantes.find(
                  (rep) => rep.representanteId === value
                );
                setRepresentanteSelecionado(representante || null);
              }}
            />
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

export default ModalRepresentante;
