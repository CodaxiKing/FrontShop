import styled from "styled-components/native";

interface ModalContentProps {
  isModoPaisagem: boolean;
  deviceWidth: number;
}

export const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
`;

export const ModalContent = styled.View<ModalContentProps>`
  width: 80%;
  height: ${({ isModoPaisagem }) => (isModoPaisagem ? "30%" : "20%")};

  /* height: 30%; */
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  align-items: center;
  justify-content: center;

  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 10px;
  elevation: 5;
`;

export const ModalTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 40px;
`;

export const ModalButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  height: 80px;
`;

export const ModalCancelButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 5px;
  background-color: #f1f1f1;
  margin-right: 10px;
  align-items: center;
  justify-content: center;
`;

export const ModalButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 5px;
  background-color: #ff4f45;
  align-items: center;
  justify-content: center;
`;

export const ModalButtonText = styled.Text<{ color: string }>`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.color};
`;
