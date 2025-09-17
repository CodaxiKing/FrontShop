import styled from "styled-components/native";

export const RowCard = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const CardContainer = styled.View<{
  isModoPaisagem: boolean;
}>`
  background-color: #f1f1f1;
  border-radius: 10px;
  padding: 15px;
  width: ${({ isModoPaisagem }) => (isModoPaisagem ? "30%" : "45%")};

  margin: 10px;
  overflow: hidden;

  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 4.65px;
  elevation: 4;
`;

export const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 5px;
`;

export const Label = styled.Text<{
  isModoPaisagem: boolean;
  width: number;
}>`
  font-weight: bold;
  font-size: ${({ isModoPaisagem, width }) => {
    if (isModoPaisagem && width >= 1500) return "28px";
    if (isModoPaisagem && width >= 1300) return "22px";
    if (isModoPaisagem && width >= 800) return "18px";
    return "14px";
  }};
  color: #000;
  /* flex-shrink: 1; */
  flex-wrap: wrap;
`;

export const Value = styled.Text<{
  isModoPaisagem: boolean;
  width: number;
}>`
  font-size: ${({ isModoPaisagem, width }) => {
    if (isModoPaisagem && width >= 1500) return "22px";
    if (isModoPaisagem && width >= 1300) return "18px";
    if (isModoPaisagem && width >= 800) return "16px";
    return "14px";
  }};
  color: #000;
`;

export const CheckButtonContainer = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const CheckButton = styled.View<{
  isChecked: boolean;
}>`
  background-color: ${({ isChecked }) => (isChecked ? "#00c853" : "#f1f1f1")};
  border-radius: 50px;
  padding: 5px;
`;

export const Separator = styled.View`
  height: 1px;
  background-color: #e0e0e0;
  margin: 7px 0;
`;

export const IconContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const IconButton = styled.TouchableOpacity`
  margin: 0 10px;
`;

export const FormSearch = styled.View`
  width: 100%;
  flex-direction: row;
  gap: 10px;
  /* padding: 10px 10px; */
  padding-top: 10;
  padding-horizontal: 10;
`;
