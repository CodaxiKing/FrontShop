import React from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  ButtonContent,
  ButtonIcon,
  ButtonSubtitle,
  ButtonText,
  StyledButton,
  BottomBar,
} from "./style";
import { useNavigation } from "expo-router";
import { classifyDevice } from "@/helpers";
import { useOrientation } from "@/context/OrientationContext";

interface MenuButtonProps {
  text: string;
  subtitle: string;
  textButtonRoute?: string; // agora opcional
  iconName:
    | React.ComponentProps<typeof FontAwesome>["name"]
    | React.ComponentProps<typeof Ionicons>["name"];
  bgColor?: string;
  onPressCustom?: () => void; // novo
}

const MenuPrincipalButton: React.FC<MenuButtonProps> = ({
  text,
  subtitle,
  textButtonRoute,
  iconName,
  bgColor,
  onPressCustom,
}) => {
  const navigation = useNavigation();
  const deviceType = classifyDevice();
  const orientationValues = useOrientation();

  const handlePress = () => {
    if (onPressCustom) {
      onPressCustom();
    } else if (textButtonRoute) {
      navigation.navigate(textButtonRoute as never, {
        pedidoId: 0,
        catalogOpen: true,
      } as never);
    }
  };

  return (
    <StyledButton
      {...orientationValues}
      activeOpacity={0.7}
      bgColor={bgColor || "#23a6f0"}
      onPress={handlePress}
    >
      <ButtonContent>
        <ButtonIcon>
          {iconName in FontAwesome.glyphMap ? (
            <FontAwesome
              name={iconName as keyof typeof FontAwesome.glyphMap}
              size={
                deviceType === "largeTablet"
                  ? 80
                  : deviceType === "mediumTablet"
                  ? 70
                  : 60
              }
              color="rgba(255, 255, 255, 0.5)"
            />
          ) : (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={
                deviceType === "largeTablet"
                  ? 80
                  : deviceType === "mediumTablet"
                  ? 70
                  : 60
              }
              color="rgba(255, 255, 255, 0.5)"
            />
          )}
        </ButtonIcon>
        <ButtonText>{text}</ButtonText>
        <ButtonSubtitle>{subtitle}</ButtonSubtitle>
      </ButtonContent>
      <BottomBar>
        <FontAwesome
          name="arrow-circle-right"
          size={24}
          color="rgba(255, 255, 255, 0.8)"
        />
      </BottomBar>
    </StyledButton>
  );
};

export default MenuPrincipalButton;
