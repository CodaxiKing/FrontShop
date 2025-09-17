import styled from "styled-components/native";
import { Animated } from "react-native";

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 5;
`;

export const Container = styled(Animated.View)`
  position: absolute;
  top: 108px;
  left: 0;
  bottom: 0;
  width: 40%;
  background-color: #f5f5f5;
  z-index: 10;
  elevation: 5;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
`;

export const Header = styled.View`
  width: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const SearchInput = styled.TextInput`
  /* flex: 1; */
  /* width: 100%; */
  margin-right: 10px;
  font-size: 16px;
  color: #333;
  background-color: transparent;
`;

export const OpenFilterButton = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 24px;
  margin-top: 5px;
  margin-right: 10px;
  margin-left: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  border-top-width: 1px;
  border-color: #ddd;
  background-color: #f5f5f5;
`;

export const FooterText = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const IconWrapper = styled.TouchableOpacity`
  padding: 8px;
  background-color: #eee;
  border-radius: 8px;
`;
