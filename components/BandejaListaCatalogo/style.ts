import styled from "styled-components/native";

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
