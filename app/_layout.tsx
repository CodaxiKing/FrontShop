import React, { useMemo } from "react";
import { router, Stack } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "../context/AuthContext";
import {
  OrientationProvider,
  useOrientation,
} from "@/context/OrientationContext";

import { TopProvider } from "@/context/TopContext";

import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider } from "styled-components";
import { ProdutoQuantidadeProvider } from "@/context/ProdutoQuantidadeContext";
import { EditarPedidoProdutoQuantidadeProvider } from "@/context/EditarPedidoProdutoQuantidadeContext";
import { EditarPedidoAbertoProvider } from "@/context/EditarPedidoAbertoContext";
import { MenuProvider } from "@/context/MenuProvider";
import { FiltroProvider } from "@/context/FiltroContext";

// Impede esconder automático da splash antes do app estar pronto
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useKeepAwake();

  //  Estes hooks estão sendo usados fora dos Providers
  // Eles só funcionam se o contexto tiver valor default.
  // Se quiser, refatoro para usá-los dentro dos Providers com um componente filho.
  const { isAuthenticated } = useAuth();
  const { isModoPaisagem, deviceType, width, height } = useOrientation();

  const [appReady, setAppReady] = useState(false);

  // Tema reativo às dimensões/orientação
  const theme = useMemo(
    () => ({ isModoPaisagem, deviceType, width, height }),
    [isModoPaisagem, deviceType, width, height]
  );

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  useEffect(() => {
    async function prepare() {
      await SplashScreen.hideAsync();
      setAppReady(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady && isAuthenticated) {
      // Você já está em /views/_layout.tsx, então esse replace pode ser desnecessário.
      // Mantive sua lógica original.
      router.replace("/views");
    }
  }, [appReady, isAuthenticated]);

  return (
    <>
      <StatusBar hidden={true} style="light" />
      <AuthProvider>
        <MenuProvider>
          <TopProvider>
            <FiltroProvider>
              <ProdutoQuantidadeProvider>
                <EditarPedidoProdutoQuantidadeProvider>
                  <EditarPedidoAbertoProvider>
                    {appReady ? (
                      <OrientationProvider>
                        <ThemeProvider theme={theme}>
                          <Stack
                            screenOptions={{
                              headerShown: false,
                              // ajuda a não repintar telas fora de foco
                              freezeOnBlur: true,
                              // solta telas inativas para reduzir custo
                              detachInactiveScreens: true,
                            }}
                          >
                            {/* Registre aqui qualquer tela que exija opção específica */}
                            {/* desmonta o catálogo ao perder foco */}
                            <Stack.Screen
                              name="CatalogoFechado"
                              options={{ unmountOnBlur: true }}
                            />
                            {/* Demais telas continuam herdando as options do Stack */}
                          </Stack>
                        </ThemeProvider>
                      </OrientationProvider>
                    ) : (
                      <></>
                    )}
                  </EditarPedidoAbertoProvider>
                </EditarPedidoProdutoQuantidadeProvider>
              </ProdutoQuantidadeProvider>
            </FiltroProvider>
          </TopProvider>
        </MenuProvider>
      </AuthProvider>
    </>
  );
}
