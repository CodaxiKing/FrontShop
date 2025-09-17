// app/views/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { ModalProvider } from "@/context/ModalContext";
import { PaperProvider } from "react-native-paper";
import { ParametrosProvider } from "@/context/ParametrosContext";
import { ClientInfoProvider } from "@/context/ClientInfoContext";

export default function TabLayout() {
  return (
    <ClientInfoProvider>
      <ParametrosProvider>
        <ModalProvider>
          <PaperProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                // evita redesenho de tela fora de foco
                freezeOnBlur: true,
                // solta as telas que não estão visíveis
                detachInactiveScreens: true,
              }}
            >
              <Stack.Screen name="Home" />
              <Stack.Screen name="Carrinho" />

              {/* Telas pesadas: desmontar ao sair */}

              {/* <Stack.Screen
                name="Catalogo"
                options={{ unmountOnBlur: true }}
              /> */}

              <Stack.Screen
                name="CatalogoFechado"
                options={{ unmountOnBlur: true }}
                
              />

              <Stack.Screen name="PedidosEmAberto" />
              <Stack.Screen name="DetalhePedidoAberto" />
              <Stack.Screen name="DetalhePedidoSincronizado" />
              <Stack.Screen name="Pagamento" />
              <Stack.Screen name="EditarPedidoPagamento" />
              {/* <Stack.Screen name="EditarPedidoCatalogoFechado" /> */}
              <Stack.Screen name="CopiarPedido" />
              <Stack.Screen name="MinhaBandeja" />
              <Stack.Screen name="CriarBandejaVendedor" />
              <Stack.Screen name="EditarBandejaVendedor" />
              <Stack.Screen name="EditarPedidoAberto" />
            </Stack>
          </PaperProvider>
        </ModalProvider>
      </ParametrosProvider>
    </ClientInfoProvider>
  );
}
