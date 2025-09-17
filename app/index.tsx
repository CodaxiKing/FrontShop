import React, { useState, useEffect  } from "react";
import RNPickerSelect from "react-native-picker-select";
import { useAuth } from "../context/AuthContext";

import {
  Container,
  LogoContainer,
  LogoImage,
  LoginButton,
  ButtonText,
  FormContainer,
  LoginButtonContainer,
  VersionView,
  VersionText,
  BackButton,
} from "./style";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { CONFIGS } from "@/constants/Configs";
import InputFieldComponent from "@/components/InputFieldComponent";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const LoginScreen = () => {
  const {
    signIn,
    filiais,
    selectFilial, // confirma + navega
    goBackToLogin,
  } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);

  const isConnected = useNetworkStatus();
  console.log("Aplicação Online?:", isConnected);


  const handleLogin = () => {
    if (!username && !password) {
      Alert.alert("Aviso", "Usuário e(ou) Senha incorretos, tente novamenete.");
      return;
    }
    signIn(username, password, setLoadingLogin);
  };

  const handleConfirmSelect = () => {
    // console.log("Filial Selecionada: ", selectedCodigo);
    if (!selectedCodigo) {
      return Alert.alert("Aviso", "Selecione uma filial.");
    }
    setLoadingSelect(true);
    setTimeout(() => {
      selectFilial(selectedCodigo);
      setLoadingSelect(false);
    }, 2000);
  };

  const handleGoBackToLogin = () => {   
    setSelectedCodigo(null);
    goBackToLogin();
  };

  // useEffect(() =>{
  //   //setUsername("junior@grupotechnos.com.br");
  //   setUsername("isnaildo@grupotechnos.com.br");
  //   setPassword("dasdsadsadasdasdsa");
  // })
  
  
  return (
    <>
      <Container>
        {!filiais.length ? (
          // fase de login normal
          <FormContainer>
            <LogoContainer>
              <LogoImage
                source={require("../assets/images/logo/technosLogoLogin.png")}
                resizeMode="contain"
              />
            </LogoContainer>

            <InputFieldComponent
              label="Nome"
              value={username}
              onChangeText={setUsername}
              placeholder="Digite seu nome de usuário"
              weight="800"
            />
            <InputFieldComponent
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              weight="800"
              secureTextEntry
            />

            <LoginButtonContainer>
              <LoginButton onPress={handleLogin} disabled={loadingLogin}>
                {loadingLogin ? (
                  <>
                    <ActivityIndicator color="#fff" />
                    {/* <ButtonText>Carregando</ButtonText> */}
                  </>
                ) : (
                  <ButtonText>Login</ButtonText>
                )}
              </LoginButton>
            </LoginButtonContainer>
          </FormContainer>
        ) : (
          // fase de seleção de regional
          <FormContainer>
            <LogoContainer>
              <LogoImage
                source={require("../assets/images/logo/technosLogoLogin.png")}
                resizeMode="contain"
              />
            </LogoContainer>

            <View style={{ width: "100%" }}>
              <Text style={{ marginBottom: 8 }}>Selecione a Regional</Text>
              <RNPickerSelect
                onValueChange={(valor) => {
                  if (valor) {
                    setSelectedCodigo(valor as string);
                  } else {
                    setSelectedCodigo(null);
                  }
                }}
                items={filiais.map((f) => ({
                  label: f.filialDescricao,
                  value: f.filialCodigo,
                }))}
                placeholder={{ label: "Toque para selecionar...", value: null }}
                style={{
                  inputIOS: {
                    fontSize: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                  },
                  inputAndroid: {
                    fontSize: 14,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                  },
                }}
                value={selectedCodigo}
                useNativeAndroidPickerStyle={false}
              />
            </View>

            <View
              style={{
                marginTop: 16,
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <BackButton
                onPress={handleGoBackToLogin}
                style={{ marginTop: 16 }}
              >
                <ButtonText style={{ color: "#000000" }}>Voltar</ButtonText>
              </BackButton>
              <LoginButton
                disabled={!selectedCodigo || loadingSelect}
                onPress={handleConfirmSelect}
                style={[{ marginTop: 16 }]}
              >
                {loadingSelect ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ButtonText>
                    {selectedCodigo ? "Selecionar" : "Selecione uma filial"}
                  </ButtonText>
                )}
              </LoginButton>
            </View>
          </FormContainer>
        )}

        <VersionView>
          <VersionText>{CONFIGS.APP_VERSION}</VersionText>
        </VersionView>
      </Container>
    </>
  );
};

export default LoginScreen;
