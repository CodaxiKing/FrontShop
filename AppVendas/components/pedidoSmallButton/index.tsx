import React from "react";
import { ButtonText, StyledButton } from "./style";

interface MenuButtonProps {
  text?: string;

  onPress?: () => void;
}

const PedidoSmallButton = ({ text, onPress }: MenuButtonProps) => {
  return (
    <StyledButton onPress={onPress}>
      <ButtonText>{text}</ButtonText>
    </StyledButton>
  );
};

export default PedidoSmallButton;
