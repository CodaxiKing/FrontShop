import React from "react";
import {
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import {
  ButtonClose,
  ContainerNomeEmpresa,
  TextEmpresa,
  ContainerActionEmpresa,
  ButtonCardEmpresa,
} from "./style";

interface EmpresaHeaderProps {
  nome: string;
  endereco: string;
}

const EmpresaHeader: React.FC<EmpresaHeaderProps> = ({ nome, endereco }) => (
  <>
    <ButtonClose>
      <AntDesign name="closecircle" size={24} color="red" />
    </ButtonClose>
    <ContainerNomeEmpresa>
      <TextEmpresa fontSize={16} weight={700}>
        {nome}
      </TextEmpresa>
      <TextEmpresa fontSize={14} weight={400}>
        {endereco}
      </TextEmpresa>
    </ContainerNomeEmpresa>
    <ContainerActionEmpresa>
      <ButtonCardEmpresa>
        <MaterialCommunityIcons
          name="map-marker-plus"
          size={30}
          color="black"
        />
        <TextEmpresa fontSize={14} weight={600}>
          Endereço
        </TextEmpresa>
      </ButtonCardEmpresa>
      <ButtonCardEmpresa>
        <FontAwesome name="envelope" size={24} color="black" />
        <TextEmpresa fontSize={14} weight={600}>
          Expositor
        </TextEmpresa>
      </ButtonCardEmpresa>
      <ButtonCardEmpresa>
        <FontAwesome name="search" size={24} color="black" />
        <TextEmpresa fontSize={14} weight={600}>
          Endereço
        </TextEmpresa>
      </ButtonCardEmpresa>
    </ContainerActionEmpresa>
  </>
);

export default EmpresaHeader;
