import styled from "styled-components/native";
import { Modal } from "react-native";

const StyledModal = styled(Modal)``;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 60%;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.3;
  shadow-radius: 5px;
`;

const Header = styled.View`
  margin-bottom: 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const StoreSelection = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
`;

const StoreList = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ContainerList = styled.View`
  border: 1px solid #ddd;
  border-radius: 15px;
  flex-direction: row;
  flex-wrap: wrap;
  /* align-items: center; */
  justify-content: space-around;
  padding: 10px 15px;
`;

const StoreOption = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 12px 18px;
  border-radius: 25px;
  margin: 5px;
  background-color: ${(props) => (props.selected ? "#b3dbff" : "#f9f9f9")};
  border: ${(props) => (props.selected ? "1px solid #eee" : "1px solid #ddd")};
`;

const StoreText = styled.Text<{ selected: boolean }>`
  font-weight: ${(props) => (props.selected ? "600" : "400")};
  font-size: 16px;
  text-align: center;
`;

const Footer = styled.View`
  flex-direction: row;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ActionButton = styled.TouchableOpacity<{ outlined?: boolean }>`
  padding: 12px 25px;
  border-radius: 5px;
  background-color: ${(props) => (props.outlined ? "#fff" : "#007bff")};
  border: ${(props) => (props.outlined ? "1px solid #007bff" : "none")};
  elevation: 3;
`;

const ActionButtonText = styled.Text<{ outlined?: boolean }>`
  color: ${(props) => (props.outlined ? "#007bff" : "#fff")};
  font-size: 16px;
  font-weight: 600;
`;

export {
  StyledModal,
  ModalContainer,
  ModalContent,
  Header,
  Title,
  StoreSelection,
  Label,
  StoreList,
  StoreOption,
  StoreText,
  Footer,
  ActionButton,
  ActionButtonText,
  ContainerList,
};
