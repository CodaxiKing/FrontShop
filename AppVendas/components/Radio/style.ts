import styled from "styled-components/native";
interface RadioProps {
  selected: boolean;
}

const RadioContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const RadioCircle = styled.View<RadioProps>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 2px solid #007bff;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.selected ? "#007bff" : "transparent")};
`;

const InnerCircle = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: white;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-left: 10px;
`;

export{
    RadioContainer,
    RadioCircle,
    InnerCircle,
    Label
}