import React from "react";
import { Picker } from "@react-native-picker/picker";
import { Container, Label, StyledPicker, PickerContainer } from "./style";

interface SelectFieldProps {
  label?: string | number;
  tipo?: string;
  selectedValue: string | number;
  options: { label: string; value: string | number }[];
  onValueChange: (value: string | number) => void;
  width?: string;
  height?: string;
  margin?: string;
}

const SelectFieldComponent: React.FC<SelectFieldProps> = ({
  label,
  selectedValue,
  options,
  onValueChange,
  width,
  height,
  margin,
}) => {
  return (
    <Container>
      {label && <Label>{label}</Label>}
      <PickerContainer width={width} height={height}>
        <StyledPicker
          margin={margin}
          selectedValue={selectedValue}
          onValueChange={(item) => onValueChange(item as string | number)}
        >
          {options.map(
            (option: {
              label: string;
              value: string | number;
              tipo?: string;
            }) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            )
          )}
        </StyledPicker>
      </PickerContainer>
    </Container>
  );
};

export default SelectFieldComponent;
