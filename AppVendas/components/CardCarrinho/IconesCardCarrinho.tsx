import React, { useState, useContext, useEffect } from "react";
import {
  ContainerActionEmpresa,
  ButtonCardEmpresa,
  TextEmpresa,
} from "./style";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import ModalEndereco from "./Modais/ModalEndereco";
import ModalExpositor from "./Modais/ModalExpositorCarrinho";
import ModalParcial from "./Modais/ModalParcialCarrinho";
import { Alert, View, ActivityIndicator, Text } from "react-native";
import * as SQLite from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import AuthContext from "@/context/AuthContext";
import { useTopContext } from "@/context/TopContext";
import { IProdutoLoja } from "../CardProdutoCatalogo";
import ModalExpositorCarrinho from "./Modais/ModalExpositorCarrinho";
import ModalParcialCarrinho from "./Modais/ModalParcialCarrinho";
import { ProdutoPedido } from "@/types/types";
import { useMenuContext } from "@/context/MenuProvider";

const db = SQLite.openDatabaseSync("user_data.db");

export interface Endereco {
  cep: string;
  estado: string;
  municipio: string;
  bairro: string;
  endereco: string;
  uf?: string;
  complemento?: string;
  numero?: string;
}

export interface CarrinhoInfo {
  id?: number;
  cpfCnpj: string;
  enderecoEntrega: string;
  cepEntrega: string;
  bairroEntrega: string;
  complementoEntrega: string;
  estadoEntrega: string;
  municipioEntrega: string;
  produtosNoCarrinho?: { codigo: string }[];
  representanteId?: string;
  produtos?: string | any[];
}

interface IconesCardCarrinhoProps {
  enderecosCliente: Endereco[];
  carrinhoInfo: CarrinhoInfo;
  setCarrinhoInfo: React.Dispatch<React.SetStateAction<any>>;
  refreshCarrinho: () => Promise<void>;
  cpfCnpjSelecionado: string;
  setDadosLojas: React.Dispatch<
    React.SetStateAction<{
      [cpfCnpj: string]: {
        razaoSocial: string;
        enderecoPrincipal: Endereco | null;
      };
    }>
  >;
  dadosLojas: {
    [cpfCnpj: string]: {
      razaoSocial: string;
      enderecoPrincipal: Endereco | null;
    };
  };
}

interface ProdutoCarrinho {
  codigo: string;
  nomeEcommerce: string;
  quantidade: number;
  precoUnitario: number;
  precoUnitarioComIPI: number;
  tipo?: string;
  imagem?: any;
}

interface ItemPorCpf {
  cpfCnpj: string;
  produtos: ProdutoCarrinho[];
}

