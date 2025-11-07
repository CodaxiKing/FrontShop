import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface EnderecoEmpresaProps {
  weight?: number;
  fontSize?: number;
}

const ContainerCardEmpresa = styled.View`
  flex: 1;
  /* width: 100%; */
  /* background-color: red; */
  /* max-width: 100%; */
  /* margin: 0 10px; */
  /* width: 100%; */
  /* max-width: ${width * 0.96}px; */
`;

const ContentCardEmpresa = styled.View`
  background-color: #fff;
  border-radius: 10px;
  margin: 25px auto;
  padding: 10px;
  position: relative;
  width: 100%;
  max-width: ${width * 0.98}px;
`;

const HeaderCardEmpresa = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 10px;
`;

const ContainerNomeEmpresa = styled.View`
  width: 61%;
  max-width: ${width * 0.61}px;
`;

const ContainerActionEmpresa = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 15px;
  width: 40%;
  max-width: ${width * 0.4}px;
`;

export const HeaderLabel = styled.View`
  /* display: flex; */
  align-self: center;
  width: 100%;
  margin: 20px 0;
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
`;

export const HeaderText = styled.Text`
  color: #000;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
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
  width: 100%;
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
  height: 100px;
  width: 100px;
  object-fit: contain;
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
  padding: 10px;
  width: 100%;
  max-width: ${width * 0.98}px;
`;

const ContainerButtonsFooter = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  justify-content: center;
  margin: 0 auto;
  padding: 10px;
  width: 98%;
`;

export const ButtonCancel = styled.TouchableOpacity`
  background-color: transparent;
  border: 1px solid #006ffd;
  padding: 10px;
  border-radius: 5px;
  width: 30%;
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
  width: 30%;
`;

export const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  text-align: center;
`;

export const ButtonTextBlue = styled(ButtonText)`
  color: #006ffd;
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
  ImagemProdutoContainer,
  ImagemProduto,
  DetalhesPedido,
  ContainerTextItemPedido,
  ContainerQuantidade,
  InputQuantidade,
  ContainerFooterCard,
};
