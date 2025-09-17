import { TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';

interface ButtonProps {
  backgroundColor?: string;
  fontSize?: number;
  padding?: string;
  onPress?: () => void;
  text?: any;
}

interface ContainerButtonProps {
  backgroundColor?: string;
  padding?: string;
}

interface ButtonTextProps {
  fontSize?: number;
}

const ContainerBadge = styled.View<ContainerButtonProps>`
  background-color: ${(props) => props.backgroundColor || '#ddd'};
  border-radius: 5px;
  padding: ${(props) => props.padding || '10px'};
  align-items: center;
  justify-content: center;
  border-radius: 5px;
`;

const BadgeText = styled.Text<ButtonTextProps>`
  color: #fff;
  font-size: ${(props) => props.fontSize || '10px'};
  font-weight: bold;
`;

const Badge: React.FC<ButtonProps> = ({
  backgroundColor,
  fontSize,
  padding,
  text,
}) => (
  <ContainerBadge
    backgroundColor={backgroundColor}
    padding={padding}
  >
    <BadgeText fontSize={fontSize}>{text}</BadgeText>
  </ContainerBadge>
);

export default Badge;
