import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface SelectFieldProps {
  label?: string | number;
  selectedValue: string | number;
  options: { label: string; value: string | number }[];
  onValueChange: (value: string | number) => void;
  width?: string;
  height?: string;
}

export const CustomDropdown: React.FC<SelectFieldProps> = ({
  options,
  selectedValue,
  onValueChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // console.log("options", options);

  return (
    <View style={styles.container}>
      {/* Botão que abre o Modal */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          if (options.length > 0) {
            setModalVisible(true);
          }
        }}
        disabled={options.length === 0} // 🔹 Impede abrir se não houver opções
      >
        <Text style={styles.selectedText}>
          {options.length > 0
            ? options.find((opt) => opt.value === selectedValue)?.label ||
              "Selecione"
            : "Nenhuma opção disponível"}
          {/* 🔹 Mensagem se não houver opções */}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={14}
          color={options.length > 0 ? "#555" : "#aaa"} // 🔹 Ícone mais claro se desabilitado
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Modal que exibe as opções */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          {/* 🔹 Captura o toque fora do modal para fechá-lo */}
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {options.length === 0 ? ( // 🔹 Exibe mensagem se não houver opções
                <Text style={styles.noOptionsText}>
                  Nenhuma opção disponível
                </Text>
              ) : (
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => {
                    const isSelected = item.value === selectedValue;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.option,
                          isSelected && styles.selectedOption, // 🔹 Aplica estilo ao selecionado
                        ]}
                        onPress={() => {
                          onValueChange(item.value);
                          setModalVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedOptionText, // 🔹 Muda cor do texto
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// 🔹 Estilos personalizáveis
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdownButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    flexDirection: "row", // 🔹 Faz com que o texto e o ícone fiquem lado a lado
    alignItems: "center",
    justifyContent: "space-between", // 🔹 Mantém o texto à esquerda e o ícone à direita
  },
  selectedText: {
    fontSize: 16,
  },
  icon: {
    marginLeft: 8, // 🔹 Pequeno espaçamento entre o texto e o ícone
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    maxHeight: "60%",
    borderRadius: 10,
    paddingVertical: 10,
    padding: 20,
  },
  noOptionsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedOption: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
  },
  optionText: {
    fontSize: 18,
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
