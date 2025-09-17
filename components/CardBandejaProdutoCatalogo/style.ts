import React from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ImageProps,
  TextInput,
} from "react-native";
import styled from "styled-components/native";

type ComponentProps = {
  isModoPaisagem: boolean;
  deviceWidth: number;
};

const dimensionMap = {
  cardWidth: {
    1600: "230px",
    1300: "200px",
    800: "190px",
    fallback: "170px",
  },
  imageWidth: {
    1600: "300px",
    1300: "250px",
    800: "250px",
    fallback: "140px",
  },
  imageHeight: {
    1600: "250px",
    1300: "230px",
    800: "190px",
    fallback: "214px",
  },
};

const getDimension = (
  type: keyof typeof dimensionMap,
  isModoPaisagem: boolean,
  deviceWidth: number
): string => {
  const { fallback, 1600: v1600, 1300: v1300, 800: v800 } = dimensionMap[type];
  if (!isModoPaisagem) return fallback;
  switch (true) {
    case deviceWidth >= 1600:
      return v1600;
    case deviceWidth >= 1300:
      return v1300;
    case deviceWidth >= 800:
      return v800;
    default:
      return fallback;
  }
};

export const CardContainer = styled(View)<ComponentProps>`
  background-color: #ffffff;
  border-radius: 10px;
  width: ${({ isModoPaisagem, deviceWidth }) =>
    getDimension("cardWidth", isModoPaisagem, deviceWidth)};
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
  align-items: center;
  margin: 10px;
  padding: 4px;
  overflow: hidden;
`;

export const IconContainer = styled(View)`
  flex-direction: row;
  position: absolute;
  width: 100%;
  padding-top: 10px;
  justify-content: space-between;
  z-index: 10;
  /* gap: 15px; */
  /* align-items: center; */
  /* left: -7px; */
`;

export const LeftIconsContainer = styled(View)`
  flex-direction: column;
  gap: 10px;
  align-items: center;
  position: absolute;
  top: 10px;
  left: 5px;
  z-index: 10;
`;

export const RightIconsContainer = styled(View)`
  flex-direction: column;
  gap: 10px;
  align-items: center;
  position: absolute;
  top: 10px;
  right: 2px;
  z-index: 10;
`;

export const ProductImage = styled(Image)<ComponentProps & ImageProps>`
  width: ${({ isModoPaisagem, deviceWidth }) =>
    getDimension("imageWidth", isModoPaisagem, deviceWidth)};
  height: ${({ isModoPaisagem, deviceWidth }) =>
    getDimension("imageHeight", isModoPaisagem, deviceWidth)};
  margin-bottom: 2px;
  object-fit: contain;
`;

export const ProductTitle = styled(Text)`
  font-size: 10px;
  font-weight: bold;
  color: #000;
  text-align: center;
  margin-bottom: 5px;
  align-content: center;
  justify-content: center;
`;

export const PriceContainer = styled(View)`
  flex-direction: row;
  height: 20px;
  margin-bottom: 2px;
  gap: 20px;
  align-content: center;
  justify-content: center;
`;

export const OriginalPriceContainer = styled(View)`
  background-color: #ffbfbf;
  /* background-color: #e74040; */
  border-radius: 5px;
  min-width: 70px;
  align-items: center;
  justify-content: center;
`;

export const OriginalPrice = styled(Text)`
  font-size: 10px;
  color: #000;
  text-decoration: line-through;
`;

export const DiscountedPriceContainer = styled(View)`
  background-color: #bfffbf;
  /* background-color: #40bb15; */
  border-radius: 5px;
  min-width: 60px;
  min-height: 20px;
  align-items: center;
  justify-content: center;
`;

export const DiscountedPrice = styled(Text)`
  font-size: 10px;
  color: #000;
`;

export const ProductInfoContainer = styled(View)`
  margin-bottom: 4px;
  gap: 4px;
  height: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const ProductInfoQtdContainer = styled(View)`
  margin-bottom: 2px;
  /* gap: 4px; */
  height: 20px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const ProductInfo = styled(Text)`
  font-size: 10px;
`;
export const ProductDiscountPercentage = styled(Text)`
  font-size: 10px;
  color: #ff6c6c;
`;

export const QuantityContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 1px;
`;

export const QuantityButton = styled(TouchableOpacity)`
  background-color: #eaf2ff;
  border-radius: 50px;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
`;

export const QuantityButtonText = styled(Text)`
  font-size: 16px;
  color: #006ffd;
`;

export const QuantityTextInput = styled(TextInput)`
  margin: 0 10px;
`;

export const AddToCartButton = styled(TouchableOpacity)`
  background-color: #bfffbf;
  padding: 6px;
  border-radius: 5px;
  width: 153px;
  align-items: center;
`;

export const ButtonText = styled(Text)`
  color: #000;
  font-size: 10px;
`;
