import styled from "styled-components/native";

  const ContainerMenu = styled.View`
  flex-direction: row;
  background-color: #fff;
  border-radius: 0px;
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

const ContentMenu = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
`;

const ContentStatus = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

export const ContentLogo = styled.View`
  background-color: #f0f0f0;
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
`;

const ContentText = styled.View`
  display: flex;
  flex-direction: column;
`;

const NameProfile = styled.Text`
  color: #23a6f0;
  font-size: 14px;
  font-weight: 600;
`;

const StatusConect = styled.Text`
  color: #252b42;
  font-size: 14px;
  font-weight: 600;
`;

const ContentTextMenu = styled.View`
  width: auto;
`;

const TextMenuMiddle = styled.Text`
  color: #252b42;
  /* font-size: 20px; */
  font-weight: 600;
`;

const ContentActions = styled.View`
  /* background-color: red; */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  gap: 20px;
  min-width: 25%;
`;

const ButtonActions = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 5px;
`;

export {
  ContainerMenu,
  ContentMenu,
  ContentStatus,
  ContentText,
  NameProfile,
  StatusConect,
  ContentTextMenu,
  TextMenuMiddle,
  ContentActions,
  ButtonActions,
};
