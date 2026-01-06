import styled from "styled-components/native";

export const ModalContainer = styled.Pressable`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 16px;
`;

export const ModalContent = styled.View`
  width: 90%;
  max-width: 720px;
  /* min-height: 30%;
  max-height: 1000px;
  height: 80%; */
  overflow: hidden;
  background-color: #f1f1f1;
  border-radius: 10px;
  padding: 20px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 5;
`;

export const ModalHeader = styled.View`
  background-color: #fff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

export const ModalBody = styled.View`
  /* flex: 1; */
  min-height: auto;
  max-height: 85%;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
`;

export const StoreRow = styled.Pressable`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
`;

export const StoreText = styled.Text`
  font-size: 10px;
`;

export const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

export const Subtitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #007bff;
`;

export const FieldLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
`;

export const ButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

export const ContainerQuantidade = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 10px;
`;

export const ButtonText = styled.Text<{ variant: "primary" | "secondary" }>`
  font-size: 16px;
  font-weight: bold;
  color: ${({ variant }) => (variant === "primary" ? "#fff" : "#007bff")};
`;

export const ContainerTextItemPedido = styled.View`
  display: flex;
  flex-direction: column;
`;

export const InputQuantidade = styled.TextInput`
  background-color: #d9d9d9;
  border-radius: 5px;
  color: #000;
  padding: 4px;
  text-align: center;
  font-size: 10px;
`;

export const Button = styled.TouchableOpacity<{
  variant: "primary" | "secondary";
}>`
  flex: 1;
  height: 50px;
  margin: 0 5px;
  background-color: ${({ variant }) =>
    variant === "primary" ? "#007bff" : "#f1f1f1"};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`;
