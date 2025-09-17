import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import ConfirmacaoModalButton from '@/components/ConfirmacaoModalButton';

// import { Container } from './styles';

const ErroAdicao: React.FC = () => {
    const navigation = useNavigation();
  return(
    <View style={{ alignItems: "center", marginTop: 50 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#000",
            textAlign: "center",
          }}
        >
          Este carrinho está vazio.
        </Text>
        <Text style={{ fontSize: 16, color: "#000", textAlign: "center" }}>
          Adicione produtos para continuar.
        </Text>
        <View style={{ marginTop: 60 }}>
          <ConfirmacaoModalButton
            text="Voltar "
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
  );
}

export default ErroAdicao;