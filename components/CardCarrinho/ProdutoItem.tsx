import React from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  ButtonCardEmpresa,
  ContainerQuantidade,
  ImagemProduto,
  InputQuantidade,
  ContainerTextItemPedido,
  TextEmpresa,
} from "./style";

interface ProdutoItemProps {
  produto: {
    codigo: string;
    nome: string;
    imagem: any;
    valorProduto: number;
  };
  quantidade: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ProdutoItem: React.FC<ProdutoItemProps> = ({
  produto,
  quantidade,
  onIncrement,
  onDecrement,
}) => (
  <ContainerTextItemPedido>
    <ImagemProduto source={produto.imagem} />
    <ContainerTextItemPedido>
      <TextEmpresa fontSize={14} weight={600}>
        {produto.codigo}
      </TextEmpresa>
      <TextEmpresa fontSize={14} weight={400}>
        {produto.nome}
      </TextEmpresa>
    </ContainerTextItemPedido>
    <ContainerQuantidade>
      <ButtonCardEmpresa onPress={onDecrement}>
        <Ionicons name="remove" size={24} color="black" />
      </ButtonCardEmpresa>
      <InputQuantidade
        value={String(quantidade)}
        editable={false}
        style={{ width: Math.max(30, 10 + String(quantidade).length * 10) }}
      />
      <ButtonCardEmpresa onPress={onIncrement}>
        <Feather name="plus" size={24} color="black" />
      </ButtonCardEmpresa>
      <TextEmpresa fontSize={14} weight={400}>
        {(produto.valorProduto * quantidade).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </TextEmpresa>
    </ContainerQuantidade>
  </ContainerTextItemPedido>
);

export default ProdutoItem;
