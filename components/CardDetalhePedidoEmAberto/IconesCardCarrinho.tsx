import React, { useState } from "react";
import {
  ContainerActionEmpresa,
  ButtonCardEmpresa,
  TextEmpresa,
} from "./style";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import ModalEndereco from "./ModalEndereco";
import ModalExpositor from "./ModalExpositor";
import ModalParcial from "./ModalParcial";

const IconesCardCarrinho: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalExpositorVisible, setModalExpositorVisible] = useState(false);
  const [modalParcialVisible, setModalParcialVisible] = useState(false);

  const [cep, setCep] = useState("21300-00");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectCep = (value: string) => {
    setCep(value);
    setDropdownVisible(false);
  };

  const ceps = ["21300-00", "22000-00", "23000-00"];

  return (
    <>
      <ContainerActionEmpresa>
        <ButtonCardEmpresa onPress={handleOpenModal}>
          <MaterialCommunityIcons
            name="map-marker-plus"
            size={30}
            color="black"
          />
          <TextEmpresa fontSize={14} weight={600}>
            Endereço
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => setModalExpositorVisible(true)}>
          <FontAwesome name="envelope" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Expositor
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => setModalParcialVisible(true)}>
          <FontAwesome name="search" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Pesquisar
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => {}}>
          <FontAwesome name="trash" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Remover
          </TextEmpresa>
        </ButtonCardEmpresa>
      </ContainerActionEmpresa>

      {/* Modais*/}
      <ModalEndereco
        visible={modalVisible}
        onClose={handleCloseModal}
        selectedCep={cep}
        onSelectCep={handleSelectCep}
        dropdownVisible={dropdownVisible}
        toggleDropdown={() => setDropdownVisible(!dropdownVisible)}
        ceps={ceps}
      />
      <ModalExpositor
        visible={modalExpositorVisible}
        onClose={() => setModalExpositorVisible(false)}
      />
      <ModalParcial
        visible={modalParcialVisible}
        onClose={() => setModalParcialVisible(false)}
      />
    </>
  );
};

export default IconesCardCarrinho;
