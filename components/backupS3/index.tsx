import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onSubmit: (password: string) => void;
};

export default function PasswordPrompt({
  visible,
  title = "Confirmação necessária",
  message = "Digite a senha para continuar:",
  onCancel,
  onSubmit,
}: Props) {
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (visible) setPwd("");
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={{
        flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center", justifyContent: "center"
      }}>
        <View style={{
          width: "85%", maxWidth: 400, borderRadius: 14, backgroundColor: "#fff",
          padding: 18
        }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>{title}</Text>
          <Text style={{ color: "#555", marginBottom: 12 }}>{message}</Text>

          <TextInput
            value={pwd}
            onChangeText={setPwd}
            placeholder="Senha"
            secureTextEntry
            autoFocus
            style={{
              borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
              paddingHorizontal: 12, paddingVertical: 10,
              fontSize: 16, backgroundColor: "#fafafa"
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
            <TouchableOpacity onPress={onCancel} style={{ paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={{ color: "#666", fontWeight: "600" }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSubmit(pwd)}
              style={{
                paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#6C63FF",
                borderRadius: 8
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
