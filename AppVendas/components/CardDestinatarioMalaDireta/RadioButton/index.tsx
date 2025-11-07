import React from "react";
import { TouchableOpacity } from "react-native";
import { InnerCircle, OuterCircle } from "./style";

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
}

const RadioButton = ({ selected, onPress }: RadioButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <OuterCircle>{selected && <InnerCircle />}</OuterCircle>
    </TouchableOpacity>
  );
};

export default RadioButton;
