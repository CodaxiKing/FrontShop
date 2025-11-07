import styled from "styled-components/native";

export const Container = styled.View`
  background-color: #eff6ff;
`;

// Contêiner do Dropdown
export const DropdownContainer = styled.View`
  background-color: #ffffff;
  padding: 15px;
  margin: 5px 10px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #ddd;
  /* shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2; */
`;

// Ícone ao lado do título
export const IconWrapper = styled.View`
  margin-right: 10px;
`;

// Título do Dropdown
export const SectionContainer = styled.View<{ isExpanded: boolean }>`
  width: 100%; /* Garante que ocupe toda a largura */
  background-color: ${(props) =>
    props.isExpanded ? "#EFF6FF" : "transparent"};
  flex-direction: row;
  align-items: center;
  justify-content: space-between; /* Espaço entre o título e o ícone */
  padding: 10px; /* Espaçamento interno para o ícone e título */
  border-radius: 8px; /* Opcional: arredondar os cantos */
`;
export const SectionTitle = styled.Text<{ isExpanded: boolean }>`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => (props.isExpanded ? "#007bff" : "#333")};
`;

// Contêiner dos itens do Dropdown
export const DropdownContent = styled.View`
  margin-top: 10px;
`;

// Itens do Dropdown
export const DropdownItem = styled.Text`
  margin-bottom: 8px;
  font-size: 14px;
  letter-spacing: 0.5px;
`;
