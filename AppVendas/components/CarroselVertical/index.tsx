import React from "react";
import styled from "styled-components/native";

const ImageContainer = styled.View`
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 320px; /* Ajuste a altura conforme necessário */
  margin-top: 40px;
`;

const ProductImage = styled.Image`
  width: 120px;
  height: 120px;
  margin: 8px 0;
  border-radius: 8px;
`;

const CarroselVertical = () => {
  return (
    <ImageContainer>
      <ProductImage
        source={require("../../assets/images/relogios/relogio01.png")}
      />
      <ProductImage
        source={require("../../assets/images/relogios/relogio02.png")}
      />
      <ProductImage
        source={require("../../assets/images/relogios/relogio03.png")}
      />
    </ImageContainer>
  );
};

export default CarroselVertical;
