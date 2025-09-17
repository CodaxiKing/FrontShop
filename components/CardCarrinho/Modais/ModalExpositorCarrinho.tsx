import React, { useEffect, useState } from "react";
import { Modal, FlatList, Text, View, Alert } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalTitle,
  Card,
  CardImage,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardFooter,
  QuantityContainer,
  QuantityButton,
  QuantityText,
  ButtonRow,
  ButtonCancel,
  ButtonConfirm,
  ButtonText,
  ButtonTextBlue,
  CardHeader,
} from "./style.modal.expositor";
import { MaterialIcons } from "@expo/vector-icons";

import * as SQLite from "expo-sqlite";
import { CarrinhoInfo } from "../IconesCardCarrinho";

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

interface ExpositorItem {
  codigo: string;
  nomeEcommerce: string;
  codigoMarca: string;
  saldo: number;
  imagens: string | any[];
  maxQuantity: number;
  currentQuantity: number;
  selected?: boolean;
  excesso?: number;
}

interface ModalExpositorProps {
  visible: boolean;
  onClose: () => void;
  cpfCnpj: string;
  carrinhos: ItemPorCpf[];
  setCarrinhos: React.Dispatch<React.SetStateAction<ItemPorCpf[]>>;
  pedidoId: number;
  carrinhoInfo: CarrinhoInfo;
}

