import styled from "styled-components/native";
import { Text } from "react-native";

export const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.9); /* Transparência mais escura */
  justify-content: center;
  align-items: center;
  padding: 50px 0;
`;

export const ContentContainer = styled.View`
  width: 85%;
  height: 100%;
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 10px;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 10px;
  elevation: 5;

  /* height: 100svh; */
`;

export const ContainerTitle = styled.View`
  background-color: #fff;
  border-radius: 10px;
  margin: 10px auto;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: #000;
  padding: 20px;
`;

export const DestinatariosContainer = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  align-items: center;
  justify-content: space-between;
`;

export const ProductsContainer = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  flex-direction: row;
  justify-content: space-between;
`;

export const CheckBoxContainer = styled.View`
  flex-direction: column;
  align-items: flex-start;
  margin-top: 10px;
  margin-left: 10px;
  width: 40%;
`;

export const Subtitle = styled(Text)`
  font-size: 16px;
  text-align: left;
  color: #444;
  margin-bottom: 20px;
  font-weight: 600;
`;

export const Input = styled.TextInput`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 22px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #000;
  width: 100%;
`;

export const TextArea = styled.TextInput`
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1px 22px 0 22px;
  font-size: 14px;
  color: #000;
  height: 140px;
  width: 100%;
`;

export const CardContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  max-width: 48%;
`;

export const Card = styled.TouchableOpacity`
  width: 48%;
  flex-direction: row;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 2;
`;

export const CardImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 10px;
`;

export const CardInfo = styled.View`
  flex: 1;
`;

export const CardTitle = styled(Text)`
  font-weight: bold;
  color: #000;
  margin-bottom: 4px;
`;

export const CardSubtitle = styled(Text)`
  font-size: 12px;
  color: #666;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
  width: 100%;
`;

export const ButtonText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #fff;
`;

export const ProductInfo = styled.View`
  margin: 10px 0;
`;

export const FormContainer = styled.View`
  width: 100%;
  margin-top: 10px;
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  justify-content: center;
  min-height: 180px;
`;

export const ContainerSearch = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
  width: 98%;
`;
