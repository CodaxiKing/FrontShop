import styled from "styled-components/native";

export const Container = styled.View`
  flex-direction: row;
  border-radius: 12px;
  padding: 14px;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  /* background-color: red; */
`;

export const LeftColumn = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 10px 20px;
  margin-right: 10px;
  border-radius: 10px;
  max-height: 600px;
`;

export const RightColumn = styled.View`
  flex: 2;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
`;

export const SmallImage = styled.Image`
  width: 100px;
  height: 180px;
  margin-right: 6px;
  margin-left: 6px;
  margin-bottom: 12px;
  border-radius: 8px;
  @media (max-width: 700px) {
    object-fit: cover;
    width: 120px;
  }
`;
export const MainImage = styled.Image`
  width: 320px;
  height: 400px;
  @media (max-width: 700px) {
    object-fit: cover;
    width: 320px;
  }
`;

export const TagContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;

  /* flex-wrap: wrap; */
`;

export const Tag = styled.Text`
  justify-content: center;
  align-items: center;
  font-size: 12px;
  padding: 5px 10px;
  margin: 4px;
`;

export const TitleContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-content: center;
  flex: 1;
`;

export const Title = styled.Text`
  text-align: center;
  font-weight: bold;
  color: #000;
  margin-bottom: 4px;
  font-size: 10px;
`;

export const Subtitle = styled.Text`
  text-align: center;
  color: #666;
`;

export const LabelContainer = styled.View`
  align-self: center;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  width: 96%;
`;

export const Label = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #000;
  padding: 8px;
`;

export const ControlsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

export const QuantityButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background-color: #eff6ff;
  margin: 0 8px;
`;

export const QuantityText = styled.TextInput`
  font-weight: bold;
  color: #333;
  margin: 0 2px;
  font-size: 12px;
`;

export const PriceContainer = styled.View`
  align-items: center;
  flex: 1;
`;

export const PriceText = styled.Text`
  text-align: center;
`;

export const Price = styled.Text`
  color: #000;
  background-color: #bfffbf;
  font-weight: bold;
  font-size: 10px;
  padding: 10px 20px;
  border-radius: 8px;
  text-align: center;
`;

export const CarouselContainer = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 8px;
  margin: 16px 0;
  width: 96%;
`;

export const ArrowButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background-color: #fff;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 3;
`;

export const ProductItem = styled.View`
  align-items: center;
  margin: 0 8px;
  background-color: #fff;
  border-radius: 12px;
  padding: 8px;
  /* border-width: 1px; */
  /* border-color: #888; */
`;

export const ProductImage = styled.Image`
  width: 80px;
  height: 120px;
  border-radius: 8px;
  border-width: 2px;
  border-color: #f1f1f1;
`;

export const ProductPrice = styled.Text`
  font-weight: bold;
  color: #333;
  margin-top: 8px;
`;

// Container das tags
export const TagsContainer = styled.View`
  width: 100%;

  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 8px;
`;

// Container das informações
export const InfoContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-vertical: 8px;
  border-top-width: 1px;
  border-color: #ddd;
  overflow: hidden;
`;

export const TableContainer = styled.View`
  width: 96%;
  align-self: center;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 100px;
  margin-top: 10px;
  flex-shrink: 0; /* Garante que o container não encolha */
`;

// Estilo de cada texto de informação
export const InfoText = styled.Text`
  color: #333;
  text-align: center;
  flex: 1;
`;

/* Tabela de Informações */
export const InfoTable = styled.View`
  margin-bottom: 10px;
`;

export const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  border-bottom-width: 1px;
  border-color: #ddd;
`;

export const InfoCell = styled.Text`
  color: #333;
  font-weight: bold;
  flex: 1;
`;

export const InfoValue = styled.Text`
  color: #666;
  text-align: left;
  flex: 1;
`;

/* Descrições */
export const DescriptionContainer = styled.View`
  margin-top: 10px;
`;

export const DescriptionTitle = styled.Text`
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

export const DescriptionText = styled.Text`
  color: #666;
  line-height: 20px;
`;
