import styled from "styled-components/native";

const CardContainer = styled.View`
  position: relative;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  border-radius: 15px;
  padding: 4px;
  padding-right: 36px;
  margin: 5px 0;

  width: 250px;
  height: 70px;

  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 4.65px;
  elevation: 4;
`;

const Logo = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  margin-right: 10px;
  margin-top: 5px;
  justify-content: center;
  align-items: center;
  object-fit: contain;
`;

const CheckBoxWrapper = styled.View`
  position: absolute;
  right: 8px;
  top: 0;
  bottom: 0;
  justify-content: center;
`;

const InfoContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const IdText = styled.Text`
  font-size: 10px;
  color: #000;
`;

const NameText = styled.Text`
  font-size: 10px;
  font-weight: 700;
  color: #333;
`;

const EmailText = styled.Text`
  font-size: 8px;
  font-weight: 400;
  color: #888;
`;

const CircleIcon = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 1px solid #ccc;
  margin-top: -45px;
  margin-right: -5px;
`;

export {
  CardContainer,
  Logo,
  InfoContainer,
  IdText,
  NameText,
  EmailText,
  CircleIcon,
  CheckBoxWrapper,
};
