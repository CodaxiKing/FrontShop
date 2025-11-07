import React, { useState } from "react";
import { ContainerMenuPrincipal } from "./style";
import MenuPrincipalButton from "../MenuPrincipalButton";
import { ScrollView, Alert } from "react-native";
import { backupDbToS3 } from "@/core/backup/backupDbToS3";
import PasswordPrompt from "../backupS3"; // import Modal Alerta Password

const SHOW_BACKUP_BUTTON = true;
const BACKUP_PASSWORD = "adm123";

const MenuPrincipal: React.FC = () => {
  const [promptOpen, setPromptOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleBackupFlow = async () => {
    try {
      if (busy) return;
      setBusy(true);
      Alert.alert("📦 BACKUP → S3 (INÍCIO) ⬆️", "Pode continuar navegando normalmente...");
      const fileKey = await backupDbToS3();
      Alert.alert("📦 BACKUP → S3 (CONCLUÍDO) ✅", `Banco enviado para S3 com sucesso:\n\n${fileKey}`);
    } catch (e: any) {
      Alert.alert("Erro no Backup ❌", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ScrollView>
        <ContainerMenuPrincipal>
          <MenuPrincipalButton
            text="Pedidos"
            subtitle="Novo Pedido / Pré Venda / Sincronizados"
            textButtonRoute={"PedidosEmAberto"}
            iconName={"shopping-cart"}
            bgColor="#2196F3"
          />
          <MenuPrincipalButton
            text="Vitrine"
            subtitle="Catálogo de Produtos / Mala Direta"
            textButtonRoute={"CatalogoFechado"}
            iconName={"shopping-bag"}
            bgColor="#4CAF50"
          />
          <MenuPrincipalButton
            text="Clientes"
            subtitle="Carteira de Clientes"
            textButtonRoute={"ListaDeClientes"}
            iconName={"users"}
            bgColor="#FF9800"
          />
          <MenuPrincipalButton
            text="Minhas bandejas"
            subtitle="Produtos Selecionados"
            textButtonRoute={"MinhaBandeja"}
            iconName={"file-tray-full"}
            bgColor="#DC4D4D"
          />
          <MenuPrincipalButton
            text="Sincronização"
            subtitle="Dados Offline"
            textButtonRoute={"Sincronizacao"}
            iconName={"cloud-upload"}
            bgColor="#00BCD4"
          />

          {SHOW_BACKUP_BUTTON && (
            <MenuPrincipalButton
              text="Backup"
              subtitle={busy ? "Enviando..." : "Exportar banco local p/ S3"}
              iconName="database"
              bgColor="#6C63FF"
              onPressCustom={() => {
                if (busy) return;
                setPromptOpen(true); // abre prompt de senha
              }}
            />
          )}
        </ContainerMenuPrincipal>
      </ScrollView>

      {/* Prompt de senha */}
      <PasswordPrompt
        visible={promptOpen}
        title="Confirmar Backup"
        message="Digite a senha de administrador para iniciar o envio do banco local para a nuvem."
        onCancel={() => setPromptOpen(false)}
        onSubmit={(pwd) => {
          if (pwd === BACKUP_PASSWORD) {
            setPromptOpen(false);
            handleBackupFlow(); // segue para o fluxo já existente
          } else {
            Alert.alert("Senha inválida", "A senha informada está incorreta.");
          }
        }}
      />
    </>
  );
};

export default MenuPrincipal;
