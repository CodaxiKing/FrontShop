/**
 * 
 * O Método handleContinuePayment
* Filtra as regras ativas pelo zdn_msblql
* Verificar se o cliente (quemcomproucliente -> ze5_sbgrp) já comprou se o campo zdn_inccmp for 
* igual a S, se ele já tiver comprado segue enfrente com o Fluxo padrão
* 
* Caso o cliente não tenha comprado, verificar a regra de diferenciar produtos zdn_difprd caso seja * igual a N, não deverá ser feita a diferenciação do produto, isso significa por exemplo:
* A) Se no carrinho houver DISNEY_INTERATIVO ou MARVEL_INTERATIVO deverá verificar a zdn_qtdmin e * 
* no mínimo deverá ter a quantidade informada, podendo ser a quantidade de um único produto 
* informado * do subgrupo ou mesclado de ambos, no total deverá ter no mínimo o valor de zdn_qtdmin.
* B) Caso zdn_difprd seja igual a S

 */

import React, { useState } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  ButtonCancel,
  ButtonConfirm,
  ButtonText,
  ButtonTextBlue,
  ContainerButtonsFooter,
} from "./style";
import ModalSuccess from "./Modais/ModalSuccess";
import { Alert } from "react-native";
import { RootStackParamList } from "@/types/types";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";

import * as SQLite from "expo-sqlite";
import { IPedidoMinimo } from "@/context/interfaces/PedidoMinimoItem";
import { hasValue } from "@/helpers/hasValue";
import { useClientInfoContext } from "@/context/ClientInfoContext";
const db = SQLite.openDatabaseSync("user_data.db");

interface ButtonsEditarPedidoCheckProps {
  pedidoId: number | string;
  clienteId: number | string;
  cpfCnpj: number | string;
  selectedTabelaPreco: string;
}

interface ProdutosArrayProps {
  codigo: string;
  imagem: { uri: string };
  nomeEcommerce: string;
  precoUnitario: number;
  quantidade: number;
  tipo: string;
}

interface ArrayQuemComprouClienteSubGrupoProps {
  codigo: string;
  quantidade: number;
  descricaoSubGrupo: string;
  clienteJaComprou: boolean;
  ordem: number;
}

type ArrayQuemComprouClienteSubGrupoArrayProps =
  ArrayQuemComprouClienteSubGrupoProps[];

