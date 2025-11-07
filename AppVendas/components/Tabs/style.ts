import styled from 'styled-components/native';

export const TabsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 10px;
  margin: 10px 0;
`;

export const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  border-color: ${(props) => (props.active ? '#007BFF' : '#e0e0e0')};
  border-style: solid;
  border-width: 5px;
  align-items: center;
  flex: 1;
  padding: 10px 15px;
`;

export const TabText = styled.Text<{ active: boolean }>`
  color: ${(props) => (props.active ? '#ffffff' : '#000000')};
  font-size: 16px;
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
`;

export const ContentContainer = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  margin-top: 10px;
  elevation: 2;
`;
