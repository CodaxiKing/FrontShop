import React, { useState } from "react";
import { View, Text } from "react-native";
import styled from "styled-components/native";

const Container = styled.View`
  background-color: #fff;
  padding: 20px;
  width: 98%;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
`;

const OptionContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
`;

const RadioButton = styled.View<{ selected: boolean }>`
  width: 20px;
  height: 20px;
  border-width: 2px;
  border-color: #666;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const RadioSelected = styled.View`
  width: 12px;
  height: 12px;
  background-color: #000;
  border-radius: 6px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: #333;
`;

const PagamentoCard: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: "credit", label: "Cartão de Crédito" },
    { id: "billing", label: "Faturamento" },
    { id: "pix", label: "Pix" },
  ];

  return (
    <Container>
      <Title>Escolha a Forma de Pagamento</Title>
      <Subtitle>
        As informações devem ser inseridas após selecionar a forma de pagamento
      </Subtitle>
      {options.map((option) => (
        <OptionContainer
          key={option.id}
          onPress={() => setSelectedOption(option.id)}
        >
          <RadioButton selected={selectedOption === option.id}>
            {selectedOption === option.id && <RadioSelected />}
          </RadioButton>
          <OptionText>{option.label}</OptionText>
        </OptionContainer>
      ))}
    </Container>
  );
};

export default PagamentoCard;