const ModalExpositorCarrinho: React.FC<ModalExpositorProps> = ({
  visible,
  onClose,
  cpfCnpj,
  carrinhos,
  setCarrinhos,
  pedidoId,
  carrinhoInfo,
}) => {
  const db = SQLite.openDatabaseSync("user_data.db");

  const [expositores, setExpositores] = useState<ExpositorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quantidadesTemporarias, setQuantidadesTemporarias] = useState<{
    [codigo: string]: string;
  }>({});

  useEffect(() => {
    if (visible) {
      fetchExpositores();
    }
  }, [visible]);

  const fetchExpositores = async () => {
    try {
      const lojaSelecionada = carrinhos.find(
        (item) => item.cpfCnpj === cpfCnpj
      );
      let todosProdutos: ProdutoCarrinho[] = [];

      const lojaComTodasAsLojas = carrinhos.find((item) => item.produtos);

      if (lojaComTodasAsLojas) {
        let parsed;

        try {
          parsed =
            typeof lojaComTodasAsLojas.produtos === "string"
              ? JSON.parse(lojaComTodasAsLojas.produtos)
              : lojaComTodasAsLojas.produtos;

          const lojaAlvo = parsed.find((item: any) => item.cpfCnpj === cpfCnpj);

          todosProdutos = lojaAlvo?.produtos || [];
        } catch (err) {
          console.error("❌ Erro ao fazer parse dos produtos:", err);
        }
      }

      const codigoProdutosNoCarrinho = todosProdutos
        .filter((produto) => produto && produto.codigo)
        .map((produto) => produto.codigo);

      const quantidadeProdutosNoCarrinho = todosProdutos
        .filter((produto) => produto && produto.codigo && produto.quantidade)
        .reduce((acc, produto) => {
          acc[produto.codigo] = produto.quantidade;
          return acc;
        }, {} as { [codigo: string]: number });

      // 1. Buscar todos os expositores da tabela Expositor
      const queryExpositores = "SELECT * FROM Expositor";
      const resultExpositores = await db.getAllAsync(queryExpositores);

      // 2. Buscar as marcas que o cliente já comprou
      const queryQuemComprou = `
        SELECT DISTINCT codigoMarca 
        FROM QuemComprouCliente 
        WHERE cpfCnpj = ?
      `;
      const resultQuemComprou = await db.getAllAsync(queryQuemComprou, [
        cpfCnpj,
      ]);
      const marcasCompradas = resultQuemComprou.map(
        (row: any) => row.codigoMarca
      );

      // 3. Verificar produtos no carrinho

      if (codigoProdutosNoCarrinho.length === 0) {
        setExpositores([]);
        return;
      }

      // 🔥 Buscar relação de códigoMarca dos produtos no carrinho
      const queryMarcasProdutosNoCarrinho = `
        SELECT codigo, codigoMarca FROM Catalogo 
        WHERE codigo IN (${codigoProdutosNoCarrinho
          .map((c) => `'${c}'`)
          .join(", ")})
      `;
      const produtosNoCarrinhoComMarcas = await db.getAllAsync(
        queryMarcasProdutosNoCarrinho
      );

      // 🔥 Criar um mapa de códigoMarca -> soma das quantidades dos produtos no carrinho
      const mapCodigoMarcaQuantidade = new Map();

      for (const produto of produtosNoCarrinhoComMarcas) {
        const codigo = produto.codigo;
        const marca = produto.codigoMarca;

        const quantidade = quantidadeProdutosNoCarrinho[codigo] || 0;

        if (mapCodigoMarcaQuantidade.has(marca)) {
          mapCodigoMarcaQuantidade.set(
            marca,
            mapCodigoMarcaQuantidade.get(marca) + quantidade
          );
        } else {
          mapCodigoMarcaQuantidade.set(marca, quantidade);
        }
      }
      // const mapCodigoMarcaQuantidade = new Map();
      // produtosNoCarrinhoComMarcas.forEach((produto) => {
      //   const quantidade = quantidadeProdutosNoCarrinho[produto.codigo] || 0;
      //   if (mapCodigoMarcaQuantidade.has(produto.codigoMarca)) {
      //     mapCodigoMarcaQuantidade.set(
      //       produto.codigoMarca,
      //       mapCodigoMarcaQuantidade.get(produto.codigoMarca) + quantidade
      //     );
      //   } else {
      //     mapCodigoMarcaQuantidade.set(produto.codigoMarca, quantidade);
      //   }
      // });

      // 🔥 Mapa de quantidade de cada expositor já no carrinho
      const mapExpositoresNoCarrinho = new Map();

      const resultCarrinho = carrinhoInfo.id
        ? await db.getFirstAsync(
            "SELECT produtos FROM NovoPedido WHERE id = ?",
            [carrinhoInfo.id]
          )
        : null;

      if (resultCarrinho && resultCarrinho.produtos) {
        try {
          const produtosNoPedido = JSON.parse(resultCarrinho.produtos);

          // 🔹 Buscar apenas a loja correspondente ao CPF/CNPJ atual
          const lojaAtual = produtosNoPedido.find(
            (item: any) => item.cpfCnpj === cpfCnpj
          );

          if (lojaAtual && Array.isArray(lojaAtual.produtos)) {
            for (const produto of lojaAtual.produtos) {
              if (produto.tipo === "E") {
                const atual = mapExpositoresNoCarrinho.get(produto.codigo) || 0;
                mapExpositoresNoCarrinho.set(
                  produto.codigo,
                  atual + produto.quantidade
                );
              }
            }
          }
        } catch (e) {
          console.error("Erro ao parsear produtos existentes:", e);
        }
      }

      // const resultCarrinho = carrinhoInfo.id
      //   ? await db.getFirstAsync(
      //       "SELECT produtos FROM NovoPedido WHERE id = ?",
      //       [carrinhoInfo.id]
      //     )
      //   : null;

      // if (resultCarrinho && resultCarrinho.produtos) {
      //   try {
      //     const produtosNoPedido = JSON.parse(resultCarrinho.produtos);
      //     for (const item of produtosNoPedido) {
      //       if (Array.isArray(item.produtos)) {
      //         for (const produto of item.produtos) {
      //           if (produto.tipo === "E") {
      //             const atual =
      //               mapExpositoresNoCarrinho.get(produto.codigo) || 0;
      //             mapExpositoresNoCarrinho.set(
      //               produto.codigo,
      //               atual + produto.quantidade
      //             );
      //           }
      //         }
      //       }
      //     }
      //   } catch (e) {
      //     console.error("Erro ao parsear produtos existentes:", e);
      //   }
      // }

      const expositoresRelacionados = resultExpositores.filter((expositor) =>
        mapCodigoMarcaQuantidade.has(expositor.codigoMarca)
      );

      const expositoresComLimite = expositoresRelacionados.map((expositor) => {
        const totalProdutosMarca =
          mapCodigoMarcaQuantidade.get(expositor.codigoMarca) || 0;

        const limiteRegra = marcasCompradas.includes(expositor.codigoMarca)
          ? Math.round(totalProdutosMarca * 0.7)
          : totalProdutosMarca;

        const jaAdicionado =
          mapExpositoresNoCarrinho.get(expositor.codigo) || 0;

        const quantidadeDisponivel = limiteRegra - jaAdicionado; // permite limite negativo
        const excesso =
          jaAdicionado > limiteRegra ? jaAdicionado - limiteRegra : 0;
        // const excesso =
        //   jaAdicionado > limiteRegra ? jaAdicionado - limiteRegra : 0;

        return {
          ...expositor,
          maxQuantity: quantidadeDisponivel,
          currentQuantity: excesso > 0 ? -excesso : 0, // ← mostra o excesso direto no input
          // currentQuantity: 0,
          excesso,
        };
      });

      setExpositores(expositoresComLimite);
    } catch (error) {
      console.error("Erro ao buscar expositores:", error);
    }
  };

  // Função para incrementar quantidade, respeitando maxQuantity global da marca
  const incrementQuantity = (codigo: string) => {
    setExpositores((prevExpositores) =>
      prevExpositores.map((item) => {
        if (item.codigo === codigo) {
          if (
            item.currentQuantity >= 0 &&
            item.currentQuantity < item.maxQuantity
          ) {
            return {
              ...item,
              currentQuantity: item.currentQuantity + 1,
            };
          }
        }
        return item;
      })
    );
  };

  // Função para decrementar quantidade, não deixando ficar abaixo de 0
  const decrementQuantity = (codigo: string) => {
    setExpositores((prevExpositores) =>
      prevExpositores.map((item) => {
        if (item.codigo === codigo) {
          // 👉 Não faz nada se estiver em excesso (valor negativo)
          if (item.currentQuantity < 0) {
            return item;
          }

          const novaQuantidade = Math.max(item.currentQuantity - 1, 0);
          const excessoAtual =
            novaQuantidade > item.maxQuantity
              ? novaQuantidade - item.maxQuantity
              : 0;

          return {
            ...item,
            currentQuantity: novaQuantidade,
            excesso: excessoAtual,
          };
        }
        return item;
      })
    );
  };

  // Função para marcar/desmarcar um expositor (ao tocar no CheckboxCircle)
  // Se o item for selecionado e ainda não tiver quantidade (0), define 1 como quantidade mínima.
  const handleSelectExpositor = (codigo: string) => {
    setExpositores((prevExpositores) =>
      prevExpositores.map((item) => {
        if (item.codigo === codigo) {
          const novoStatus = !item.selected;

          // Se estiver selecionando e a quantidade for 0, define como 1
          if (novoStatus && item.currentQuantity === 0) {
            return { ...item, selected: novoStatus, currentQuantity: 1 };
          }

          // Se estiver desmarcando, mantém a quantidade (caso queira selecionar novamente)
          return { ...item, selected: novoStatus };
        }
        return item;
      })
    );
  };

  // Função para salvar os expositores selecionados na tabela NovoPedido,
  // combinando com os produtos já existentes (somando quantidades se o produto já existir).
  // Função para salvar os expositores com quantidade maior que 0 no carrinho
  const saveSelectedExpositores = async () => {
    const selectedExpositores = expositores.filter(
      (item) => item.currentQuantity > 0 || item.excesso > 0
    );

    const hasExcesso = expositores.some(
      (item) => item.currentQuantity > item.maxQuantity
    );

    if (hasExcesso) {
      Alert.alert(
        "Ajuste necessário",
        "Você precisa remover o excesso de expositores antes de confirmar."
      );
      return false;
    }

    if (
      selectedExpositores.length === 0 ||
      selectedExpositores.every((item) => item.currentQuantity === 0)
    ) {
      Alert.alert(
        "Atenção",
        "Você precisa ajustar a quantidade de expositores para continuar."
      );
      return false;
    }

    // console.log("Expositores selecionados:", selectedExpositores.length);

    const produtosSelecionados = selectedExpositores.map((item) => {
      let imagemUrl = null;
      if (typeof item.imagens === "string") {
        try {
          const parsed = JSON.parse(item.imagens);
          imagemUrl = parsed && parsed.length > 0 ? parsed[0].imagemUrl : null;
        } catch (e) {
          imagemUrl = null;
        }
      } else if (Array.isArray(item.imagens)) {
        imagemUrl = item.imagens.length > 0 ? item.imagens[0].imagemUrl : null;
      }

      return {
        codigo: item.codigo,
        codigoMarca: item.codigoMarca,
        nomeEcommerce: item.nomeEcommerce,
        quantidade:
          item.excesso > 0
            ? -Math.abs(item.currentQuantity)
            : item.currentQuantity,
        // quantidade: item.currentQuantity,
        precoUnitario: 0,
        tipo: "E",
        imagem: { uri: imagemUrl },
        percentualDesconto: 0,
        descricaoSubGrupo: "",
        dataPrevistaPA: "",
      };
    });

    if (!carrinhoInfo.id) {
      console.error("ID do carrinho não disponível");
      return;
    }

    try {
      const querySelectPedido = `SELECT produtos FROM NovoPedido WHERE id = ?`;
      const result = await db.getAllAsync(querySelectPedido, [pedidoId]);
      let itensPorCpf: ItemPorCpf[] = [];

      if (result && result.length > 0) {
        const row = result[0] as any;
        if (row?.produtos) {
          try {
            itensPorCpf = JSON.parse(row.produtos);
          } catch (err) {
            console.error("Erro ao parsear produtos existentes:", err);
            itensPorCpf = [];
          }
        }
      }

      let cpfEncontrado = false;
      for (let i = 0; i < itensPorCpf.length; i++) {
        if (itensPorCpf[i].cpfCnpj === cpfCnpj) {
          const produtosAtuais = itensPorCpf[i].produtos || [];

          produtosSelecionados.forEach((novoProduto) => {
            const indexExistente = produtosAtuais.findIndex(
              (p) => p.codigo === novoProduto.codigo
            );

            if (indexExistente >= 0) {
              const novaQuantidade =
                produtosAtuais[indexExistente].quantidade +
                novoProduto.quantidade;

              // Garante que a quantidade nunca fique negativa
              produtosAtuais[indexExistente].quantidade = Math.max(
                novaQuantidade,
                0
              );
            } else {
              if (novoProduto.quantidade > 0) {
                produtosAtuais.push(novoProduto);
              }
            }
          });

          itensPorCpf[i].produtos = produtosAtuais;
          cpfEncontrado = true;
          break;
        }
      }

      if (!cpfEncontrado) {
        itensPorCpf.push({
          cpfCnpj: cpfCnpj,
          produtos: produtosSelecionados,
        });
      }

      const produtosJson = JSON.stringify(itensPorCpf);

      const queryUpdate = `
        UPDATE NovoPedido
        SET produtos = ?
        WHERE id = ?;
      `;

      await db.runAsync(queryUpdate, [JSON.stringify(itensPorCpf), pedidoId]);

      // console.log("Produtos atualizados no pedido com sucesso!");

      // 🔹 **Fechar o modal após o sucesso**
      setTimeout(() => {
        onClose();
      }, 300);

      return true;
    } catch (error) {
      console.error("Erro ao salvar expositores:", error);
      return false;
    }
  };

  const renderItem = ({ item }: { item: ExpositorItem }) => {
    let imagensParsed: any[] = [];
    if (typeof item.imagens === "string") {
      try {
        imagensParsed = JSON.parse(item.imagens);
      } catch (error) {
        console.error("Erro ao parsear imagens", error);
        imagensParsed = [];
      }
    } else if (Array.isArray(item.imagens)) {
      imagensParsed = item.imagens;
    }

    const imageUrl =
      imagensParsed && imagensParsed.length > 0
        ? imagensParsed[0].imagemUrl
        : null;

    return (
      <Card>
        {/* <CardHeader>
          <CheckboxCircle
            selected={!!item.selected}
            onPress={() => handleSelectExpositor(item.codigo)}
          />
        </CardHeader> */}
        {imageUrl && <CardImage source={{ uri: imageUrl }} />}
        <CardContent>
          <CardTitle>{item.nomeEcommerce}</CardTitle>
          <View
            style={{
              flexDirection: "row",
              gap: 30,
              alignItems: "center",
            }}
          >
            <CardSubtitle>{item.codigo}</CardSubtitle>
            <CardSubtitle>
              <MaterialIcons name="local-offer" size={16} color="black" />
              {item.saldo}
            </CardSubtitle>
          </View>
          <CardSubtitle
            style={{ color: item.maxQuantity < 0 ? "red" : "#666" }}
          >
            Limite Máx.: {item.maxQuantity}
          </CardSubtitle>
        </CardContent>
        <CardFooter>
          <QuantityContainer>
            <QuantityButton onPress={() => decrementQuantity(item.codigo)}>
              <Text>-</Text>
            </QuantityButton>

            <QuantityText
              style={{
                color: item.excesso > 0 ? "red" : "#006ffd",
                // fontWeight: item.excesso > 0 ? "bold" : "normal",
              }}
              keyboardType="number-pad"
              value={
                quantidadesTemporarias[item.codigo] ??
                String(item.currentQuantity)
              }
              onChangeText={(text) => {
                setQuantidadesTemporarias((prev) => ({
                  ...prev,
                  [item.codigo]: text,
                }));
              }}
              onEndEditing={() => {
                const entrada = parseInt(
                  quantidadesTemporarias[item.codigo] ?? "0",
                  10
                );
                const quantidadeValida = isNaN(entrada) ? 0 : entrada;

                setExpositores((prevExpositores) =>
                  prevExpositores.map((ex) => {
                    if (ex.codigo === item.codigo) {
                      // Soma de todos os expositores da mesma marca, exceto o atual
                      const totalOutros = prevExpositores
                        .filter(
                          (p) =>
                            p.codigoMarca === ex.codigoMarca &&
                            p.codigo !== ex.codigo
                        )
                        .reduce((acc, cur) => acc + cur.currentQuantity, 0);

                      const limiteRestante = ex.maxQuantity - totalOutros;

                      const novaQuantidade = Math.min(
                        Math.max(quantidadeValida, 0),
                        ex.maxQuantity
                      );

                      return {
                        ...ex,
                        currentQuantity: novaQuantidade,
                      };
                    }
                    return ex;
                  })
                );

                // Limpa valor temporário
                setQuantidadesTemporarias((prev) => {
                  const updated = { ...prev };
                  delete updated[item.codigo];
                  return updated;
                });
              }}
            />

            {/* <QuantityText>{item.currentQuantity}</QuantityText> */}
            <QuantityButton onPress={() => incrementQuantity(item.codigo)}>
              <Text>+</Text>
            </QuantityButton>
          </QuantityContainer>
        </CardFooter>
      </Card>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              Escolha seu expositor e adicione ao carrinho.
            </ModalTitle>
          </ModalHeader>
          <FlatList
            data={expositores}
            keyExtractor={(item) => item.codigo}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: "center", padding: 20 }}>
                Não foram encontrados expositores para os produtos no carrinho.
              </Text>
            )}
          />
          <ButtonRow>
            <ButtonCancel onPress={onClose}>
              <ButtonTextBlue>Cancelar</ButtonTextBlue>
            </ButtonCancel>
            <ButtonConfirm onPress={saveSelectedExpositores}>
              <ButtonText>
                {isLoading ? "Adicionando..." : "Confirmar Seleção"}
              </ButtonText>
            </ButtonConfirm>
          </ButtonRow>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalExpositorCarrinho;
