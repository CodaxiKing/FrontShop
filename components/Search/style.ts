import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

const Container = styled.View`
  background-color: #f0f0f0;
  border-radius: 10px;
  align-items: center;
  flex-direction: row;
  margin: 10px 5px;
  padding: 10px 15px;
`;

const Input = styled.TextInput`
  color: #333;
  flex: 1;
  font-size: 16px;
  margin-left: 10px;
`;

const Icon = styled(Feather)<{ active?: boolean }>`
  color: #888;
  font-size: 20px;
  ${({ active }) => active && `color: #333;`}
`;

export{
    Container,
    Input,
    Icon
}