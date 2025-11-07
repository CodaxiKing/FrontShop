import { Picker } from "@react-native-picker/picker";
import React from "react";
import { View, Text } from "react-native";

interface SelectFieldProps {
  label: string;
  selectedValue: number | string;
  onValueChange: (itemValue: number | string) => void;
  options: {
    label: string;
    value: number | string;
  }[];
}

const SelectFieldDropdown: React.FC<SelectFieldProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ marginBottom: 5, color: "#333" }}>{label}</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          height: 50,
          justifyContent: "center",
        }}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          style={{ color: "#929292" }}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default SelectFieldDropdown;
