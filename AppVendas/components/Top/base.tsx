import React, { useEffect, useState } from "react";
import {
  Entypo,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import {
  TopContainer,
  TopContent,
  IconsContainerLeft,
  LogoContainer,
  Logo,
  ButtonIconTop,
  IconsContainerRight,
  DropdownContainer,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  DropdownText,
} from "./style";
import Sidebar from "./Sidebar";
import ModalConfirmarLogout from "@/modal/ModalConfirmarLogout";
import { MalaDiretaSelecaoDestinatario } from "@/modal/MalaDireta";
import { useTopContext } from "../../context/TopContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useOrientation } from "../../context/OrientationContext";
import { getCartIconSize, getIconSize } from "@/helpers";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";
import { useAuth } from "@/context/AuthContext";
import { ModalConfigurarSincronizacao } from "@/modal/ModalConfigurarSincronizacao";
import * as SQLite from "expo-sqlite";
import CartBadge from "./CartBadge";

const db = SQLite.openDatabaseSync("user_data.db");

type TopNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TopRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

interface TopProps {
  showHomeIcon?: boolean;
}

const Top: React.FC<TopProps> = ({ showHomeIcon = true }) => {
  const [carrinhos, setCarrinhos] = useState<any[]>([]);
  const [totalCarrinhos, setTotalCarrinhos] = useState(0);

  const navigation = useNavigation<TopNavigationProp>();
  const route = useRoute<TopRouteProp>();
  const orientationValues = useOrientation();
  const iconSize = getIconSize(
    orientationValues.width,
    orientationValues.isModoPaisagem
  );
  const cartIconSize = getCartIconSize(
    orientationValues.width,
    orientationValues.isModoPaisagem
  );

  const { signOut } = useAuth();

  const isHomeScreen = route.name === "Home";
  const isCatalogo = route.name === "Catalogo";
  const isCatalogoFechado = route.name === "CatalogoFechado";
  const isPedidos = route.name === "PedidosEmAberto";
  const isCarrinho = route.name === "Carrinho";
  const isSincronizacao = route.name === "Sincronizacao";
  const isMenuPrincipal = route.name === "Home";

  const fetchCarrinhos = async () => {
    try {
      // Consulta para buscar todos os carrinhos
      // const carrinhosQuery = `SELECT id, razaoSocial, cnpj, clienteId FROM NovoPedido;`;
      const carrinhosQuery = `SELECT * FROM NovoPedido;`;
      const carrinhosResult = await db.getAllAsync(carrinhosQuery);
      setCarrinhos(carrinhosResult);

      // Atualiza o total de carrinhos
      setTotalCarrinhos(carrinhosResult.length);
    } catch (error) {
      console.error("Erro ao buscar carrinhos no banco de dados:", error);
    }
  };

  const fetchNomeCliente = async (carrinho: any) => {
    try {
      // Consulta para buscar o nome do cliente com base no clienteId ou cnpj
      const clienteQuery = `SELECT razaoSocial FROM CarteiraCliente WHERE codigo = ? OR cpfCnpj = ?;`;
      const clienteResult = await db.getFirstAsync(clienteQuery, [
        carrinho.clienteId,
        carrinho.cnpj,
      ]);

      return clienteResult || "Cliente não encontrado";
    } catch (error) {
      console.error("Erro ao buscar nome do cliente:", error);
      return "Erro ao carregar cliente";
    }
  };

  useEffect(() => {
    fetchCarrinhos();
  }, []);

  const {
    isSidebarVisible,
    openSidebar,
    closeSidebar,
    dropdownVisible,
    toggleDropdown,
    isMalaDiretaModalVisible,
    openMalaDiretaModal,
    closeMalaDiretaModal,
    isLogoutModalVisible,
    openLogoutModal,
    closeLogoutModal,
    openSyncModal,
    closeSyncModal,
    isSyncModalVisible,
    handleCarrinhoNavigation,
    // carrinhos,
  } = useTopContext();

  return (
    <>
      <TopContainer>
        <TopContent>
          <IconsContainerLeft>
            {!isHomeScreen && showHomeIcon && (
              <>
                <ButtonIconTop onPress={() => navigation.navigate("Home")}>
                  <Entypo name="home" size={iconSize} color="white" />
                </ButtonIconTop>

                <ButtonIconTop
                  onPress={() =>
                    isCatalogo || isCatalogoFechado
                      ? openSidebar()
                      : isPedidos
                      ? navigation.navigate("Home")
                      : navigation.goBack()
                  }
                >
                  {isCatalogo || isCatalogoFechado ? (
                    <Ionicons
                      name="filter-sharp"
                      size={iconSize}
                      color="white"
                    />
                  ) : (
                    <AntDesign name="arrowleft" size={iconSize} color="white" />
                  )}
                </ButtonIconTop>
              </>
            )}
          </IconsContainerLeft>
          <LogoContainer>
            <Logo
              source={require("@/assets/images/logo.png")}
              {...orientationValues}
            />
          </LogoContainer>
          <IconsContainerRight>
            {isSincronizacao && (
              <ButtonIconTop
                onPress={() => {
                  openSyncModal();
                }}
              >
                <MaterialIcons name="settings" size={iconSize} color="white" />
              </ButtonIconTop>
            )}

            {isCatalogo && (
              <ButtonIconTop onPress={openMalaDiretaModal}>
                <MaterialIcons
                  name="quick-contacts-mail"
                  size={42}
                  color="white"
                />
              </ButtonIconTop>
            )}

            {!isCarrinho && !isCatalogo && (
              <DropdownContainer>
                <DropdownToggle onPress={toggleDropdown}>
                  <View style={{ position: "relative" }}>
                    <FontAwesome5
                      name="shopping-cart"
                      size={cartIconSize}
                      color="white"
                    />
                    <CartBadge totalCarrinhos={totalCarrinhos} />
                  </View>
                  <Entypo
                    name={dropdownVisible ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="white"
                    style={{ marginLeft: 8 }}
                  />
                </DropdownToggle>
                {dropdownVisible && (
                  <DropdownMenu>
                    {carrinhos.length === 0 ? (
                      <DropdownItem isLastOrEmpty>
                        <DropdownText>Nenhum carrinho encontrado</DropdownText>
                      </DropdownItem>
                    ) : (
                      carrinhos.map((carrinho, index) => (
                        <DropdownItem
                          key={index}
                          isLastOrEmpty={index === carrinhos.length - 1}
                          onPress={async () => {
                            handleCarrinhoNavigation(carrinho);
                          }}
                        >
                          <DropdownText>
                            Carrinho de {carrinho.razaoSocial}
                          </DropdownText>
                        </DropdownItem>
                      ))
                    )}
                  </DropdownMenu>
                )}
              </DropdownContainer>
            )}
            {isMenuPrincipal && (
              <ButtonIconTop onPress={openLogoutModal}>
                <MaterialIcons
                  name="exit-to-app"
                  size={iconSize}
                  color="white"
                />
              </ButtonIconTop>
            )}
          </IconsContainerRight>
        </TopContent>
      </TopContainer>
      <Sidebar isVisible={isSidebarVisible} onClose={closeSidebar} />

      {isMalaDiretaModalVisible && (
        <MalaDiretaSelecaoDestinatario
          visible={isMalaDiretaModalVisible}
          onClose={closeMalaDiretaModal}
        />
      )}
      {isLogoutModalVisible && (
        <ModalConfirmarLogout
          visible={isLogoutModalVisible}
          onClose={closeLogoutModal}
          onConfirm={signOut}
        />
      )}
      {closeSyncModal && (
        <ModalConfigurarSincronizacao
          onClose={closeSyncModal}
          visible={isSyncModalVisible}
        />
      )}
    </>
  );
};

export default Top;
