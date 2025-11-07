import styled from "styled-components/native";
import { View } from "react-native";

const OuterCircle = styled(View)`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  border: 2px solid #c5c6cc;
  align-items: center;
  justify-content: center;
  margin-top: -30px;
  margin-right: -3px;
`;

const InnerCircle = styled(View)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #007aff;
`;

export { OuterCircle, InnerCircle };
