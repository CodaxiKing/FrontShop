import React from "react";
import { Container, Label, StyledInput, LoadingContainer } from "./style";
import { ActivityIndicator } from "react-native";

interface InputProps {
  label?: string;
  placeholder: string;
  width?: string;
  height?: string;
  weight?: string;
  value?: string | number;
  onChangeText?: (text: string) => void;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  isLoading?: boolean;
  validateRange?: boolean; // Nova propriedade para ativar a validação de intervalo
}

const InputFieldComponent: React.FC<InputProps> = ({
  label,
  placeholder,
  width,
  height,
  value,
  onChangeText,
  disabled,
  weight,
  secureTextEntry,
  keyboardType = "default",
  isLoading = false,
  validateRange = false, // Valor padrão é false
}) => {
  // Função para validar o valor
  const handleChangeText = (text: string) => {
    if (validateRange) {
      // Remove caracteres não numéricos
      const numericValue = text.replace(/[^0-9]/g, "");

      // Converte para número
      const number = parseInt(numericValue, 10);

      // Verifica se o número está dentro do intervalo (1 a 200)
      if (!isNaN(number) && number >= 1 && number <= 200) {
        onChangeText?.(numericValue); // Atualiza o valor apenas se estiver válido
      } else if (numericValue === "") {
        onChangeText?.(""); // Permite que o campo seja limpo
      }
    } else {
      onChangeText?.(text); // Mantém o comportamento original
    }
  };

  return (
    <Container>
      {label && <Label weight={weight}>{label}</Label>}
      <StyledInput
        placeholder={placeholder}
        width={width}
        height={height}
        value={value?.toString()}
        onChangeText={handleChangeText}
        editable={!disabled}
        disabled={disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={validateRange ? "numeric" : keyboardType} // Força teclado numérico se validateRange for true
        maxLength={validateRange ? 3 : undefined} // Limita a 3 dígitos se validateRange for true
      />
      {isLoading && (
        <LoadingContainer>
          <ActivityIndicator size="small" color="#007bff" />
        </LoadingContainer>
      )}
    </Container>
  );
};

export default InputFieldComponent;
