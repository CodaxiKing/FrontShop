import React from "react";
import { ContainerMenuPrincipal } from "./style";
import MenuPrincipalButton from "../MenuPrincipalButton";
import { ScrollView } from "react-native";

const MenuPrincipal: React.FC = () => {
  return (
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
          // bgColor="#ff8f8f"
        />
        <MenuPrincipalButton
          text="Sincronização"
          subtitle="Dados Offline"
          textButtonRoute={"Sincronizacao"}
          iconName={"cloud-upload"}
          bgColor="#00BCD4"
        />
      </ContainerMenuPrincipal>
    </ScrollView>
  );
};

export default MenuPrincipal;
