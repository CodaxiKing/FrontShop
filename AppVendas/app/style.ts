import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
  padding: 20px; /* Adicione padding para telas menores */
`;

export const LogoContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

export const FormContainer = styled.View`
  width: 90%;
  height: auto;
  max-width: 600px; /* Limite máximo */
  min-width: 300px; /* Limite mínimo */
  background-color: #fff;
  align-items: center;
  border-radius: 10px;
  padding: 45px;

  /* Sombra para iOS */
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 4.65px;

  /* Sombra para Android */
  elevation: 4;
`;

export const LogoImage = styled.Image`
  width: 506px;
  max-height: 150px;
`;

export const InputLabel = styled.Text`
  font-size: 16px;
  height: 34px;
  align-self: flex-start;
  font-weight: bold;
  color: #000;
`;

export const Input = styled.TextInput`
  /* flex: 1; */
  width: 500px;
  height: 40px;
  font-size: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #ccc;
  margin-bottom: 15px;
  padding-left: 20px;
  background-color: #fff;
`;

export const LoginButtonContainer = styled.View`
  width: 100%;
  /* align-items: center; */
  align-items: flex-end;
  justify-content: center;
`;

export const BackButton = styled.TouchableOpacity`
  width: 213px;
  height: 50px;
  border-radius: 5px;
  background-color: rgb(204, 204, 204);
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;
export const LoginButton = styled.TouchableOpacity`
  width: 213px;
  height: 50px;
  border-radius: 5px;
  background-color: #000;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

export const VersionView = styled.View`
  position: absolute;
  bottom: 10px;
`;

export const VersionText = styled.Text`
  font-size: 10px;
`;
