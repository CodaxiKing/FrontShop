import React from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { Entypo, AntDesign, IconProps } from "@expo/vector-icons";
import { ButtonIconTop } from "./style";

interface ButtonIconProps {
  onPress: (event: GestureResponderEvent) => void;
  IconComponent: React.ComponentType<IconProps>;
  iconName: string;
  iconSize?: number;
  iconColor?: string;
}

const ButtonIcon: React.FC<ButtonIconProps> = ({
  onPress,
  IconComponent,
  iconName,
  iconSize = 24, // Tamanho padrão do ícone
  iconColor = "black", // Cor padrão do ícone
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <IconComponent name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

interface ButtonGroupProps {
  navigation: { navigate: (route: string) => void };
  closeSidebar: () => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ navigation, closeSidebar }) => {
  return (
    <>
      <ButtonIcon
        onPress={() => navigation.navigate("Home")}
        IconComponent={Entypo}
        iconName="home"
        iconSize={42}
        iconColor="white"
      />
      <ButtonIcon
        onPress={closeSidebar}
        IconComponent={AntDesign}
        iconName="arrowleft"
        iconSize={42}
        iconColor="white"
      />
    </>
  );
};

export default ButtonGroup;
