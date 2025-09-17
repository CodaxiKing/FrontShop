import React from "react";
import { Modal, FlatList } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalTitle,
  Input,
  Row,
  InputSmall,
  ButtonRow,
  ButtonClose,
  ButtonSelect,
  ButtonText,
  ButtonTextBlue,
  Dropdown,
  DropdownItem,
  DropdownText,
  DropdownButton,
  DropdownButtonContent,
} from "./style.modal";
import { Feather } from "@expo/vector-icons";

interface ModalEnderecoProps {
  visible: boolean;
  onClose: () => void;
  selectedCep: string;
  onSelectCep: (value: string) => void;
  dropdownVisible: boolean;
  toggleDropdown: () => void;
  ceps: string[];
}

const ModalEndereco: React.FC<ModalEnderecoProps> = ({
  visible,
  onClose,
  selectedCep,
  onSelectCep,
  dropdownVisible,
  toggleDropdown,
  ceps,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalTitle>Seleção de Endereço</ModalTitle>

          {/* Dropdown Manual */}
          <Dropdown>
            <DropdownButton onPress={toggleDropdown}>
              <DropdownButtonContent>
                <DropdownText>{selectedCep}</DropdownText>
                <Feather
                  name={dropdownVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#333"
                />
              </DropdownButtonContent>
            </DropdownButton>
            {dropdownVisible && (
              <FlatList
                data={ceps}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <DropdownItem onPress={() => onSelectCep(item)}>
                    <DropdownText>{item}</DropdownText>
                  </DropdownItem>
                )}
              />
            )}
          </Dropdown>

          {/* Campos desabilitados */}
          <Row>
            <InputSmall
              placeholder="Estado"
              value="Rio de Janeiro"
              editable={false}
            />
            <InputSmall
              placeholder="Município"
              value="Rio de Janeiro"
              editable={false}
            />
          </Row>
          <Row>
            <InputSmall placeholder="Bairro" value="Alameda" editable={false} />
            <InputSmall placeholder="Número" value="100" editable={false} />
          </Row>
          <Row>
            <InputSmall
              placeholder="Endereço"
              value="Rua Alameda dos Anjos"
              editable={false}
            />
            <InputSmall
              placeholder="Complemento"
              value="Apartamento 10001"
              editable={false}
            />
          </Row>

          <ButtonRow>
            {/* Botão Fechar */}
            <ButtonClose onPress={onClose}>
              <ButtonTextBlue>Fechar</ButtonTextBlue>
            </ButtonClose>

            {/* Botão Selecionar */}
            <ButtonSelect onPress={onClose}>
              <ButtonText>Selecionar</ButtonText>
            </ButtonSelect>
          </ButtonRow>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalEndereco;