const IconesCardCarrinho: React.FC<IconesCardCarrinhoProps> = ({
  enderecosCliente,
  carrinhoInfo,
  cpfCnpjSelecionado,
  setCarrinhoInfo,
  refreshCarrinho,
  setDadosLojas,
  dadosLojas,
}) => {
  const { userData } = useContext(AuthContext);
  const { updateCarrinhosCount } = useTopContext();
  const navigation = useNavigation();
  const representanteId = userData?.representanteId;

  const [modalEnderecoVisible, setModalEnderecoVisible] =
    useState<boolean>(false);
  const [modalExpositorVisible, setModalExpositorVisible] =
    useState<boolean>(false);
  const [modalParcialVisible, setModalParcialVisible] =
    useState<boolean>(false);
  const [enderecosClienteDinamico, setEnderecosClienteDinamico] = useState<
    Record<string, Endereco[]>
  >({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [cep, setCep] = useState<string>("21300-00");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [carrinhos, setCarrinhos] = useState<ItemPorCpf[]>([]);
  const [cpfCnpjModal, setCpfCnpjModal] = useState<string | null>(null);

  const { setLojasParaCliente } = useMenuContext();

  const [enderecoSelecionado, setEnderecoSelecionado] =
    useState<Endereco | null>(null);

  const handleOpenEnderecoModal = (cpfCnpjLoja: string) => {
    const dadosLoja = dadosLojas?.[cpfCnpjLoja];

    if (!dadosLoja || !dadosLoja.enderecoPrincipal) {
      Alert.alert(
        "Endereço não encontrado",
        "Não foi possível carregar o endereço dessa loja."
      );
      return;
    }

    setEnderecoSelecionado(
      dadosLoja.enderecoEntrega || dadosLoja.enderecoPrincipal
    );
    setCpfCnpjModal(cpfCnpjLoja); // <<< chave para resolver
    setModalEnderecoVisible(true);
  };

  const handleCloseEnderecoModal = () => {
    setModalEnderecoVisible(false);
  };

  const handleSelectCep = (value: string) => {
    setCep(value);
    setDropdownVisible(false);
  };

  const handleOpenModalExpositor = () => {
    const lojaExiste = carrinhos.some(
      (item) => item.cpfCnpj === carrinhoInfo.cpfCnpj
    );

    if (!lojaExiste) {
      setCarrinhos((prev) => [
        ...prev,
        {
          cpfCnpj: carrinhoInfo.cpfCnpj,
          produtos: carrinhoInfo.produtos || [], // Se tiver produtos no pedido
        },
      ]);
    }

    setModalExpositorVisible(true);
  };

  const updateCarrinhoInDB = async (produtosArray: IProdutoLoja[]) => {
    try {
      const repId = carrinhoInfo.representanteId || representanteId || "";

      await db.runAsync(
        `UPDATE NovoPedido SET produtos = ? WHERE id = ? AND representanteId = ?;`,
        [JSON.stringify(produtosArray), carrinhoInfo.id || 0, repId]
      );
    } catch (error) {
      console.error("[UPD-ERR]", error);
    }
  };

  const handleRemoveStore = () => {
    Alert.alert(
      "Confirmar remoção",
      "Você tem certeza que deseja remover esta loja e todos os seus produtos do carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);

              const pedidoId = carrinhoInfo?.id;
              const repId = carrinhoInfo?.representanteId || representanteId;
              if (!pedidoId) throw new Error("ID do pedido não encontrado");
              if (!repId) throw new Error("ID do representante não encontrado");

              // 1) Lê pedido atual
              const [pedido] = await db.getAllAsync(
                `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;`,
                [pedidoId, repId]
              );
              if (!pedido) throw new Error("Pedido não encontrado");

              const lojas: any[] = (() => {
                try {
                  return JSON.parse(pedido.produtos || "[]");
                } catch {
                  return [];
                }
              })();

              // 2) Remove a loja de forma imutável
              const novasLojas = lojas.filter(
                (l) => l?.cpfCnpj !== cpfCnpjSelecionado
              );

              if (novasLojas.length > 0) {
                // 3) UPDATE no DB (aguardado)
                await db.runAsync(
                  `UPDATE NovoPedido SET produtos = ? WHERE id = ? AND representanteId = ?;`,
                  [JSON.stringify(novasLojas), pedidoId, repId]
                );

                // 4) Atualização OTIMISTA dos estados usados pela lista
                setCarrinhoInfo((prev) => ({ ...prev, produtos: novasLojas }));
                setDadosLojas((prev) => {
                  if (!prev) return prev;
                  const { [cpfCnpjSelecionado]: _omit, ...rest } = prev;
                  return rest; // remove a chave da loja
                });

                setLojasParaCliente(
                  carrinhoInfo.cpfCnpj || "",
                  novasLojas.map((l) => l.cpfCnpj)
                ); // Atualiza o contexto com as lojas do carrinho

                // 5) Reidrata do DB e atualiza badge
                await refreshCarrinho(); // <- importante: deve SUBSTITUIR estados (ver item 3)
                await updateCarrinhosCount();
                setIsLoading(false);
              } else {
                // 6) Sem lojas restantes => apaga o pedido
                await db.runAsync(
                  `DELETE FROM NovoPedido WHERE id = ? AND representanteId = ?;`,
                  [pedidoId, repId]
                );
                await updateCarrinhosCount();
                setIsLoading(false);
                navigation.goBack();
              }
            } catch (err) {
              console.error("Erro ao remover loja do carrinho:", err);
              setIsLoading(false);
              Alert.alert(
                "Erro",
                "Não foi possível remover a loja do carrinho."
              );
            }
          },
        },
      ]
    );
  };

  // const handleRemoveStore = (codigoProduto: string) => {
  //   Alert.alert(
  //     "Confirmar remoção",
  //     "Você tem certeza que deseja remover esta loja e todos os seus produtos do carrinho?",
  //     [
  //       {
  //         text: "Cancelar",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Remover",
  //         style: "destructive",
  //         onPress: async () => {
  //           try {
  //             // Ativar o indicador de carregamento
  //             setIsLoading(true);

  //             // Verificar se temos o ID
  //             if (!carrinhoInfo.id) {
  //               throw new Error("ID do pedido não encontrado");
  //             }

  //             // Usar o representanteId do contexto se não estiver disponível no carrinhoInfo
  //             const repId = carrinhoInfo.representanteId || representanteId;

  //             if (!repId) {
  //               throw new Error("ID do representante não encontrado");
  //             }

  //             const querySelectPedido = `
  //               SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;
  //             `;

  //             const pedidoResult = await db.getAllAsync(querySelectPedido, [
  //               carrinhoInfo.id,
  //               repId,
  //             ]);

  //             if (pedidoResult.length > 0) {
  //               let produtoLojas = JSON.parse(
  //                 String(
  //                   (pedidoResult[0] as { produtos?: string }).produtos || "[]"
  //                 )
  //               );

  //               // Encontrar o índice da loja a ser removida
  //               const lojaIndex = produtoLojas.findIndex(
  //                 (cliente: any) => cliente.cpfCnpj === cpfCnpjSelecionado
  //               );

  //               console.log("produtoLojas antes da remoção:", produtoLojas);
  //               console.log(
  //                 "Índice da loja a ser removida:",
  //                 lojaIndex,
  //                 "CPF/CNPJ:",
  //                 cpfCnpjSelecionado
  //               );
  //               // Se encontrou a loja, remover usando o índice
  //               // if (lojaIndex !== -1) {
  //               //   console.log(
  //               //     "Removendo loja do carrinho:",
  //               //     cpfCnpjSelecionado
  //               //   );
  //               //   produtoLojas.splice(lojaIndex, 1);

  //               //   // console.log("Loja removida com sucesso.");
  //               //   console.log("produtoLojas restantes:", produtoLojas);
  //               // }

  //               // NOVO: imutável (garante referência nova)
  //               const atualizado = produtoLojas.filter(
  //                 (c: any) => c.cpfCnpj !== cpfCnpjSelecionado
  //               );
  //               // Se ainda há lojas, atualizar o DB
  //               if (atualizado.length > 0) {
  //                 // console.log("Atualizando carrinho no DB...");

  //                 console.log("Qtd produtos loja:", atualizado.length);
  //                 await updateCarrinhoInDB(atualizado);
  //                 setCarrinhoInfo(JSON.parse(JSON.stringify(atualizado)));
  //                 // setCarrinhoInfo(produtoLojas);
  //                 // setCarrinhos(produtoLojas);
  //                 console.log("Carrinho atualizado com sucesso.");

  //                 // setTimeout(async () => {
  //                 //   console.log("Chamou timeOut");
  //                 // await refreshCarrinho();
  //                 // }, 500);
  //               } else {
  //                 // Se não há mais lojas, excluir o registro completo
  //                 const deleteQuery = `
  //                     DELETE FROM NovoPedido
  //                     WHERE id = ? AND representanteId = ?;
  //                   `;
  //                 await db.runAsync(deleteQuery, [carrinhoInfo.id, repId]);

  //                 // Atualizar a contagem de carrinhos no TopContext
  //                 // await updateCarrinhosCount();
  //                 setIsLoading(false);
  //                 navigation.goBack();
  //               }
  //             }

  //             // Aguarde um tempo para dar feedback visual ao usuário
  //             setTimeout(async () => {
  //               console.log("Dando feedback visual...");
  //               // Atualizar a interface após remover a loja
  //               await refreshCarrinho();

  //               // Atualizar a contagem de carrinhos no TopContext e aguardar a conclusão
  //               await updateCarrinhosCount();

  //               // Desativar o indicador de carregamento após concluir
  //               setIsLoading(false);
  //             }, 400);

  //             // Voltar para a tela anterior caso não haja mais lojas no carrinho

  //             // console.log("Carrinhos após remoção:", carrinhos);

  //             // navigation.goBack();
  //           } catch (error) {
  //             console.error("Erro ao remover loja do carrinho:", error);
  //             Alert.alert(
  //               "Erro",
  //               "Não foi possível remover a loja do carrinho."
  //             );
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  const atualizarEnderecoNoJsonDeProdutos = async (
    pedidoId: number,
    repId: string,
    cpfCnpj: string,
    endereco: Endereco
  ) => {
    const rows = await db.getAllAsync(
      `SELECT * FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1`,
      [pedidoId, repId]
    );

    if (!rows.length) throw new Error("Pedido não encontrado.");

    const pedido = rows[0];
    const produtos = JSON.parse(pedido.produtos || "[]");

    const indexLoja = produtos.findIndex((p: any) => p.cpfCnpj === cpfCnpj);

    if (indexLoja === -1) {
      produtos.push({
        cpfCnpj,
        produtos: [],
        enderecoEntrega: endereco,
      });
    } else {
      produtos[indexLoja].enderecoEntrega = endereco;
    }

    await db.runAsync(
      `UPDATE NovoPedido SET produtos = ? WHERE id = ? AND representanteId = ?`,
      [JSON.stringify(produtos), pedidoId, repId]
    );
  };

  const updateEnderecoCliente = async (endereco: Endereco, cpfCnpj: string) => {
    try {
      const repId = carrinhoInfo.representanteId || representanteId;
      const pedidoId = carrinhoInfo.id;

      if (!repId || !pedidoId) {
        throw new Error("Representante ou pedido não identificado.");
      }

      const isPrincipal = cpfCnpj === carrinhoInfo.cpfCnpj;

      // Atualiza o JSON compartilhado para loja pai e coligadas
      await atualizarEnderecoNoJsonDeProdutos(
        pedidoId,
        repId,
        cpfCnpj,
        endereco
      );

      // Se for loja pai, também atualiza os campos diretos da tabela
      if (isPrincipal) {
        await db.runAsync(
          `UPDATE NovoPedido
         SET enderecoEntrega = ?,
             cepEntrega = ?,
             bairroEntrega = ?,
             complementoEntrega = ?,
             estadoEntrega = ?,
             ufEntrega = ?,
             municipioEntrega = ?,
             numeroEntrega = ?,
             alterarEnderecoDeEntrega = 1
         WHERE id = ? AND representanteId = ?`,
          [
            endereco.endereco ?? null,
            endereco.cep ?? null,
            endereco.bairro ?? null,
            endereco.complemento ?? null,
            endereco.estado ?? null,
            endereco.uf ?? endereco.estado ?? null,
            endereco.municipio ?? null,
            endereco.numero ?? null,
            pedidoId,
            repId,
          ]
        );
      }

      // Atualiza a UI

      setDadosLojas((prev) => ({
        ...prev,
        [cpfCnpj]: {
          ...(prev[cpfCnpj] || { razaoSocial: "Loja" }),
          enderecoPrincipal: endereco,
        },
      }));

      Alert.alert("Tudo certo!", "Endereço salvo com sucesso.");
      setEnderecoSelecionado(endereco);
      await refreshCarrinho();
    } catch (err) {
      console.error("Erro ao salvar endereço:", err);
      Alert.alert("Erro", "Não foi possível salvar o endereço.");
    }
  };

  return (
    <>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </View>
      )}
      <ContainerActionEmpresa>
        <ButtonCardEmpresa
          onPress={() => handleOpenEnderecoModal(cpfCnpjSelecionado)}
        >
          <MaterialCommunityIcons
            name="map-marker-plus"
            size={30}
            color="black"
          />
          <TextEmpresa fontSize={14} weight={600}>
            Endereço
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={handleOpenModalExpositor}>
          <FontAwesome name="envelope" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Expositor
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={() => setModalParcialVisible(true)}>
          <FontAwesome name="search" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Parcial
          </TextEmpresa>
        </ButtonCardEmpresa>
        <ButtonCardEmpresa onPress={handleRemoveStore}>
          <FontAwesome name="trash" size={24} color="black" />
          <TextEmpresa fontSize={14} weight={600}>
            Remover
          </TextEmpresa>
        </ButtonCardEmpresa>
      </ContainerActionEmpresa>

      {/* Modais*/}
      {modalEnderecoVisible && (
        <ModalEndereco
          visible={modalEnderecoVisible}
          onClose={handleCloseEnderecoModal}
          selectedCep={cep}
          onSelectCep={handleSelectCep}
          ceps={[
            ...enderecosCliente,
            ...(enderecosClienteDinamico[cpfCnpjSelecionado] || []),
          ]}
          enderecoInicial={enderecoSelecionado}
          onConfirmEndereco={(novoEndereco) => {
            if (novoEndereco) {
              updateEnderecoCliente(novoEndereco, cpfCnpjSelecionado);

              // Verifica se o endereço já está na lista
              const listaAtual =
                enderecosClienteDinamico[cpfCnpjSelecionado] || [];

              const jaExiste = listaAtual.some(
                (e) =>
                  e.cep === novoEndereco.cep &&
                  e.endereco === novoEndereco.endereco
              );

              if (!jaExiste) {
                setEnderecosClienteDinamico((prev) => {
                  const listaAtual = prev[cpfCnpjSelecionado] || [];
                  const jaExiste = listaAtual.some(
                    (e) =>
                      e.cep === novoEndereco.cep &&
                      e.endereco === novoEndereco.endereco
                  );

                  if (jaExiste) return prev;

                  return {
                    ...prev,
                    [cpfCnpjSelecionado]: [novoEndereco, ...listaAtual],
                  };
                });
              }
            } else {
              Alert.alert("Erro", "Endereço inválido ou não selecionado.");
            }
          }}
        />
      )}
      {modalExpositorVisible && (
        <ModalExpositorCarrinho
          visible={modalExpositorVisible}
          onClose={() => {
            setModalExpositorVisible(false);

            // Força atualização do carrinho e aguarda conclusão
            setTimeout(async () => {
              await refreshCarrinho();
            }, 500);
          }}
          // cpfCnpj={carrinhoInfo.cpfCnpj}
          carrinhoInfo={carrinhoInfo}
          cpfCnpj={cpfCnpjSelecionado}
          carrinhos={carrinhos}
          setCarrinhos={setCarrinhos}
          pedidoId={carrinhoInfo.id ?? 0}
        />
      )}
      {modalParcialVisible && (
        <ModalParcialCarrinho
          visible={modalParcialVisible}
          onClose={() => setModalParcialVisible(false)}
          pedidoId={carrinhoInfo.id}
          representanteId={carrinhoInfo.representanteId || representanteId}
          cpfCnpj={cpfCnpjSelecionado}
        />
      )}
    </>
  );
};

export default IconesCardCarrinho;
