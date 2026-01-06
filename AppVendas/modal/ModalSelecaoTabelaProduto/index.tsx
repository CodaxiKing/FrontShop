import React, { memo, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Modal } from "react-native";
import {
  ButtonsContainer,
  ModalBody,
  ModalContainer,
  ModalContent,
  ModalHeader,
  Title,
} from "./style";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useNavigation } from "expo-router";
import { NavigationProp, useRoute } from "@react-navigation/native";

import * as SQLite from "expo-sqlite";
import { RootStackParamList } from "@/types/types";

import SelectFieldComponent from "@/components/SelectFieldComponent";

import AuthContext from "@/context/AuthContext";
import { hasValue } from "../../helpers/hasValue";
const db = SQLite.openDatabaseSync("user_data.db");

import { useClientInfoContext } from "@/context/ClientInfoContext";
import { ITabelaPrecoItem } from "@/context/interfaces/RepresentanteItem";
import { useBloqueios } from "@/hooks/useBloqueios";
import { useTopContext } from "@/context/TopContext";
import { usePedidoCopia } from "@/context/PedidoCopiaContext";

interface TabelaProdutoModalProps {
  visible: boolean;
  onClose: () => void;
  cliente: {
    codigoColigado: string;
    pedidoId: number;
    cpfCnpj: string;
    clienteId: number;
    codigoCliente: number | string;
    codigo: number | string;
    razaoSocial: string;
    enderecoCompleto: string;
    enderecos: string[];
    selectedClient: {
      cpfCnpj: string;
      codigo: number;
      razaoSocial: string;
      enderecoCompleto: string;
      enderecos: string[];
    };
  };
  representanteId: string;
  representanteCreateId: string | number;
}

export const items_per_page = 40;

