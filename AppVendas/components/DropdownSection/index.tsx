import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DropdownContainer,
  SectionContainer,
  SectionTitle,
  DropdownContent,
  DropdownItem,
  IconWrapper,
} from "./style";

interface DropdownSectionProps {
  title: string;
  items?: string[]; // Para listas simples
  customContent?: React.ReactNode; // Para conteúdo personalizado
  icon: JSX.Element;
  onItemPress?: (item: string) => void;
}

export const DropdownSection: React.FC<DropdownSectionProps> = ({
  title,
  items,
  customContent,
  icon,
  onItemPress,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <DropdownContainer>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <SectionContainer isExpanded={expanded}>
          <IconWrapper>{icon}</IconWrapper>
          <SectionTitle isExpanded={expanded}>{title}</SectionTitle>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#333"
          />
        </SectionContainer>
      </TouchableOpacity>
      {expanded && (
        <DropdownContent>
          {customContent
            ? customContent
            : items?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => onItemPress && onItemPress(item)}
                >
                  <DropdownItem>{item}</DropdownItem>
                </TouchableOpacity>
              ))}
        </DropdownContent>
      )}
    </DropdownContainer>
  );
};
