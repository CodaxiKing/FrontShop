import React from "react";
import { Button, ButtonText } from "./style";

interface ButtonProps {
  text?: string;
  onPress?: () => void;
  variant?: "confirm" | "exit";
  disabled?: boolean;
  width?: string;
}

const ConfirmacaoModalButton = ({
  text,
  onPress,
  variant = "confirm",
  disabled,
  width,
}: ButtonProps) => {
  return (
    <Button onPress={onPress} variant={variant} disabled={disabled}>
      <ButtonText variant={variant}>{text}</ButtonText>
    </Button>
  );
};

export default ConfirmacaoModalButton;
