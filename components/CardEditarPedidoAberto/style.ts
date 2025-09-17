import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface EnderecoEmpresaProps {
  weight?: number;
  fontSize?: number;
}

const ContainerCardEmpresa = styled.View`
  flex: 1;
  max-width: 100%;
`;

const ContentCardEmpresa = styled.View`
  background-color: #fff;
  border-radius: 10px;
  margin: 25px auto;
  padding: 10px;
  position: relative;
  width: 100%;
`;

const HeaderCardEmpresa = styled.View`
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: row;
  margin-bottom: 10px;
`;

const ContainerNomeEmpresa = styled.View`
  width: 61%;
  max-width: ${width * 0.61}px;
  padding-left: 20px;
`;

const ContainerActionEmpresa = styled.View`
  padding-right: 30px;
  display: flex;
  justify-content: flex-end;
  /* align-items: center; */
  flex-direction: row;
  gap: 15px;
  width: 40%;
  max-width: ${width * 0.4}px;
`;

const TextEmpresa = styled.Text<EnderecoEmpresaProps>`
  color: #000;
  font-size: ${({ fontSize }) => `${fontSize || Math.round(width * 0.04)}px`};
  font-weight: ${({ weight }) => weight || 400};
`;

const ButtonCardEmpresa = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
`;

const ButtonClose = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 80px;
  position: absolute;
  right: ${-Math.round(width * 0.05)}px;
  top: ${-Math.round(height * 0.04)}px;
`;

const ContainerPedido = styled.View`
  display: flex;
  flex-direction: column;
`;

const ItemPedido = styled.View`
  background-color: #e9e9e9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 10px;
  padding: 10px;
`;

const ImagemProdutoContainer = styled.View`
  background-color: #fff;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const ImagemProduto = styled.Image`
  border-radius: 10px;
  /* margin-right: 10px; */
  height: 100px;
  width: 100px;
  resize-mode: contain;
`;

const DetalhesPedido = styled.View`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 80%;
`;

const ContainerTextItemPedido = styled.View`
  display: flex;
  flex-direction: column;
`;

const ContainerQuantidade = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 10px;
`;

const InputQuantidade = styled.TextInput`
  background-color: #d9d9d9;
  border-radius: 5px;
  color: #000;
  padding: 10px;
  text-align: center;
`;

const ContainerFooterCard = styled.View`
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 auto;
  padding: 18px;
  width: 100%;
`;

const ContainerButtonsFooter = styled.View`
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  justify-content: center;
  margin: 20px auto;
  padding: 18px;
  width: 100%;
`;

export const ContainerButtonsSaveAndCancel = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  margin: 20px auto;
  padding: 10px;
  width: 98%;
`;

export const ButtonAddNewProducts = styled.TouchableOpacity`
  background-color: transparent;
  border: 1px solid #006ffd;
  padding: 10px;
  border-radius: 12px;
  width: 30%;
  align-items: center;
`;
export const ButtonCancel = styled.TouchableOpacity`
  background-color: transparent;
  border: 1px solid #006ffd;
  padding: 10px;
  border-radius: 12px;
  width: 20%;
  align-items: center;
`;

export const ButtonConfirm = styled.TouchableOpacity`
  background-color: #006ffd;
  border-radius: 5px;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  padding: 10px;
  align-items: center;
  width: 20%;
  border-radius: 12px;
`;
export const ButtonChangePaymentMethod = styled.TouchableOpacity`
  background-color: transparent;
  border: 1px solid #006ffd;
  padding: 10px;
  border-radius: 5px;
  width: 30%;
  align-items: center;
  border-radius: 12px;
`;

export const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  text-align: center;
`;

export const ButtonTextBlue = styled(ButtonText)`
  color: #006ffd;
`;

const Container = styled.View`
  background-color: #fff;
  padding: 20px;
  width: 98%;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
`;

const OptionContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
`;

const RadioButton = styled.View<{ selected: boolean }>`
  width: 20px;
  height: 20px;
  border-width: 2px;
  border-color: #666;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const RadioSelected = styled.View`
  width: 12px;
  height: 12px;
  background-color: #000;
  border-radius: 6px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: #333;
`;

export {
  ContainerCardEmpresa,
  ContentCardEmpresa,
  ContainerButtonsFooter,
  HeaderCardEmpresa,
  ContainerNomeEmpresa,
  ContainerActionEmpresa,
  TextEmpresa,
  ButtonCardEmpresa,
  ButtonClose,
  ContainerPedido,
  ItemPedido,
  ImagemProduto,
  DetalhesPedido,
  ContainerTextItemPedido,
  ContainerQuantidade,
  InputQuantidade,
  ContainerFooterCard,
  Container,
  Title,
  Subtitle,
  OptionContainer,
  RadioButton,
  RadioSelected,
  OptionText,
};
