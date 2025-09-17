import React from "react";
import { Modal } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalTitle,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableFooter,
  ButtonRow,
  ButtonClose,
  ButtonText,
} from "./style.modal.pesquisa";

interface ModalTabelaProps {
  visible: boolean;
  onClose: () => void;
}

const ModalParcial: React.FC<ModalTabelaProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalTitle>Parcial do Pedido: Loja Exemplo</ModalTitle>

          {/* Tabela */}
          <Table>
            {/* Cabeçalho */}
            <TableHeader>
              <TableRow>
                <TableCell header>Marca</TableCell>
                <TableCell masculine header center>
                  Qtd
                </TableCell>
                <TableCell masculine header center>
                  R$
                </TableCell>
                <TableCell feminine header center>
                  Qtd
                </TableCell>
                <TableCell feminine header center>
                  R$
                </TableCell>
                <TableCell unissex header center>
                  Qtd
                </TableCell>
                <TableCell unissex header center>
                  R$
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Corpo */}
            <TableRow>
              <TableCell>Steel</TableCell>
              <TableCell masculine center>
                1
              </TableCell>
              <TableCell masculine center>
                139.50
              </TableCell>
              <TableCell feminine center>
                1
              </TableCell>
              <TableCell feminine center>
                119.50
              </TableCell>
              <TableCell unissex center>
                0
              </TableCell>
              <TableCell unissex center>
                0.00
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SkyMaster</TableCell>
              <TableCell masculine center>
                1
              </TableCell>
              <TableCell masculine center>
                275.00
              </TableCell>
              <TableCell feminine center>
                1
              </TableCell>
              <TableCell feminine center>
                300.00
              </TableCell>
              <TableCell unissex center>
                0
              </TableCell>
              <TableCell unissex center>
                0.00
              </TableCell>
            </TableRow>

            {/* Rodapé */}
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell masculine center>
                  2
                </TableCell>
                <TableCell masculine center>
                  414.50
                </TableCell>
                <TableCell feminine center>
                  2
                </TableCell>
                <TableCell feminine center>
                  419.50
                </TableCell>
                <TableCell unissex center>
                  0
                </TableCell>
                <TableCell unissex center>
                  0.00
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell footer>Total: Qtd 8</TableCell>
                <TableCell footer center>
                  Total: R$ 834.00
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {/* Botão Fechar */}
          <ButtonRow>
            <ButtonClose onPress={onClose}>
              <ButtonText>Fechar</ButtonText>
            </ButtonClose>
          </ButtonRow>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalParcial;
