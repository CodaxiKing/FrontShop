import React from "react";
import {
  CardContainer,
  Image,
  InfoContainer,
  RefText,
  NameText,
} from "./style";

interface ProductCardProps {
  refer?: string;
  productImage: { uri: string } | number;
  nomeEcommerce?: string;
  precoUnitario?: number;
  codigo?: string;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const CardProdutoMalaDireta: React.FC<ProductCardProps> = ({
  refer = "",
  productImage,
  nomeEcommerce,
  precoUnitario,
  codigo,
}) => {
  return (
    <CardContainer>
      <Image source={productImage} />
      <InfoContainer>
        {refer ? <RefText>#{refer.toUpperCase()}</RefText> : null}
        {nomeEcommerce ? <NameText>{nomeEcommerce}</NameText> : null}
      </InfoContainer>
    </CardContainer>
  );
};

export default CardProdutoMalaDireta;