const ButtonsEditarPedidoCheck: React.FC<ButtonsEditarPedidoCheckProps> = ({
  pedidoId,
  clienteId,
  cpfCnpj,
  selectedTabelaPreco: selectedTabelaPreco,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // const navigation = useNavigation();
  const {
    clienteIdContext,
    cpfCnpjContext,
    selectedTabelaPrecoContext,
    produtosFiltradosTabelaPrecoContext,
  } = useClientInfoContext();

  const handleSaveCart = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000);
  };

  const handleContinueShopping = () => {
    const queryInfoPedido = `SELECT * FROM Pedido WHERE id = ?`;
    const resultInfoPedido = db.getAllSync(queryInfoPedido, [pedidoId]);

    if (pedidoId) {
      // Navega com o pedidoId do carrinho atual
      navigation.navigate("CatalogoFechado", {
        pedidoId,
        clienteId,
        cpfCnpj: cpfCnpj.toString(),
        selectedTabelaPreco: selectedTabelaPrecoContext,
        representanteCreateId: "", // Add the appropriate value here
        selectedClient: {
          cpfCnpj: cpfCnpj.toString(),
          clienteId,
          razaoSocial: "",
          enderecoCompleto: "",
          enderecos: [],
        },
      });
    } else {
      // Fallback: navegação sem pedidoId
      Alert.alert(
        "Erro",
        "Nenhum carrinho associado. Crie um pedido antes de continuar comprando."
      );
    }
  };

  const handleContinuePayment = async () => {
    try {
      //#TODO: TODA LÓGICA DE PEDIDO MINIMO COMENTADA PARA SER IMPLEMENTADA POSTERIORMENTE NUMA SEGUNDA FASE.

      // let msgErro = "";
      // let clienteJaComprou = false;
      // let produtosArray = [];
      // let ArrayDisneyQuemComprouClienteSubGrupo: ArrayQuemComprouClienteSubGrupoArrayProps =
      //   [];
      // let ArrayMarvelQuemComprouClienteSubGrupo: ArrayQuemComprouClienteSubGrupoArrayProps =
      //   [];

      // const queryPedidoMinimo = `SELECT * FROM PedidoMinimo order by ordem`;
      // const resultPedidoMinimo = await db.getAllAsync(queryPedidoMinimo);

      // const queryPedidoSelecionado = `SELECT * FROM NovoPedido WHERE id = ?`;
      // const resultPedidoSelecionado = await db.getAllAsync(
      //   queryPedidoSelecionado,
      //   [pedidoId]
      // );

      // if (
      //   resultPedidoSelecionado[0] &&
      //   typeof resultPedidoSelecionado[0] === "object" &&
      //   "produtos" in resultPedidoSelecionado[0]
      // ) {
      //   produtosArray = JSON.parse(
      //     (resultPedidoSelecionado[0] as { produtos: string }).produtos
      //   );
      // } else {
      //   throw new Error("Invalid resultPedidoSelecionado format");
      // }

      // (resultPedidoMinimo as IPedidoMinimo[]).forEach((pedidoMinimo) => {
      //   (produtosArray as CatalogoItem[]).forEach((produto) => {
      //     let disneyArray = Array.isArray(pedidoMinimo.disney)
      //       ? pedidoMinimo.disney
      //       : JSON.parse(pedidoMinimo.disney);
      //     let marvelArray = Array.isArray(pedidoMinimo.marvel)
      //       ? pedidoMinimo.marvel
      //       : JSON.parse(pedidoMinimo.marvel);

      //     let disneyJoin: string = disneyArray
      //       .filter((disney: string[]) => hasValue(disney))
      //       .map((disney: string[]) => `'${disney}'`)
      //       .join(",");

      //     let marvelJoin: string = marvelArray
      //       .filter((marvel: string[]) => hasValue(marvel))
      //       .map((marvel: string[]) => `'${marvel}'`)
      //       .join(",");

      //     const queryDisneyJoin = `SELECT * FROM Catalogo WHERE Codigo = ?
      //   AND descricaoSubGrupo IN (${disneyJoin})`;
      //     const resultQueryDisneyJoin = db.getAllSync(queryDisneyJoin, [
      //       produto.codigo,
      //     ]);

      //     const queryMarvelJoin = `SELECT * FROM Catalogo WHERE Codigo = ?
      //   AND descricaoSubGrupo IN (${marvelJoin})`;
      //     const resultQueryMarvelJoin = db.getAllSync(queryMarvelJoin, [
      //       produto.codigo,
      //     ]);

      //     clienteJaComprou = false;
      //     if (resultQueryDisneyJoin.length > 0) {
      //       if (pedidoMinimo.verificarQuemComprouCliente === "S") {
      //         const queryQuemComprouClienteSubGrupo = `SELECT * FROM QuemComprouCliente
      //       WHERE cpfCnpj = ?
      //       AND subGrupo LIKE '%${resultQueryDisneyJoin[0].descricaoSubGrupo}%'`;
      //         const resultQueryQuemComprouClienteSubGrupo = db.getAllSync(
      //           queryQuemComprouClienteSubGrupo,
      //           [cpfCnpj]
      //         );
      //         clienteJaComprou =
      //           resultQueryQuemComprouClienteSubGrupo.length > 0 ? true : false;
      //       }

      //       ArrayDisneyQuemComprouClienteSubGrupo.push({
      //         codigo: produto.codigo,
      //         quantidade: produto.quantidade,
      //         descricaoSubGrupo: resultQueryDisneyJoin.descricaoSubGrupo,
      //         clienteJaComprou: clienteJaComprou,
      //         ordem: pedidoMinimo.ordem,
      //       });
      //     }

      //     if (resultQueryMarvelJoin.length > 0) {
      //       if (pedidoMinimo.verificarQuemComprouCliente === "S") {
      //         const queryQuemComprouClienteSubGrupo = `SELECT * FROM QuemComprouCliente
      //       WHERE cpfCnpj = ?
      //       AND subGrupo LIKE '%${resultQueryMarvelJoin[0].descricaoSubGrupo}%'`;
      //         const resultQueryQuemComprouClienteSubGrupo = db.getAllSync(
      //           queryQuemComprouClienteSubGrupo,
      //           [cpfCnpj]
      //         );
      //         clienteJaComprou =
      //           resultQueryQuemComprouClienteSubGrupo.length > 0 ? true : false;
      //       }

      //       ArrayMarvelQuemComprouClienteSubGrupo.push({
      //         codigo: produto.codigo,
      //         quantidade: produto.quantidade,
      //         descricaoSubGrupo: resultQueryMarvelJoin.descricaoSubGrupo,
      //         clienteJaComprou: clienteJaComprou,
      //         ordem: pedidoMinimo.ordem,
      //       });
      //     }
      //   });
      // });

      // const disneyNaoComprou = ArrayDisneyQuemComprouClienteSubGrupo.some(
      //   (item) => item.clienteJaComprou === false
      // );
      // const marvelNaoComprou = ArrayMarvelQuemComprouClienteSubGrupo.some(
      //   (item) => item.clienteJaComprou === false
      // );

      // if (!disneyNaoComprou && !marvelNaoComprou) {
      //   // Navega para a tela de pagamento com os dados do pedido
      //   navigation.navigate("Pagamento", {
      //     pedidoId,
      //     clienteId,
      //     cpfCnpj,
      //   });
      // } else {
      //   const clienteDisneyOrdem1 =
      //     ArrayDisneyQuemComprouClienteSubGrupo.filter(
      //       (item) => item.ordem === 1
      //     );
      //   const clienteMarvelOrdem1 =
      //     ArrayMarvelQuemComprouClienteSubGrupo.filter(
      //       (item) => item.ordem === 1
      //     );

      //   if (clienteDisneyOrdem1.length > 0 || clienteMarvelOrdem1.length > 0) {
      //     const queryPedidoMinimoOrdem1 = `SELECT * FROM PedidoMinimo WHERE ordem = 1`;
      //     const resultPedidoMinimoOrdem1 = await db.getAllAsync(
      //       queryPedidoMinimoOrdem1
      //     );

      //     if (resultPedidoMinimoOrdem1[0].diferenciaProduto === "N") {
      //       const somaQuantidadeDisneyOrdem1 = clienteDisneyOrdem1.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );
      //       const somaQuantidadeMarvelOrdem1 = clienteMarvelOrdem1.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );

      //       const total =
      //         somaQuantidadeDisneyOrdem1 + somaQuantidadeMarvelOrdem1;
      //       console.log("Total:", total);

      //       if (total < resultPedidoMinimoOrdem1[0].quantidadeMinima) {
      //         msgErro = `A quantidade mínima de produtos do pedido não foi atingida.`;
      //         Alert.alert("Erro", msgErro);
      //         return;
      //       }
      //     } else {
      //       const somaQuantidadeDisneyOrdem1 = clienteDisneyOrdem1.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );
      //       const somaQuantidadeMarvelOrdem1 = clienteMarvelOrdem1.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );
      //       const total =
      //         somaQuantidadeDisneyOrdem1 + somaQuantidadeMarvelOrdem1;

      //       if (
      //         somaQuantidadeDisneyOrdem1 === 0 ||
      //         somaQuantidadeMarvelOrdem1 === 0 ||
      //         total < resultPedidoMinimoOrdem1[0].quantidadeMinima
      //       ) {
      //         msgErro = `A quantidade mínima de produtos do pedido não foi atingida.`;
      //         Alert.alert("Erro", msgErro);
      //         return;
      //       }
      //     }
      //   }

      //   /////////////////////////////////
      //   const clienteDisneyOrdem2 =
      //     ArrayDisneyQuemComprouClienteSubGrupo.filter(
      //       (item) => item.ordem === 2
      //     );
      //   const clienteMarvelOrdem2 =
      //     ArrayMarvelQuemComprouClienteSubGrupo.filter(
      //       (item) => item.ordem === 2
      //     );

      //   if (clienteDisneyOrdem2.length > 0 || clienteMarvelOrdem2.length > 0) {
      //     const queryPedidoMinimoOrdem2 = `SELECT * FROM PedidoMinimo WHERE ordem = 2`;
      //     const resultPedidoMinimoOrdem2 = await db.getAllAsync(
      //       queryPedidoMinimoOrdem2
      //     );

      //     if (resultPedidoMinimoOrdem2[0].diferenciaProduto === "N") {
      //       const somaQuantidadeDisneyOrdem2 = clienteDisneyOrdem2.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );
      //       const somaQuantidadeMarvelOrdem2 = clienteMarvelOrdem2.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );

      //       const total =
      //         somaQuantidadeDisneyOrdem2 + somaQuantidadeMarvelOrdem2;
      //       if (total < resultPedidoMinimoOrdem2[0].quantidadeMinima) {
      //         msgErro = `A quantidade mínima de produtos do pedido não foi atingida.`;
      //         Alert.alert("Erro", msgErro);
      //         return;
      //       }
      //     } else {
      //       const somaQuantidadeDisneyOrdem2 = clienteDisneyOrdem2.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );
      //       const somaQuantidadeMarvelOrdem2 = clienteMarvelOrdem2.reduce(
      //         (acc, item) => acc + item.quantidade,
      //         0
      //       );
      //       const total =
      //         somaQuantidadeDisneyOrdem2 + somaQuantidadeMarvelOrdem2;
      //       console.log("Total Ordem 2:", total);
      //       if (
      //         somaQuantidadeDisneyOrdem2 === 0 ||
      //         somaQuantidadeMarvelOrdem2 === 0 ||
      //         total < resultPedidoMinimoOrdem2[0].quantidadeMinima
      //       ) {
      //         msgErro = `A quantidade mínima de produtos do pedido não foi atingida.`;
      //         Alert.alert("Erro", msgErro);
      //         return;
      //       }
      //     }
      //   }
      // }

      navigation.navigate("Pagamento", {
        pedidoId,
        clienteId,
        cpfCnpj,
      });
    } catch (error) {
      console.error("Error on handleContinuePayment", error);
    }
  };

  return (
    <>
      <ContainerButtonsFooter>
        {/* <ButtonCancel onPress={handleSaveCart}>
          <ButtonTextBlue>Salvar carrinho</ButtonTextBlue>
        </ButtonCancel> */}
        <ButtonCancel onPress={handleContinueShopping}>
          <ButtonTextBlue>Continuar comprando</ButtonTextBlue>
        </ButtonCancel>
        <ButtonConfirm onPress={handleContinuePayment}>
          <ButtonText>Finalizar compra</ButtonText>
          <FontAwesome name="lock" size={24} color="white" />
        </ButtonConfirm>
      </ContainerButtonsFooter>

      <ModalSuccess
        visible={modalVisible}
        text="Carrinho Salvo com Sucesso"
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default ButtonsEditarPedidoCheck;
