import React from 'react';
import { View, Text} from 'react-native';

// import { Container } from './styles';

const ErroSelecao: React.FC = () => {
    return (
        <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#000",
                    textAlign: "center",
                }}
            >
                Nenhum carrinho selecionado.
            </Text>
            <Text style={{ fontSize: 16, color: "#000", textAlign: "center" }}>
                Por favor, selecione um carrinho disponível.
            </Text>
        </View>
    );
}

export default ErroSelecao;