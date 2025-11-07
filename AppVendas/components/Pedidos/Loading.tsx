import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const LoadingPedidos: React.FC = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
      }}
    >
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Carregando pedidos ...</Text>
    </View>
  );
};

export default LoadingPedidos;
