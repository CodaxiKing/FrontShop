import { TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';

interface ButtonProps {
  backgroundColor?: string;
  fontSize?: number;
  padding?: string;
  marginTop?: string;
  onPress?: () => void;
  title: string;
}

interface ContainerButtonProps {
  backgroundColor?: string;
  padding?: string;
  marginTop?: string;
}

interface ButtonTextProps {
  fontSize?: number;
}

const ContainerButton = styled.TouchableOpacity<ContainerButtonProps>`
  background-color: ${(props) => props.backgroundColor || '#2196F3'};
  margin-top: ${(props) => props.marginTop || '10px'};
  padding: ${(props) => props.padding || '10px'};
  align-items: center;
  justify-content: center;
  border-radius: 5px;
`;

const ButtonText = styled.Text<ButtonTextProps>`
  color: #fff;
  font-size: ${(props) => props.fontSize || '10px'};
`;

const Button: React.FC<ButtonProps> = ({
  backgroundColor,
  fontSize,
  padding,
  marginTop,
  onPress,
  title,
}) => (
  <ContainerButton
    backgroundColor={backgroundColor}
    marginTop={marginTop}
    padding={padding}
    onPress={onPress}
  >
    <ButtonText fontSize={fontSize}>{title}</ButtonText>
  </ContainerButton>
);

export default Button;
