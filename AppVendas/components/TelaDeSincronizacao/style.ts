import styled from "styled-components/native";

export const Container = styled.View`
  /* width: 97%; */
  flex: 1;
  margin: 20px;
  background-color: #f1f1f1;
  border-radius: 10px;
`;

export const Content = styled.View`
  border-radius: 10px;
  background-color: #fff;
  padding: 20px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const UserLogoContainer = styled.View`
  border-radius: 50px;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
`;

export const UserLogo = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  border-width: 2px;
  border-color: #bdbdbd;
  align-items: center;
  justify-content: center;
  padding: 5px;
  margin: 5px;
  margin-top: -20px;
`;

export const HeaderTextContainer = styled.View`
  flex-direction: column;
  justify-content: center;
`;

export const CompanyName = styled.Text`
  color: #23a6f0;
  font-weight: bold;
`;

export const SyncEnvironment = styled.Text`
  color: #252b42;
`;

export const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

export const StatusIndicator = styled.View<{ isOnline: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-right: 5px;
  background-color: ${({ isOnline }) => (isOnline ? "green" : "red")};
`;

export const AppStatus = styled.Text<{ isOnline: boolean }>`
  color: ${({ isOnline }) => (isOnline ? "green" : "red")};
`;

export const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const SyncInfo = styled.Text`
  color: #000;
  text-align: right;
`;

export const SyncAllButton = styled.TouchableOpacity`
  margin-left: 10px;
`;

export const CardContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 15px;
  padding: 20px;
`;

export const Card = styled.View`
  width: 48%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
  position: relative;
`;
