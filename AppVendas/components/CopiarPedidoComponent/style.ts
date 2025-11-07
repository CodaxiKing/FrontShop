import styled from "styled-components/native";
// import { View } from "react-native";

// export const Container = styled.View`
//   width: 97%;
//   flex: 1;
//   background-color: #fff;
//   border-radius: 10px;
//   margin: 0 auto;
// `;

export const Container = styled.View`
  background-color: #fff;
  width: 97%;
  border-radius: 10px;
  margin: 0 auto;
  margin-bottom: 150px;
  /* flex: 1; */
`;

export const RowCard = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  width: 98%;
`;

export const ButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px;
  background-color: #f1f1f1;
  align-items: center;
  justify-content: center;
`;

export const FormSearch = styled.View`
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
  padding: 20px 10px;
`;

export const ButtonFooter = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 80px;
  /* width: 100%; */
`;
