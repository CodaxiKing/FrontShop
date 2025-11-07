import React from "react";
import { Text, View } from "react-native";
import CheckBox from "@/components/Checkbox";
import { Subtitle } from "@/modal/MalaDireta/style";

interface CheckboxGroupProps {
  value: { [key: string]: boolean };
  onToggle: (option: string) => void;
  isModoPaisagem: boolean;
}

const labelMapping: { [key: string]: string } = {
  sendReferencia: "Código",
  sendCaixa: "Caixa",
  sendPulseira: "Pulseira",
  sendResistencia: "Resistencia",
  sendCodigoBarra: "Codigo de Barra",
  sendNCM: "NCM",
  sendValor: "Valor",
  sendPDF: "PDF",
  sendExcel: "Excel",
  sendEmail: "Email",
};

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  onToggle,
  isModoPaisagem,
}) => {
  const pdfExcelOptions = ["sendPDF", "sendExcel"];
  const otherOptions = Object.keys(value).filter(
    (option) => !pdfExcelOptions.includes(option) && option !== "sendEmail"
  );

  return (
    <View>
      <View style={{ width: 300 }}>
        {!isModoPaisagem ? (
          // Modo retrato: exibe tudo em coluna
          otherOptions.map((option) => (
            <View key={option} style={{ marginBottom: 10 }}>
              <CheckBox
                label={labelMapping[option] || option}
                isChecked={value[option]}
                onPress={() => onToggle(option)}
              />
            </View>
          ))
        ) : (
          // 🟥 Modo paisagem: duas colunas
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 20 }}>
              {otherOptions
                .slice(0, Math.ceil(otherOptions.length / 2))
                .map((option) => (
                  <View key={option} style={{ marginBottom: 10 }}>
                    <CheckBox
                      label={labelMapping[option] || option}
                      isChecked={value[option]}
                      onPress={() => onToggle(option)}
                    />
                  </View>
                ))}
            </View>
            <View style={{ flex: 1, marginLeft: 20 }}>
              {otherOptions
                .slice(Math.ceil(otherOptions.length / 2))
                .map((option) => (
                  <View key={option} style={{ marginBottom: 10 }}>
                    <CheckBox
                      label={labelMapping[option] || option}
                      isChecked={value[option]}
                      onPress={() => onToggle(option)}
                    />
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>

      {/* PDF e Excel sempre em uma linha horizontal */}
      <Text style={{ fontWeight: "bold", marginTop: 20 }}>
        Formato do Arquivo:
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 15,
          gap: 10,
        }}
      >
        {pdfExcelOptions.map((option) => (
          <View key={option} style={{ flex: 1 }}>
            <CheckBox
              label={labelMapping[option] || option}
              isChecked={value[option]}
              onPress={() => onToggle(option)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default CheckboxGroup;
