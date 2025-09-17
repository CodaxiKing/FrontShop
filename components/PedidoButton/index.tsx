import React from "react";
import { ButtonText, StyledButton } from "./style";

interface MenuButtonProps {
  text?: string;
  bgColor?: string;
  onPress?: () => void;
}

const PedidoButton = ({ text, bgColor, onPress }: MenuButtonProps) => {
  return (
    <StyledButton bgColor={bgColor} onPress={onPress}>
      <ButtonText>{text}</ButtonText>
    </StyledButton>
  );
};

export default PedidoButton;
