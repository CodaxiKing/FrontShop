import React, { useState } from "react";
import { RadioContainer, RadioCircle, InnerCircle, Label } from "./style";


interface RadioButtonProps {
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  selected,
  onSelect,
}) => {
  return (
    <RadioContainer onPress={() => onSelect(value)}>
      <RadioCircle selected={selected}>
        {selected && <InnerCircle />}
      </RadioCircle>
    </RadioContainer>
  );
};

export default RadioButton;
