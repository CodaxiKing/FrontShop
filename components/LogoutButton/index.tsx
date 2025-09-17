import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  ButtonContainer,
  ButtonIcon,
  ButtonText,
  ButtonSubtitle,
  StyledButton,
  ArrowIcon,
} from "./style";

interface LogoutButtonProps {
  text?: string;
  subtitle?: string;
}

const LogoutButton = ({ text = "Sair", subtitle }: LogoutButtonProps) => {
  const { signOut } = useAuth();

  return (
    <StyledButton onPress={signOut}>
      <ButtonContainer>
        <ButtonIcon>
          <Ionicons name="power-outline" size={28} color="#ffffff" />
        </ButtonIcon>
        <ButtonText>{text}</ButtonText>
        {subtitle && <ButtonSubtitle>{subtitle}</ButtonSubtitle>}
      </ButtonContainer>
      <ArrowIcon>
        <FontAwesome name="angle-right" size={24} color="#fff" />
      </ArrowIcon>
    </StyledButton>
  );
};

export default LogoutButton;
