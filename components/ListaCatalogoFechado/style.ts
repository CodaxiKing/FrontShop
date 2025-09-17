import styled from "styled-components/native";

export const FormSearch = styled.View`
  width: 100%;
  flex-direction: row;
  gap: 5px;
  padding-top: 10;
  padding-horizontal: 10;
`;

// Container para as tags de filtro
export const FilterTagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding-horizontal: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

export const FilterTag = styled.TouchableOpacity`
  background-color: #e1f5fe;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
  padding: 6px 12px;
  margin: 4px;
`;

export const FilterTagText = styled.Text`
  color: #007bff;
  font-size: 12px;
  margin-right: 5px;
`;

const ContainerListaCard = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px auto;
  width: 100%;
`;

const CardCatalogo = styled.View`
  background-color: #fff;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 2em 1em;
  width: 32%;
`;

const CatalogoHeader = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const CatalogoBody = styled.View`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const ListaActionsCatalogo = styled.View`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 25px;
  padding: 10px;
  width: 45px;
`;

const ButtonActions = styled.TouchableOpacity`
  background-color: transparent;
`;

const ContainerImagem = styled.View`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 0;
  width: 80%;
`;

const FooterCatalogo = styled.View`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const ContainerButtonFooter = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  width: 100%;
`;

export {
  ContainerListaCard,
  CardCatalogo,
  CatalogoHeader,
  CatalogoBody,
  ListaActionsCatalogo,
  ContainerImagem,
  FooterCatalogo,
  ContainerButtonFooter,
  ButtonActions,
};
