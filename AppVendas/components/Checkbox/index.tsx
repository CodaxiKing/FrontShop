import React from "react";
import * as S from "./style";

interface CheckBoxProps {
  label?: string;
  isChecked: boolean;
  onPress: () => void;
}

const CheckBox = ({ label, isChecked, onPress }: CheckBoxProps) => {
  return (
    <S.Container onPress={onPress}>
      <S.Box isChecked={isChecked}>
        {isChecked && <S.CheckMark>✓</S.CheckMark>}
      </S.Box>
      <S.Label>{label}</S.Label>
    </S.Container>
  );
};

export default CheckBox;