export const getProdutosPorTabelaPreco = async (
  selectedTabelaPreco: {
    value: string | number;
    tipo: string;
  },
  currentPage: number,
  clienteIdContext: string,
  representanteId: string
) => {
  const offset = (currentPage - 1) * items_per_page;

  const bloqueios = await useBloqueios({
    clienteIdContext,
    representanteId,
  });

  let condicional = "";
  let bloqueioCodigoProduto = "";
  let bloqueioMarca = "";
  let bloqueioMarcaEGrupo = "";
  let bloqueioMarcaEGrupoSubgrupo = "";
  let bloqueioMarcaEGrupoSubgrupoLinha = "";
  let bloqueioSinalizadores = "";

  const arrayCondicional = [];

  if (bloqueios.length > 0) {
    bloqueioCodigoProduto = bloqueios
      .filter((bloqueio) => hasValue(bloqueio.codigoProduto))
      .map((bloqueio) => `'${bloqueio.codigoProduto}'`)
      .join(",");

    if (hasValue(bloqueioCodigoProduto)) {
      arrayCondicional.push(`codigo NOT IN (${bloqueioCodigoProduto})`);
      // condicional = `codigo NOT IN (${bloqueioCodigoProduto})`;
    }

    bloqueioMarca = bloqueios
      .filter((bloqueio) => hasValue(bloqueio.codigoMarca))
      .map((bloqueio) => `'${bloqueio.codigoMarca}'`)
      .join(",");

    if (hasValue(bloqueioMarca)) {
      arrayCondicional.push(`codigoMarca NOT IN (${bloqueioMarca})`);
    }

    bloqueioMarcaEGrupo = bloqueios
      .filter(
        (bloqueio) =>
          hasValue(bloqueio.codigoMarca) && hasValue(bloqueio.codigoGrupo)
      )
      .map(
        (bloqueio) => `('${bloqueio.codigoMarca}', '${bloqueio.codigoGrupo}')`
      )
      .join(",");

    if (hasValue(bloqueioMarcaEGrupo)) {
      arrayCondicional.push(
        `(codigoMarca, grupo) NOT IN (${bloqueioMarcaEGrupo})`
      );
    }

    bloqueioMarcaEGrupoSubgrupo = bloqueios
      .filter(
        (bloqueio) =>
          hasValue(bloqueio.codigoMarca) &&
          hasValue(bloqueio.codigoGrupo) &&
          hasValue(bloqueio.codigoSubGrupo)
      )
      .map(
        (bloqueio) =>
          `('${bloqueio.codigoMarca}', '${bloqueio.codigoGrupo}', '${bloqueio.codigoSubGrupo}')`
      )
      .join(",");

    if (hasValue(bloqueioMarcaEGrupoSubgrupo)) {
      arrayCondicional.push(
        `(codigoMarca, grupo, codigoSubGrupo) NOT IN (${bloqueioMarcaEGrupoSubgrupo})`
      );
    }

    bloqueioMarcaEGrupoSubgrupoLinha = bloqueios
      .filter(
        (bloqueio) =>
          hasValue(bloqueio.codigoMarca) &&
          hasValue(bloqueio.codigoGrupo) &&
          hasValue(bloqueio.codigoSubGrupo) &&
          hasValue(bloqueio.codigoLinha)
      )
      .map(
        (bloqueio) =>
          `('${bloqueio.codigoMarca}', '${bloqueio.codigoGrupo}', '${bloqueio.codigoSubGrupo}', '${bloqueio.codigoLinha}')`
      )
      .join(",");

    if (hasValue(bloqueioMarcaEGrupoSubgrupoLinha)) {
      arrayCondicional.push(
        `(codigoMarca, grupo, codigoSubGrupo, codigoLinha) NOT IN (${bloqueioMarcaEGrupoSubgrupoLinha})`
      );
    }

    bloqueioSinalizadores = bloqueios
      .filter((bloqueio) => hasValue(bloqueio.codigoSinalizador))
      .map((bloqueio) => `'${bloqueio.codigoSinalizador}'`)
      .join(",");

    if (hasValue(bloqueioSinalizadores)) {
      arrayCondicional.push(`NOT EXISTS (
              SELECT 1 
              FROM json_each(${
                selectedTabelaPreco.value == "999999"
                  ? "Catalogo"
                  : "TabelaPrecoProduto"
              }.sinalizadores) 
              WHERE json_each.value ->> '$.codigo' IN (${bloqueioSinalizadores})
            )`);
    }
  }

  condicional = arrayCondicional.join(" AND ");

  if (selectedTabelaPreco.value === "999999") {
    const queryCatalogo = `
        SELECT * FROM Catalogo ${
          hasValue(condicional) ? "WHERE " + condicional : ""
        } ORDER BY codigo LIMIT ? OFFSET ?;
      `;

    return await db.getAllAsync(queryCatalogo, [
      Number(items_per_page),
      Number(offset),
    ]);
  } else {
    const queryTabelaPrecoProduto = `
        SELECT * FROM TabelaPrecoProduto WHERE codigoTabelaPreco = ? ${
          hasValue(condicional) ? " AND (" + condicional + ")" : ""
        } ORDER BY codigo LIMIT ? OFFSET ?;
      `;

    return await db.getAllAsync(queryTabelaPrecoProduto, [
      selectedTabelaPreco.value,
      Number(items_per_page),
      Number(offset),
    ]);
  }
};

