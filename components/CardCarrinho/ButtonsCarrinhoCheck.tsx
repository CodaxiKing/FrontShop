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

interface ButtonsCarrinhoCheckProps {
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

interface ValidacaoResultado {
  valido: boolean;
  mensagem?: string;
}

type ArrayQuemComprouClienteSubGrupoArrayProps =
  ArrayQuemComprouClienteSubGrupoProps[];

const ButtonsCarrinhoCheck: React.FC<ButtonsCarrinhoCheckProps> = ({
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
    selectedClientContext,
    produtosFiltradosTabelaPrecoContext,
  } = useClientInfoContext();

  const handleSaveCart = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000);
  };

  const handleContinueShopping = () => {
    const queryInfoPedido = `SELECT * FROM NovoPedido WHERE id = ?`;
    const resultInfoPedido = db.getAllSync(queryInfoPedido, [pedidoId]);

    if (pedidoId && resultInfoPedido.length > 0) {
      const pedido = resultInfoPedido[0];
      const lojasParsed = pedido?.lojas ? JSON.parse(pedido.lojas) : [];

      // Navega com o pedidoId do carrinho atual
      navigation.navigate("CatalogoFechado", {
        catalogOpen: false,
        pedidoId,
        clienteId,
        cpfCnpj: cpfCnpj.toString(),
        selectedTabelaPreco: selectedTabelaPrecoContext,
        representanteCreateId: pedido.representanteCreateId,
        selectedClient: {
          cpfCnpj: cpfCnpj.toString(),
          clienteId,
          razaoSocial: lojasParsed[0]?.razaoSocial ?? "",
          enderecoEntrega: lojasParsed[0]?.enderecoEntrega ?? "",
          // enderecoCompleto: lojasParsed[0]?.enderecoEntrega ?? "",
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

  const validarLimiteExpositores = async (): Promise<ValidacaoResultado> => {
    try {
      const queryPedido = `SELECT produtos FROM NovoPedido WHERE id = ?`;
      const result = await db.getAllAsync(queryPedido, [pedidoId]);

      if (!result || result.length === 0) {
        return {
          valido: false,
          mensagem: "Erro: pedido não encontrado.",
        };
      }

      const produtosCarrinho: any[] = JSON.parse(result[0]?.produtos || "[]");

      const codigosUnicos = new Set<string>();
      produtosCarrinho.forEach((loja: any) => {
        loja.produtos?.forEach((p: any) => codigosUnicos.add(p.codigo));
      });

      if (codigosUnicos.size === 0) {
        return { valido: true };
      }

      const queryCatalogo = `
        SELECT codigo, codigoMarca FROM Catalogo 
        WHERE codigo IN (${[...codigosUnicos].map((c) => `'${c}'`).join(",")})
      `;
      const resultCatalogo = await db.getAllAsync(queryCatalogo);

      const mapCodigoMarca = new Map<string, string>();
      resultCatalogo.forEach((item: any) => {
        mapCodigoMarca.set(item.codigo, item.codigoMarca);
      });

      // Busca códigos dos produtos que ainda não têm marca
      const codigosSemMarca = [...codigosUnicos].filter(
        (codigo) => !mapCodigoMarca.has(codigo)
      );

      if (codigosSemMarca.length > 0) {
        const queryExpositor = `
    SELECT codigo, codigoMarca FROM Expositor 
    WHERE codigo IN (${codigosSemMarca.map((c) => `'${c}'`).join(",")})
  `;
        const resultExpositor = await db.getAllAsync(queryExpositor);

        resultExpositor.forEach((item: any) => {
          mapCodigoMarca.set(item.codigo, item.codigoMarca);
        });
      }

      // Buscar descriçãoMarca por códigoMarca (tabela Expositor)
      const queryDescricaoMarca = `
    SELECT DISTINCT codigoMarca, descricaoMarca FROM Expositor
  `;
      const resultDescricaoMarca = await db.getAllAsync(queryDescricaoMarca);
      const mapDescricaoMarca = new Map<string, string>();
      resultDescricaoMarca.forEach((item: any) => {
        mapDescricaoMarca.set(item.codigoMarca, item.descricaoMarca);
      });

      const queryQuemComprou = `
        SELECT DISTINCT codigoMarca 
        FROM QuemComprouCliente 
        WHERE cpfCnpj = ?
      `;
      const resultQuemComprou = await db.getAllAsync(queryQuemComprou, [
        cpfCnpj,
      ]);
      const marcasCompradas = resultQuemComprou.map((r: any) => r.codigoMarca);

      const relogiosPorMarca = new Map<string, number>();
      const expositoresPorMarca = new Map<string, number>();
      const expositoresPorCodigo = new Map<string, number>();

      produtosCarrinho.forEach((loja: any) => {
        loja.produtos?.forEach((p: any) => {
          const marca = mapCodigoMarca.get(p.codigo);
          if (!marca) {
            console.warn("⚠️ Produto sem marca no catálogo:", p.codigo);
            return;
          }

          const qtd = p.quantidade || 0;
          if (p.tipo === "R") {
            relogiosPorMarca.set(
              marca,
              (relogiosPorMarca.get(marca) || 0) + qtd
            );
          } else if (p.tipo === "E") {
            expositoresPorCodigo.set(p.codigo, qtd);
          }
        });
      });

      for (const [codigoExpositor, qtdExpositor] of expositoresPorCodigo) {
        const codigoMarca = mapCodigoMarca.get(codigoExpositor);
        const nomeMarca =
          mapDescricaoMarca.get(codigoMarca || "") || codigoMarca; // ✅ mantido "nomeMarca"

        const qtdRelogios = relogiosPorMarca.get(codigoMarca || "") || 0;
        const limite =
          marcasCompradas.includes(codigoMarca) && qtdRelogios > 0
            ? Math.round(qtdRelogios * 0.7)
            : qtdRelogios;

        if (qtdExpositor > limite) {
          const excesso = qtdExpositor - limite;

          return {
            valido: false,
            mensagem:
              `A marca ${nomeMarca} excedeu o limite de expositores.\n\n` +
              `🕒 Relógios no carrinho: ${qtdRelogios}\n🎁 Expositores: ${qtdExpositor}\n` +
              `📉 Limite permitido: ${limite}\n🚫 Excesso: ${excesso}\n\n` +
              `⚠️ Ajuste a quantidade de expositores para continuar.`,
          };
        }
      }

      return { valido: true };
    } catch (error) {
      console.error("❌ Erro ao validar limite de expositores:", error);
      return {
        valido: false,
        mensagem: "Erro inesperado ao validar limite de expositores.",
      };
    }
  };

  /**
   * @function handleContinuePayment
   * @description
   * Função responsável por validar as regras de pedido mínimo antes de continuar para a tela de pagamento.
   * As regras consideram:
   *
   * 1. Validação do limite de expositores (caso esteja excedido, exibe alerta e interrompe o fluxo).
   * 2. Verificação se os produtos no pedido pertencem aos grupos "Disney" ou "Marvel", com base nas regras da tabela `PedidoMinimo`.
   * 3. Para produtos Disney ou Marvel, verifica se o cliente já comprou anteriormente (usando `QuemComprouCliente`) quando exigido.
   * 4. Organiza os produtos Disney e Marvel em arrays separados por ordem de prioridade definida nas regras.
   * 5. Se o cliente já comprou todos os subgrupos listados (nenhum item marcado como "não comprou"), avança diretamente para o pagamento.
   * 6. Caso contrário, aplica validações de quantidade mínima por ordem (1, depois 2...):
   *    - Se `diferenciaProduto === "N"`: basta atingir a quantidade mínima somando Disney + Marvel.
   *    - Se `diferenciaProduto === "S"`: exige pelo menos 1 produto de cada grupo e que o total atinja o mínimo.
   *
   * Em caso de falha na validação de qualquer regra, exibe `Alert` informando o motivo.
   * Se todas as validações forem atendidas, navega para a tela de pagamento com os dados do pedido.
   *
   * @returns {Promise<void>}
   */
  const handleContinuePayment = async () => {
    const resultado = await validarLimiteExpositores();
    if (!resultado.valido) {
      Alert.alert("⚠️ Limite de Expositores Excedido", `${resultado.mensagem}`);
      return;
    }

    /**
     * @function filtrarItensParaValidacao
     * @description
     * Filtra os itens de produtos por ordem e status de compra do cliente,
     * retornando apenas os que o cliente **ainda não comprou** e que pertencem à ordem especificada.
     *
     * Essa função é usada para validar corretamente as regras de pedido mínimo,
     * ignorando subgrupos que o cliente já comprou anteriormente e que, portanto,
     * não devem ser considerados na contagem de quantidade mínima.
     *
     * @param {ArrayQuemComprouClienteSubGrupoArrayProps} array - Array de produtos de um grupo (Disney ou Marvel) com metadados da regra.
     * @param {number} ordem - Número da ordem de prioridade da regra de pedido mínimo (ex: 1 ou 2).
     *
     * @returns {ArrayQuemComprouClienteSubGrupoArrayProps} Um novo array contendo apenas os produtos que o cliente ainda não comprou e que pertencem à ordem informada.
     */
    const filtrarItensParaValidacao = (
      array: ArrayQuemComprouClienteSubGrupoArrayProps,
      ordem: number
    ) =>
      array.filter(
        (item) => item.ordem === ordem && item.clienteJaComprou === false
      );

    try {
      // console.log("🚀 Iniciando o processo de validação do pedido mínimo...");

      let msgErro = "";
      let clienteJaComprou = false;
      let produtosArray = [];
      let ArrayDisneyQuemComprouClienteSubGrupo: ArrayQuemComprouClienteSubGrupoArrayProps =
        [];
      let ArrayMarvelQuemComprouClienteSubGrupo: ArrayQuemComprouClienteSubGrupoArrayProps =
        [];

      const queryPedidoMinimo = `SELECT * FROM PedidoMinimo order by ordem`;
      const resultPedidoMinimo = await db.getAllAsync(queryPedidoMinimo);

      // console.log("⚪ Pedido Mínimo:", resultPedidoMinimo);

      const queryPedidoSelecionado = `SELECT * FROM NovoPedido WHERE id = ?`;
      const resultPedidoSelecionado = await db.getAllAsync(
        queryPedidoSelecionado,
        [pedidoId]
      );

      if (
        resultPedidoSelecionado[0] &&
        typeof resultPedidoSelecionado[0] === "object" &&
        "produtos" in resultPedidoSelecionado[0]
      ) {
        produtosArray = JSON.parse(
          (resultPedidoSelecionado[0] as { produtos: string }).produtos
        );
      } else {
        throw new Error("Invalid resultPedidoSelecionado format");
      }

      for (const pedidoMinimo of resultPedidoMinimo as IPedidoMinimo[]) {
        const disneyArray: string[] = Array.isArray(pedidoMinimo.disney)
          ? pedidoMinimo.disney
          : JSON.parse(pedidoMinimo.disney);
        const marvelArray: string[] = Array.isArray(pedidoMinimo.marvel)
          ? pedidoMinimo.marvel
          : JSON.parse(pedidoMinimo.marvel);

        for (const produto of produtosArray[0].produtos as CatalogoItem[]) {
          // normaliza o subGrupo do produto
          const subGrupoProduto = produto.descricaoSubGrupo;

          // normaliza os arrays de pedido mínimo
          const disneyNorm = disneyArray.map((d) => d);
          const marvelNorm = marvelArray.map((m) => m);

          // checa se pertence a Disney ou Marvel
          const pertenceDisney = disneyNorm.includes(subGrupoProduto);
          const pertenceMarvel = marvelNorm.includes(subGrupoProduto);

          // console.log("🟢 Pertence Disney: ", pertenceDisney, produto.codigo);
          // console.log("🟢 Pertence Marvel: ", pertenceMarvel, produto.codigo);

          // 5) Se achar no grupo Disney, verifica “QuemComprouCliente” se necessário

          if (pertenceDisney) {
            let jaComprou = false;
            if (pedidoMinimo.verificarQuemComprouCliente === "S") {
              const rows = await db.getAllAsync(
                `SELECT 1 FROM QuemComprouCliente
                WHERE cpfCnpj = ?
                  AND subGrupo LIKE ?`,
                [cpfCnpj, `%${produto.descricaoSubGrupo}%`]
              );
              jaComprou = rows.length > 0;

              // console.log("🟢 Cliente já comprou Disney:", jaComprou);
            }
            ArrayDisneyQuemComprouClienteSubGrupo.push({
              codigo: produto.codigo,
              quantidade: produto.quantidade,
              descricaoSubGrupo: produto.descricaoSubGrupo,
              clienteJaComprou: jaComprou,
              ordem: pedidoMinimo.ordem,
            });
          }

          // 6) Mesmo para o grupo Marvel
          if (pertenceMarvel) {
            let jaComprou = false;
            if (pedidoMinimo.verificarQuemComprouCliente === "S") {
              const rows = await db.getAllAsync(
                `SELECT 1 FROM QuemComprouCliente
                WHERE cpfCnpj = ?
                  AND subGrupo LIKE ?`,
                [cpfCnpj, `%${produto.descricaoSubGrupo}%`]
              );
              jaComprou = rows.length > 0;
              // console.log("🔴 Cliente já comprou Marvel:", jaComprou);
            }
            ArrayMarvelQuemComprouClienteSubGrupo.push({
              codigo: produto.codigo,
              quantidade: produto.quantidade,
              descricaoSubGrupo: produto.descricaoSubGrupo,
              clienteJaComprou: jaComprou,
              ordem: pedidoMinimo.ordem,
            });
          }
        }
      }

      // console.log(
      //   "🟢 Array Disney Quem Comprou Cliente:",
      //   ArrayDisneyQuemComprouClienteSubGrupo
      // );
      // console.log(
      //   "🟢 Array Marvel Quem Comprou Cliente:",
      //   ArrayMarvelQuemComprouClienteSubGrupo
      // );

      const disneyNaoComprou = ArrayDisneyQuemComprouClienteSubGrupo.some(
        (item) => item.clienteJaComprou === false
      );
      const marvelNaoComprou = ArrayMarvelQuemComprouClienteSubGrupo.some(
        (item) => item.clienteJaComprou === false
      );

      if (!disneyNaoComprou && !marvelNaoComprou) {
        // Se **nenhum** item está marcado como “não comprou”, vai direto ao pagamento
        navigation.navigate("Pagamento", {
          pedidoId,
          clienteId,
          cpfCnpj,
        });
      } else {
        // Se chegou aqui, é porque pode haver necessidade de validar a “quantidade mínima” por ordem de prioridade:

        // Filtra os produtos que ainda não foram comprados pelo cliente e que pertencem à ordem 1
        // (ou seja, clienteJaComprou === false)
        const clienteDisneyOrdem1 = filtrarItensParaValidacao(
          ArrayDisneyQuemComprouClienteSubGrupo,
          1
        );
        const clienteMarvelOrdem1 = filtrarItensParaValidacao(
          ArrayMarvelQuemComprouClienteSubGrupo,
          1
        );

        if (clienteDisneyOrdem1.length > 0 || clienteMarvelOrdem1.length > 0) {
          const resultPedidoMinimoOrdem1 = await db.getAllAsync(
            `SELECT * FROM PedidoMinimo WHERE ordem = 1`
          );
          const regra1 = resultPedidoMinimoOrdem1[0] as IPedidoMinimo;

          const somaDisney = clienteDisneyOrdem1.reduce(
            (acc, i) => acc + i.quantidade,
            0
          );
          const somaMarvel = clienteMarvelOrdem1.reduce(
            (acc, i) => acc + i.quantidade,
            0
          );
          const total = somaDisney + somaMarvel;

          // console.log("🟢 Cliente Disney Ordem 1:", clienteDisneyOrdem1);
          // console.log("🟢 Cliente Marvel Ordem 1:", clienteMarvelOrdem1);

          // console.log("🟢 Soma Disney Ordem 1:", somaDisney);
          // console.log("🟢 Soma Marvel Ordem 1:", somaMarvel);
          // console.log("🟢 Total Ordem 1:", total);

          // console.log(
          //   "🟢 Regra 1 - Quantidade Minima: ",
          //   regra1.quantidadeMinima
          // );

          // console.log(
          //   "🟢 Regra 1: Diferencia Produto ?: ",
          //   regra1.diferenciaProduto
          // );
          if (regra1.diferenciaProduto === "N") {
            if (total < regra1.quantidadeMinima) {
              Alert.alert(
                "Erro",
                `A quantidade mínima de produtos do pedido não foi atingida.`
              );
              return;
            }
          } else {
            if (
              somaDisney === 0 ||
              somaMarvel === 0 ||
              total < regra1.quantidadeMinima
            ) {
              Alert.alert(
                "Erro",
                `A quantidade mínima de produtos do pedido não foi atingida.`
              );
              return;
            }
          }
        }

        /////////////////////////////////

        // Filtra os produtos que ainda não foram comprados pelo cliente e que pertencem à ordem 2
        const clienteDisneyOrdem2 = filtrarItensParaValidacao(
          ArrayDisneyQuemComprouClienteSubGrupo,
          2
        );
        const clienteMarvelOrdem2 = filtrarItensParaValidacao(
          ArrayMarvelQuemComprouClienteSubGrupo,
          2
        );

        if (clienteDisneyOrdem2.length > 0 || clienteMarvelOrdem2.length > 0) {
          const resultPedidoMinimoOrdem2 = await db.getAllAsync(
            `SELECT * FROM PedidoMinimo WHERE ordem = 2`
          );
          const regra2 = resultPedidoMinimoOrdem2[0] as IPedidoMinimo;

          const somaDisney = clienteDisneyOrdem2.reduce(
            (acc, i) => acc + i.quantidade,
            0
          );
          const somaMarvel = clienteMarvelOrdem2.reduce(
            (acc, i) => acc + i.quantidade,
            0
          );
          const total = somaDisney + somaMarvel;

          // console.log("🔴 Cliente Disney Ordem 2:", clienteDisneyOrdem2);
          // console.log("🔴 Cliente Marvel Ordem 2:", clienteMarvelOrdem2);

          // console.log("🔴 Soma Disney Ordem 2:", somaDisney);
          // console.log("🔴 Soma Marvel Ordem 2:", somaMarvel);
          // console.log("🔴 Total Ordem 2:", total);

          // console.log(
          //   "🔴 Regra 2 - Quantidade Minima: ",
          //   regra2.quantidadeMinima
          // );

          // console.log(
          //   "🔴 Regra 2: Diferencia Produto ?: ",
          //   regra2.diferenciaProduto
          // );

          if (regra2.diferenciaProduto === "N") {
            if (total < regra2.quantidadeMinima) {
              Alert.alert(
                "Erro",
                `A quantidade mínima de produtos do pedido não foi atingida.`
              );
              return;
            }
          } else {
            if (
              somaDisney === 0 ||
              somaMarvel === 0 ||
              total < regra2.quantidadeMinima
            ) {
              Alert.alert(
                "Erro",
                `A quantidade mínima de produtos do pedido não foi atingida.`
              );
              return;
            }
          }
        }
      }

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

export default ButtonsCarrinhoCheck;
