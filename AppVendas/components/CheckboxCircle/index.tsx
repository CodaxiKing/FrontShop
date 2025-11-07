import React, { useState } from "react";
import styled from "styled-components/native";
import { TouchableOpacity } from "react-native";

interface CheckboxProps {
  selected: boolean;
  onPress: () => void;
}

const CheckboxContainer = styled.TouchableOpacity<{ selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 2px solid ${({ selected }) => (selected ? "#006FFD" : "#ddd")};
  background-color: ${({ selected }) => (selected ? "#006FFD" : "transparent")};
  align-items: center;
  justify-content: center;
`;

const InnerCircle = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: white;
`;

const CheckboxCircle: React.FC<CheckboxProps> = ({ selected, onPress }) => {
  return (
    <CheckboxContainer selected={selected} onPress={onPress}>
      {selected && <InnerCircle />}
    </CheckboxContainer>
  );
};

export default CheckboxCircle;
