import styled from "styled-components/native";

export const ContainerMenu = styled.View`
  flex-direction: row;
  background-color: #fff;
  border-radius: 0px;
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const ContentStatus = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
`;

export const ContentLogo = styled.View`
  background-color: #f0f0f0;
  border-radius: 50px;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

export const UserLogo = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  border-width: 2px;
  border-color: #bdbdbd;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin: 5px;
`;

export const ContentText = styled.View`
  flex-direction: column;
`;

export const NameProfile = styled.Text`
  color: #23a6f0;
  font-size: 14px;
  font-weight: 600;
`;

export const StatusConect = styled.Text`
  color: #252b42;
  font-size: 14px;
  font-weight: 600;
`;

export const LabelText = styled.Text`
  color: #000;
  font-size: 14px;
  font-weight: bold;
  position: absolute;
  width: 100%;
  align-self: center;
  justify-self: flex-end;
  text-align: right;
  /* margin-left: 20px; */
  /* margin-right: 20px; */
  /* background-color: blue; */
`;
