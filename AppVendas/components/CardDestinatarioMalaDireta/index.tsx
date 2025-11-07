import React from "react";
import {
  ImageSourcePropType,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  CardContainer,
  Logo,
  InfoContainer,
  IdText,
  NameText,
  EmailText,
  CheckBoxWrapper,
} from "./style";
import CheckBox from "../Checkbox";

export interface CompanyCardProps {
  codigo: string;
  name: string;
  email: string;
  logo: ImageSourcePropType;
  selected: boolean;
  onSelect: () => void;
}

const CardDestinatarioMalaDireta: React.FC<CompanyCardProps> = ({
  logo,
  codigo,
  name,
  email,
  selected,
  onSelect,
}) => {
  const emailSplited = email.split(";");

  return (
    <CardContainer>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Logo
          source={require("@/assets/images/avatar/avatarClienteMalaDireta.png")}
        />
        <InfoContainer>
          <IdText>#{codigo}</IdText>
          <NameText>{name}</NameText>
          <EmailText>{emailSplited[0]}</EmailText>
        </InfoContainer>
      </View>

      <CheckBoxWrapper>
        <CheckBox label="" isChecked={selected} onPress={onSelect} />
      </CheckBoxWrapper>
    </CardContainer>
  );
};

export default React.memo(
  CardDestinatarioMalaDireta,
  (prev, next) =>
    prev.codigo === next.codigo &&
    prev.name === next.name &&
    prev.email === next.email &&
    prev.selected === next.selected
);
