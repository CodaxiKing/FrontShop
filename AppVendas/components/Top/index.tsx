// components/Top/index.tsx

import React, { useContext, useEffect, useState } from "react";
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
import Sidebar, { FiltrosAvancados } from "./Sidebar";
import ModalConfirmarLogout from "@/modal/ModalConfirmarLogout";
import { MalaDiretaSelecaoDestinatario } from "@/modal/MalaDireta";
import { useTopContext } from "../../context/TopContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useOrientation } from "../../context/OrientationContext";
import { getCartIconSize, getIconSize } from "@/helpers";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";
import AuthContext, { useAuth } from "@/context/AuthContext";
import { ModalConfigurarSincronizacao } from "@/modal/ModalConfigurarSincronizacao";
import CartBadge from "./CartBadge";

type TopNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TopRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

interface TopProps {
  showHomeIcon?: boolean;
  catalogOpen?: boolean;
}

const Top: React.FC<TopProps> = ({
  showHomeIcon = true,
  catalogOpen = false,
}) => {
  const [carrinhos, setCarrinhos] = useState<any[]>([]);
  const [filtrosSelecionados, setFiltrosSelecionados] =
    useState<FiltrosAvancados>({});

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
  const { userData, setUserData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

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
    isLoadingSync,
    handleCarrinhoNavigation,
    totalCarrinhosCount,
    carrinhosUpdated,
    updateCarrinhosCount,
  } = useTopContext();

  // console.log("Nome da Rota:", route.name);

  const isHomeScreen = route.name === "Home";
  const isCatalogoFechado = route.name === "CatalogoFechado";
  const isPedidos = route.name === "PedidosEmAberto";
  const isCarrinho = route.name === "Carrinho";
  const isSincronizacao = route.name === "Sincronizacao";
  const isMenuPrincipal = route.name === "Home";
  const isEditarPedidoCatalogoFechado =
    (route.name === "EditarPedidoCatalogoFechado" ||
      route.name === "EditarPedidoDetalhesDoProduto") &&
    isCatalogoFechado;
  const isEditarPedidoAberto = route.name === "EditarPedidoAberto";
  const isDetalhesDoProduto = route.name === "DetalhesDoProduto";
  const isDetalhePedidoSincronizado =
    route.name === "DetalhePedidoSincronizado";
  const isPedidosEmAberto = route.name === "PedidosEmAberto";
  const isListaDeClientes = route.name === "ListaDeClientes";
  const isMinhaBandeja = route.name === "MinhaBandeja";

  const EditarPedidoCatalogoFechado =
    route.name === "EditarPedidoCatalogoFechado";

  // rotas permitidas para exibir o ícone de carrinho
  const allowedRoutes =
    isCatalogoFechado || isSincronizacao || isPedidosEmAberto || isHomeScreen;

  // rotas nao permitidas para exibir o ícone de carrinho
  const shouldShowCartIcon =
    !isCarrinho &&
    !isEditarPedidoCatalogoFechado &&
    !isEditarPedidoAberto &&
    !isDetalhesDoProduto &&
    !catalogOpen && // se esse flag precisa ser respeitado
    allowedRoutes;

  // Sincronizar com o estado global
  useEffect(
    () => setCarrinhos(carrinhosUpdated),
    [carrinhosUpdated, totalCarrinhosCount]
  );

  return (
    <>
      <TopContainer>
        <TopContent>
          {!isLoadingSync && (
            <IconsContainerLeft>
              {!isHomeScreen && showHomeIcon && (
                <>
                  {EditarPedidoCatalogoFechado && (
                    <ButtonIconTop onPress={() => navigation.goBack()}>
                      <AntDesign
                        name="arrowleft"
                        size={iconSize}
                        color="white"
                      />
                    </ButtonIconTop>
                  )}
                  {isEditarPedidoCatalogoFechado ||
                  isEditarPedidoAberto ||
                  EditarPedidoCatalogoFechado ? null : (
                    <ButtonIconTop onPress={() => navigation.navigate("Home")}>
                      <Entypo name="home" size={iconSize} color="white" />
                    </ButtonIconTop>
                  )}

                  {!isEditarPedidoAberto && (
                    <ButtonIconTop
                      onPress={() =>
                        isCatalogoFechado || EditarPedidoCatalogoFechado
                          ? openSidebar()
                          : isPedidos
                          ? navigation.navigate("Home")
                          : navigation.goBack()
                      }
                    >
                      {isCatalogoFechado || EditarPedidoCatalogoFechado ? (
                        <Ionicons
                          name="filter-sharp"
                          size={iconSize}
                          color="white"
                        />
                      ) : (
                        !isSincronizacao &&
                        !isMinhaBandeja && (
                          <AntDesign
                            name="arrowleft"
                            size={iconSize}
                            color="white"
                          />
                        )
                      )}
                    </ButtonIconTop>
                  )}

                  {/* Ícone de filtro somente dentro do fluxo de EditarPedidoAberto */}
                </>
              )}
            </IconsContainerLeft>
          )}

          <LogoContainer>
            <Logo
              source={require("../../assets/images/logo/logo.png")}
              {...orientationValues}
            />
          </LogoContainer>
          {!isLoadingSync && (
            <IconsContainerRight>
              {isSincronizacao && (
                <ButtonIconTop
                  onPress={() => {
                    openSyncModal();
                  }}
                >
                  {/* <MaterialIcons
                    name="settings"
                    size={iconSize}
                    color="white"
                  /> */}
                </ButtonIconTop>
              )}

              {isCatalogoFechado && catalogOpen && (
                <ButtonIconTop onPress={openMalaDiretaModal}>
                  <MaterialIcons
                    name="quick-contacts-mail"
                    size={42}
                    color="white"
                  />
                </ButtonIconTop>
              )}

              {shouldShowCartIcon && (
                <DropdownContainer>
                  <DropdownToggle onPress={toggleDropdown}>
                    <View style={{ position: "relative" }}>
                      <FontAwesome5
                        name="shopping-cart"
                        size={cartIconSize}
                        color="white"
                      />
                      <CartBadge totalCarrinhos={totalCarrinhosCount} />
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
                          <DropdownText>
                            Nenhum carrinho encontrado
                          </DropdownText>
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
                              Carrinho de{" "}
                              {carrinho.razaoSocial || "Cliente não definido"}
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
          )}
        </TopContent>
      </TopContainer>
      {isSidebarVisible && (
        <Sidebar
          isVisible={isSidebarVisible}
          onClose={closeSidebar}
          filtrosSelecionados={filtrosSelecionados}
          setFiltrosSelecionados={setFiltrosSelecionados}
        />
      )}

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
