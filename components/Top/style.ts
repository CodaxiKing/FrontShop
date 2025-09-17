import { Animated, Dimensions } from "react-native";
import styled from "styled-components/native";

const TopContainer = styled.View`
  background-color: #000;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
`;

const TopContent = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 50px;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
`;

const IconsContainerLeft = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 15px;
  margin-left: 20px;
  margin-top: -20px;
`;

const IconsContainerRight = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
  gap: 15px;
  margin-right: 20px;
  margin-top: -20px;
`;

const LogoContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin-top: -20px;
  margin-bottom: 10px;
`;

const Logo = styled.Image`
  height: 47px;
  width: 227px;
`;

const ButtonIconTop = styled.TouchableOpacity`
  background-color: transparent;
  padding: 10px;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  height: ${Dimensions.get("window").height}px;
  width: ${Dimensions.get("window").width}px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const SidebarContainer = styled.View`
  background-color: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 200px;
`;

const AnimatedSidebar = styled(Animated.View)`
  background-color: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 300px;
`;

const SidebarContent = styled.View`
  flex: 1;
  padding: 20px;
`;

const SidebarTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const DropdownContainer = styled.View`
  position: relative;
  z-index: 999 !important;
`;

const DropdownToggle = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const DropdownMenu = styled.View`
  position: absolute;
  top: 40px;
  right: 0px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  width: 320px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  align-items: center;
  justify-content: center;
  z-index: 999 !important;
  elevation: 3;
`;

const DropdownItem = styled.TouchableOpacity<{ isLastOrEmpty?: boolean }>`
  padding: 12px;
  font-size: 14px;
  color: #333;
  border-radius: 4px;
  border: 1px solid #d2d2d2;
  margin-bottom: ${(props) => (props.isLastOrEmpty ? "0px" : "14px")};
  background-color: #f9f9f9;
  width: 100%;
`;

const DropdownText = styled.Text`
  font-size: 14px;
  color: #333;
  text-align: center;
`;

export {
  TopContainer,
  TopContent,
  IconsContainerLeft,
  IconsContainerRight,
  LogoContainer,
  Logo,
  ButtonIconTop,
  Overlay,
  SidebarContainer,
  AnimatedSidebar,
  SidebarContent,
  SidebarTitle,
  DropdownContainer,
  DropdownMenu,
  DropdownItem,
  DropdownText,
  DropdownToggle,
};
