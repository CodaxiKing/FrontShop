import styled from "styled-components/native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Container principal do modal
export const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
`;

// Conteúdo do modal
export const ModalContent = styled.View`
  width: 90%;
  max-height: 80%;
  background-color: #f1f1f1;
  padding: 20px;
  border-radius: 20px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 10px;
  elevation: 10;
`;

// Header do modal
export const ModalHeader = styled.View`
  background-color: #fff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

// Título do modal
export const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #000;
`;

// Header de cada loja
export const StoreContet = styled.View`
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

// Header de cada loja
export const StoreHeader = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

// Nome da loja
export const StoreTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

// Endereço da loja
export const StoreSubtitle = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

// Linha de cada produto
export const ProductRow = styled.View`
  background-color: #e9e9e9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 10px;
  padding: 10px;
`;

// Imagem do produto
export const ProductImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  margin-right: 10px;
  resize-mode: contain;
`;

// Detalhes do produto (nome e preço)
export const ProductDetails = styled.View`
  flex: 1;
`;

// Id do produto
export const ProductId = styled.Text`
  font-size: 14px;
  color: #000;
`;
export const ProductName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #000;
  margin-bottom: 10px;
`;

// Preço do produto
export const ProductPrice = styled.Text`
  font-size: 14px;
  color: #000;
  margin-top: 5px;
`;

export const ProductActions = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 14px;
`;

// Campo de quantidade
export const InputQuantity = styled.TextInput`
  width: 50px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
  font-size: 14px;
  color: #000;
  background-color: #d9d9d9;
  margin-right: 10px;
`;

// Container dos botões inferiores
export const ButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  /* padding: 15px 20px; */
  gap: 10px;
  /* background-color: #f9f9f9; */
`;

// Botão do modal
export const Button = styled.TouchableOpacity<{
  variant: "primary" | "secondary";
}>`
  flex: 1;
  height: 45px;
  background-color: ${({ variant }) =>
    variant === "primary" ? "#007bff" : "#ffffff"};
  border: ${({ variant }) =>
    variant === "primary" ? "none" : "1px solid #ddd"};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-right: ${({ variant }) => (variant === "primary" ? "0px" : "10px")};
`;

// Texto do botão
export const ButtonText = styled.Text<{ variant: "primary" | "secondary" }>`
  font-size: 16px;
  font-weight: bold;
  color: ${({ variant }) => (variant === "primary" ? "#ffffff" : "#007bff")};
`;
