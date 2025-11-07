// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Retorna `true` enquanto houver conexão à internet.
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Observa mudanças no status de rede
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    // Inicializa com o valor atual
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}