const SelecaoTabelaProdutoModal: React.FC<TabelaProdutoModalProps> = memo(
  ({ visible, onClose, cliente, representanteCreateId }) => {
    const { clienteIdContext, selectedTabelaPrecoContext, setClientInfo } =
      useClientInfoContext();
    const { userData } = useContext(AuthContext);
    const representanteId = userData?.representanteId || "";

    const { updateCarrinhosCount } = useTopContext();

    const [selectedTabelaPreco, setSelectedTabelaPreco] = useState<{
      value: string | number;
      tipo: string;
    }>({
      value: selectedTabelaPrecoContext?.value || "",
      tipo: selectedTabelaPrecoContext?.tipo || "",
    });
    const [tabelaPrecoData, setTabelaPrecoData] = useState<ITabelaPrecoItem[]>(
      []
    );
    const [infoPedidoAberto, setInfoPedidoAberto] = useState<any>(null);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const { setTargetClient, setSelectedTabela, stageCartFromTabela } =
      usePedidoCopia();

    const route = useRoute();
    const isCopiarPedido = route.params?.isCopiarPedido;
    // console.log("Parametros da Rota(ModalSelecaoTabelaProduto):", route.params);

    // Carrega opções de tabela de preço
    useEffect(() => {
      getTabelaPrecoFromRepresentante();
      getInformacoesPedidoAberto();
    }, []);

    useEffect(() => {
      if (selectedTabelaPrecoContext) {
        setSelectedTabelaPreco(selectedTabelaPrecoContext);
      }
    }, [selectedTabelaPrecoContext]);

    const PADRAO_COD = "999999";

    useEffect(() => {
      if (!Array.isArray(tabelaPrecoData) || tabelaPrecoData.length === 0)
        return;

      // só define o default se ainda não há seleção válida
      const selecionadaAindaVazia =
        !selectedTabelaPreco?.value ||
        !tabelaPrecoData.some((i) => i.codigo === selectedTabelaPreco.value);

      if (selecionadaAindaVazia) {
        const padrao = tabelaPrecoData.find((i) => i.codigo === PADRAO_COD);
        if (padrao) {
          setSelectedTabelaPreco({ value: padrao.codigo, tipo: padrao.tipo });
        }
      }
    }, [tabelaPrecoData, selectedTabelaPreco?.value]);

    const options = useMemo(() => {
      if (!tabelaPrecoData?.length) {
        return [{ label: "Não há Tabela Preço disponível", value: "" }];
      }
      return tabelaPrecoData.map((item) => ({
        label: item.descricao,
        value: item.codigo,
        tipo: item.tipo,
      }));
    }, [tabelaPrecoData]);

    const getTabelaPrecoFromRepresentante = async () => {
      /**
       * A regra é: Vou listar as tabelas de preço e relacionar o cnpjColigado (Cliente informou que agora devemos relacionar com cpfCnpjPai) com o codigoColigado (Cliente),
       * e exibir as tabelas de acordo com a prioridade.
       * Todas as Tabelas com o valor de Prioridade igual 0, deverão ser sempre exibidas *independenmente das regras de prioridades de 1 a 3.
       *Paras as Prioridades de 1 a 3 deverá seguir essas regras de acordo com a ordem listadas em baixo:
       *Para o cliente selecionado deverá ser filtrado as tabelas de preços pela propridade cnpjColigada
       *(TabelaPrecos) que possui o valor igual a codigoColigado (Cliente), caso sim as tabelas que *tiveram o mesmo valor deverão ser exibidas, caso não exista nenhuma Tabela Preço para aquele *cliente executar o proximo Passo a Passo.
       *Caso o cliente informado não possua nenhuma Tabela para sua coligação deverá ser exibidas as *Tabelas com a Prioridade igual a 2, caso não exista nenhuma Tabela de Prioridade igual a 2 deverá *ser exibidas a de Prioridade igual a 3.
       */

      const query = `SELECT tabelaPrecos FROM Representante WHERE representanteId = ?`;

      if (representanteId) {
        try {
          const result = await db.getFirstAsync<{ tabelaPrecos: string }>(
            query,
            [representanteId]
          );

          if (result && result.tabelaPrecos) {
            let tabelaPrecos: ITabelaPrecoItem[] = JSON.parse(
              result.tabelaPrecos
            );

            // 🔍 Remover duplicatas usando Map (garantindo código único)
            tabelaPrecos = Array.from(
              new Map(tabelaPrecos.map((item) => [item.codigo, item])).values()
            );

            const currentDate = new Date().getTime();

            const filteredTabelaPrecos = tabelaPrecos.filter((item) => {
              const horaInicio = item.horaInicioVigencia?.trim() || "00:00:00";
              const horaFim = item.horaFimVigencia?.trim() || "23:59:59";

              try {
                // Formatar corretamente a data e a hora
                const dataInicio = Date.parse(
                  `${
                    item.dataInicioVigencia.split("T")[0]
                  }T${horaInicio}${item.dataInicioVigencia.substring(19)}`
                );

                const dataFim = item.dataFimVigencia
                  ? Date.parse(
                      `${
                        item.dataFimVigencia.split("T")[0]
                      }T${horaFim}${item.dataFimVigencia.substring(19)}`
                    )
                  : null;

                if (isNaN(dataInicio) || (dataFim && isNaN(dataFim))) {
                  console.warn("Data inválida após parsing:", item);
                  return false;
                }

                if (dataFim) {
                  return currentDate >= dataInicio && currentDate <= dataFim;
                } else {
                  return currentDate >= dataInicio;
                }
              } catch (error) {
                console.warn("Erro ao processar datas:", error, item);
                return false;
              }
            });

            // Ordena e filtra de acordo com a prioridade (0 a 3) e as coligações - faz relação em cpfCnpjPai ao invés de codigoColigado
            let tabelasParaCliente = filteredTabelaPrecos.filter(
              (item) => item.cnpjColigada === cliente.cpfCnpjPai
            );
            // let tabelasParaCliente = filteredTabelaPrecos.filter(
            //   (item) => item.cnpjColigada === cliente.codigoColigado
            // );

            // console.log(
            //   "Tabelas para o cliente - cnpjColigada = codigoColigado:",
            //   tabelasParaCliente
            // );

            if (tabelasParaCliente.length === 0) {
              // Caso não haja tabelas para o cliente com a mesma coligação, exibe as tabelas de Prioridade 2
              tabelasParaCliente = filteredTabelaPrecos.filter(
                (item) => item.prioridade === 2
              );

              // console.log(
              //   "Tabelas para o cliente - Prioridade 2:",
              //   tabelasParaCliente
              // );
            }

            if (tabelasParaCliente.length === 0) {
              // Caso não haja tabelas com prioridade 2, exibe as de Prioridade 3
              tabelasParaCliente = filteredTabelaPrecos.filter(
                (item) => item.prioridade === 3
              );

              // console.log(
              //   "Tabelas para o cliente - Prioridade 3:",
              //   tabelasParaCliente
              // );
            }

            // Exibe todas as tabelas com prioridade 0
            const tabelasComPrioridadeZero = filteredTabelaPrecos.filter(
              (item) => item.prioridade === 0
            );

            // console.log("Tabelas com prioridade 0:", tabelasComPrioridadeZero);

            // Agora as tabelas com prioridade 0 sempre serão exibidas e filtrando pelo código, para evitar repetições
            const tabelasFinal = Array.from(
              new Map(
                [...tabelasComPrioridadeZero, ...tabelasParaCliente].map(
                  (item) => [item.codigo, item]
                )
              ).values()
            );

            // Ordena as tabelas pelo campo 'descricao'
            tabelasFinal.sort((a, b) => a.descricao.localeCompare(b.descricao));

            setTabelaPrecoData(tabelasFinal);
          } else {
            console.warn("Nenhuma tabela de preços encontrada ou campo vazio.");
          }
        } catch (error) {
          console.error("Erro ao buscar tabela de preços:", error);
        }
      } else {
        console.error("representanteId is undefined");
      }
    };

    const getInformacoesPedidoAberto = async () => {
      const query = `
        SELECT *
        FROM NovoPedido
        WHERE clienteId = ? AND cpfCnpj = ? AND representanteId = ?
        ORDER BY id DESC
        LIMIT 1
      `;
      const result = await db.getFirstAsync(query, [
        cliente.clienteId ?? cliente.codigo,
        cliente.cpfCnpj,
        representanteId, // já existe no componente
      ]);

      setInfoPedidoAberto(result ?? null);
    };

    const deletePedidoDoClienteSelecionado = async () => {
      const query = `
        DELETE FROM NovoPedido
        WHERE clienteId = ? AND cpfCnpj = ? AND representanteId = ?
      `;
      await db.runAsync(query, [
        cliente.clienteId ?? cliente.codigo,
        cliente.cpfCnpj,
        representanteId,
      ]);
    };

    // Função que executa o fluxo de confirmação e navegação
    const proceedWithSelection = async (shouldDelete: boolean) => {
      try {
        // Só deleta se for troca de tabela (Confirmar no alerta)
        if (shouldDelete && infoPedidoAberto) {
          await deletePedidoDoClienteSelecionado();
        }
        // console.log("Pedido deletado com sucesso.");
        // 2) Atualizar o pedido com a tabela de preço selecionada
        const offset = 0;
        const produtos = await getProdutosPorTabelaPreco(
          selectedTabelaPreco,
          offset,
          clienteIdContext as string,
          representanteId
        );

        const parsedProdutos = produtos.map((produto: any) => ({
          ...produto,
          imagens: produto.imagens ? JSON.parse(produto.imagens) : [],
        }));

        setClientInfo({
          cpfCnpjContext: cliente.cpfCnpj,
          clienteIdContext: cliente.clienteId ?? cliente.codigo,
          selectedTabelaPrecoContext: {
            value: selectedTabelaPreco.value,
            tipo: selectedTabelaPreco.tipo,
          },
          produtosFiltradosTabelaPrecoContext: parsedProdutos,
          selectedClientContext: {
            cpfCnpj: cliente.cpfCnpj,
            clienteId: cliente.clienteId ?? cliente.codigo,
            codigoCliente: cliente?.codigo,
            razaoSocial: cliente.razaoSocial || "",
            enderecoCompleto: cliente.enderecoCompleto || "",
            enderecos: cliente.enderecos || [],
          },
        });

        {
          isCopiarPedido &&
            // Salva informações do cliente no contexto de copia do pedido
            setTargetClient({
              cpfCnpj: cliente.cpfCnpj,
              clienteId: cliente.clienteId ?? cliente.codigo,
              codigoCliente: cliente?.codigo,
              razaoSocial: cliente.razaoSocial,
              enderecoCompleto: cliente.enderecoCompleto,
              enderecos: cliente.enderecos as any[],
            });

          // Salva informações da tabela preço no contexto de copia do pedido
          setSelectedTabela({
            value: selectedTabelaPreco.value,
            tipo: selectedTabelaPreco.tipo,
          });

          // Faz o merge {codigo, quantidade} + preços atuais da tabela no contexto de copia do pedido
          stageCartFromTabela(parsedProdutos);
        }

        // console.log(selectedTabelaPreco); // return;

        onClose();

        navigation.navigate("CatalogoFechado", {
          pedidoId: 0,
          catalogOpen: false,
          cpfCnpj: cliente.cpfCnpj,
          clienteId: cliente.clienteId ?? cliente.codigo,
          representanteCreateId: representanteCreateId,
          selectedTabelaPreco: String(selectedTabelaPreco.value),
          //produtosFiltradosTabelaPreco: parsedProdutos,
          selectedClient: {
            cpfCnpj: cliente.cpfCnpj,
            clienteId: cliente.clienteId ?? cliente.codigo,
            codigoCliente: cliente?.codigo,
            razaoSocial: cliente.razaoSocial || "",
            enderecoCompleto: cliente.enderecoCompleto || "",
            enderecos: cliente.enderecos || [],
          },
        });

        updateCarrinhosCount();
      } catch (error) {
        console.error("Erro ao buscar produtos com preços atualizados:", error);
        Alert.alert("Erro", "Não foi possível buscar os produtos.");
      }
    };

    // Handler do botão Selecionar

    const onConfirm = async () => {
      if (!selectedTabelaPreco || !selectedTabelaPreco.value) {
        Alert.alert(
          "Seleção Necessária",
          "Por favor, escolha uma tabela de preço antes de continuar."
        );
        return;
      }

      // 2) buscar o pedido aberto no banco
      const pedido = await infoPedidoAberto;
      if (pedido) {
        // 3) parsear a tabelaDePrecoId que vem como string JSON
        let tabelaIdRaw = "";
        try {
          const parsed = JSON.parse(pedido.tabelaDePrecoId);
          tabelaIdRaw =
            typeof parsed === "string"
              ? parsed
              : parsed && typeof parsed.value !== "undefined"
              ? String(parsed.value)
              : String(parsed ?? "");
        } catch {
          tabelaIdRaw = String(pedido.tabelaDePrecoId ?? "").replace(/"/g, "");
        }

        // normalização: vazio/"null" => PADRÃO (999999)
        if (!tabelaIdRaw || tabelaIdRaw.toLowerCase() === "null") {
          tabelaIdRaw = PADRAO_COD; // PADRAO_COD já definido acima como "999999"
        }

        // 4) só entra no alerta se for troca de tabela e existir pedidoTabela
        if (
          pedido.clienteId === (cliente.clienteId ?? cliente.codigo) &&
          tabelaIdRaw !== String(selectedTabelaPreco.value)
        ) {
          // 4) buscar descrição amigável
          const existingLabel =
            tabelaPrecoData.find(
              (item) => String(item.codigo) === String(tabelaIdRaw)
            )?.descricao ??
            (tabelaIdRaw === PADRAO_COD ? "Padrão" : String(tabelaIdRaw));

          // 6) extrair mais infos
          const totalItens = pedido.quantidadeItens;
          const totalR$ = pedido.valorTotal;

          Alert.alert(
            "Carrinho Existente",
            `Já existe um carrinho aberto para este cliente com a tabela ${existingLabel} selecionada:\n\n` +
              `Se você continuar, esse carrinho será excluído. Deseja prosseguir?`,
            [
              { text: "Cancelar", onPress: () => onClose(), style: "cancel" },
              { text: "Continuar", onPress: () => proceedWithSelection(true) },
            ]
          );
          // Alert.alert(
          //   "Carrinho Existente",
          //   `Já existe um carrinho aberto para este cliente:\n\n` +
          //     `• Tabela: ${existingLabel}\n` +
          //     `• Itens: ${totalItens}\n` +
          //     `• Valor total: R$ ${totalR$}\n\n` +
          //     `Se você continuar, esse carrinho será excluído. Deseja prosseguir?`,
          //   [
          //     { text: "Cancelar", onPress: () => onClose(), style: "cancel" },
          //     { text: "Continuar", onPress: proceedWithSelection },
          //   ]
          // );
          return;
        }
      }

      // sem conflito, segue normalmente
      proceedWithSelection(false);
    };

    return (
      <Modal visible={visible} animationType="fade" transparent>
        <ModalContainer>
          <ModalContent>
            <ModalHeader>
              <Title>Selecione uma Tabela de Preço</Title>
            </ModalHeader>

            <ModalBody>
              <SelectFieldComponent
                selectedValue={selectedTabelaPreco.value}
                options={options}
                onValueChange={(value) => {
                  const selected = tabelaPrecoData.find(
                    (item) => item.codigo === value
                  );
                  if (selected) {
                    setSelectedTabelaPreco({
                      value: selected.codigo,
                      tipo: selected.tipo,
                    });
                  }
                }}
                height="60px"
              />
            </ModalBody>

            <ButtonsContainer>
              <ConfirmacaoModalButton
                text="Fechar"
                variant="exit"
                onPress={onClose}
              />
              <ConfirmacaoModalButton
                text="Selecionar"
                variant="confirm"
                onPress={onConfirm}
              />
            </ButtonsContainer>
          </ModalContent>
        </ModalContainer>
      </Modal>
    );
  }
);

export default SelecaoTabelaProdutoModal;
