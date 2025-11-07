import React, { useEffect, useState } from "react";
import { Modal } from "react-native";
import { Switch, TextInput } from "react-native";
import {
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  InputContainer,
  Label,
  BoxContainer,
  LabelBold,
  InputContainerNaoEncontrou,
  LabelNaoEncontrou,
} from "./style";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useParametros } from "@/context/ParametrosContext";

import * as SQLite from "expo-sqlite";
import { CarteiraClienteItem } from "@/context/interfaces/CarteiraClienteItem";
const db = SQLite.openDatabaseSync("user_data.db");

interface ParametrosModalProps {
  isVisible: boolean;
  codigoCliente: string;
  codigoProduto: string;
  onClose: () => void;
}

export const ModalInformacoesCompra: React.FC<ParametrosModalProps> = ({
  isVisible,
  codigoCliente,
  codigoProduto,
  onClose,
}) => {
  const [historicoCompraData, setHistoricoCompraData] = useState([]);

  const getHistoricoCompra = async (codigoCliente: string) => {
    const queryHistorico = `SELECT * FROM HistoricoCompraCliente 
    WHERE codigoCliente = '${codigoCliente}' AND codigoProduto = '${codigoProduto}'
    ORDER BY dataVenda DESC LIMIT 1
    `;
    const queryHistoricoResult = await db.getAllAsync(queryHistorico);

    setHistoricoCompraData(queryHistoricoResult);
  };

  const handleSave = () => {
    onClose();
  };

  function formatarData(isoString) {
    const data = new Date(isoString);

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");

    return `${dia}-${mes}-${ano} às ${hora}:${minuto}`;
  }

  useEffect(() => {
    getHistoricoCompra(codigoCliente);
  }, []);

  return (
    <>
      <Modal visible={isVisible} transparent animationType="fade">
        <ModalContainer>
          <BoxContainer>
            <ModalHeader>
              <ModalTitle>Historico Compra Cliente</ModalTitle>
            </ModalHeader>

            {historicoCompraData.length > 0 ? (
              <ModalBody>
                <InputContainer>
                  <Label>Já Comprou?</Label>
                </InputContainer>
                <InputContainer>
                  <LabelBold>
                    {historicoCompraData.length > 0 ? "Sim" : "Não"}
                  </LabelBold>
                </InputContainer>
                <InputContainer>
                  <Label>Data da Última compra nos últimos 12 meses:</Label>
                </InputContainer>
                <InputContainer>
                  <LabelBold>
                    {historicoCompraData[0].dataProcessamento
                      ? formatarData(historicoCompraData[0].dataProcessamento)
                      : "N/A"}
                  </LabelBold>
                </InputContainer>
                <InputContainer>
                  <Label>Quantidade Comprada?</Label>
                </InputContainer>
                <InputContainer>
                  <LabelBold>
                    {historicoCompraData[0].quantidade} unidade(s)
                  </LabelBold>
                </InputContainer>
              </ModalBody>
            ) : (
              <ModalBody>
                <InputContainerNaoEncontrou>
                  <LabelNaoEncontrou>Sem histórico de compra</LabelNaoEncontrou>
                </InputContainerNaoEncontrou>
              </ModalBody>
            )}

            <ModalFooter>
              <ConfirmacaoModalButton text="Sair" onPress={onClose} />
            </ModalFooter>
          </BoxContainer>
        </ModalContainer>
      </Modal>
    </>
  );
};
