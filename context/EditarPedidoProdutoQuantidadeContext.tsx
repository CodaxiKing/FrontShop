import React, { createContext, useContext, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import { useClientInfoContext } from "./ClientInfoContext";
import { useTopContext } from "./TopContext";

const db = SQLite.openDatabaseSync("user_data.db");

interface EditarPedidoProdutoQuantidadeContextData {
  editarPedidoQuantidades: Record<string, number>;
  EditarPedidoIncrementar: (
    codigo: string,
    cpfCnpj: string,
    clienteId: string,

    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,
    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto?: number | undefined
  ) => Promise<void>;
  EditarPedidoDecrementar: (
    codigo: string,
    cpfCnpj: string,
    clienteId: string,

    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,
    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto?: number | undefined
  ) => Promise<void>;
  EditarPedidoSetQuantidade: (
    codigo: string,
    quantidade: number,
    cpfCnpj: string,
    clienteId: string,

    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,
    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto?: number | undefined
  ) => Promise<void>;
  EditarPedidoCarregarQuantidadeInicial: (
    codigo: string,
    cpfCnpj: string,
    clienteId: string
  ) => Promise<void>;
  EditarPedidoCriarOuAtualizarProdutoNoCarrinho: (
    codigo: string,
    quantidade: number,
    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,
    cpfCnpj: string,
    clienteId: string,
    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto?: number | undefined
  ) => Promise<void>;
}

const EditarPedidoProdutoQuantidadeContext =
  createContext<EditarPedidoProdutoQuantidadeContextData>(
    {} as EditarPedidoProdutoQuantidadeContextData
  );

export const EditarPedidoProdutoQuantidadeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [editarPedidoQuantidades, setEditarPedidoQuantidades] = useState<
    Record<string, number>
  >({});
  const { clienteIdContext } = useClientInfoContext();
  const { updateCarrinhosCount } = useTopContext();

  // Variável para armazenar a Promise pendente de criação de pedido
  let pendingOrderCreation: any = null;

  const EditarPedidoCriarOuAtualizarProdutoNoCarrinho = async (
    codigo,
    quantidade,
    nomeEcommerce,
    precoUnitario,
    imagem,
    cpfCnpj,
    clienteId,
    selectedTabelaPreco,
    selectedClient,
    percentualDesconto
  ) => {
    if (quantidade <= 0) {
      await EditarPedidoRemoverProdutoDoCarrinho(codigo, cpfCnpj, clienteId);
      updateCarrinhosCount();
      return;
    }

    if (!clienteId && !clienteIdContext) {
      Alert.alert(
        "Erro",
        "Cliente não identificado. Verifique se o cliente foi selecionado corretamente."
      );
      return;
    }

    // Se houver uma criação pendente, aguarda sua conclusão
    if (pendingOrderCreation) {
      await pendingOrderCreation;
    }

    try {
      const querySelect = `
        SELECT * FROM Pedido
        WHERE cpfCnpj = ? AND clienteId = ?
        LIMIT 1;
      `;
      const result = await db.getAllAsync(querySelect, [cpfCnpj, clienteId]);

      const tabelaDePrecoId = result.tabelaDePrecoId;

      const novoProduto = {
        codigo,
        nomeEcommerce,
        quantidade,
        precoUnitario,
        tipo: "R",
        imagem,
        percentualDesconto,
      };

      if (result.length > 0) {
        // Pedido já existe
        const pedido = result[0];

        let raw = [];
        try {
          raw = JSON.parse(pedido.produtos);
        } catch {
          raw = [];
        }

        // detecta se já é o formato “loja.produtos”
        const lojas =
          raw.length && raw[0].produtos
            ? (raw as Array<{ cpfCnpj: string; produtos: any[] }>)
            : [{ cpfCnpj, produtos: raw }];

        lojas.forEach((loja) => {
          const produtoIndex: number = loja.produtos.findIndex(
            (p: { codigo: string }) => p.codigo === codigo
          );

          if (produtoIndex !== -1) {
            if (quantidade <= 0) {
              // Se a quantidade for menor ou igual a 0, remove o produto
              loja.produtos.splice(produtoIndex, 1);
            } else {
              // Atualiza a quantidade do produto
              loja.produtos[produtoIndex].quantidade = quantidade;
            }
          } else {
            loja.produtos.push(novoProduto);
          }
        });

        let uniqueProducts = new Set();
        let totalPieces = 0;

        lojas.forEach((loja) => {
          loja.produtos.forEach((produto) => {
            uniqueProducts.add(produto.codigo);
            totalPieces += produto.quantidade;
          });
        });
      }
    } catch (error) {
      console.error("Erro criarOuAtualizarProdutoNoCarrinho:", error);
      Alert.alert("Erro", "Não foi possível atualizar o carrinho.");
    }
  };

  const EditarPedidoRemoverProdutoDoCarrinho = async (
    codigo: string,
    cpfCnpj: string,
    clienteId: string
  ) => {
    try {
      // Buscar o pedido existente
      const querySelect = `
        SELECT * FROM Pedido
        WHERE cpfCnpj = ? AND clienteId = ?
        LIMIT 1;
      `;
      const result = await db.getAllAsync(querySelect, [cpfCnpj, clienteId]);

      if (result.length > 0) {
        const pedido = result[0];

        // Verifica se a string 'produtos' não está vazia ou malformada
        let produtosLoja = [];
        try {
          // Verifique se o campo 'produtos' existe e não está vazio
          if (pedido.produtos && pedido.produtos.trim()) {
            try {
              produtosLoja = JSON.parse(pedido.produtos);
              // Verifica se o conteúdo é realmente um array
              if (!Array.isArray(produtosLoja)) {
                console.error(
                  "Dados de produtos estão malformados, inicializando como array vazio"
                );
                produtosLoja = []; // Se não for um array, inicializa como vazio
              }
            } catch (error) {
              console.error("Erro ao tentar parsear os produtos:", error);
              produtosLoja = []; // Em caso de erro, inicializa como array vazio
            }
          } else {
            produtosLoja = []; // Se estiver vazio, inicializa como array vazio
          }
        } catch (error) {
          console.error("Erro ao tentar verificar produtos:", error);
          produtosLoja = []; // Em caso de erro, inicializa como array vazio
        }

        // Se o carrinho estiver vazio, vamos excluir o pedido
        let produtoRemovido = false;
        let isPedidoVazio = false;

        // Verifica se o pedido ficará vazio após a remoção do produto
        produtosLoja.forEach((loja) => {
          const produtoIndex = loja.produtos.findIndex(
            (p) => p.codigo === codigo
          );
          if (produtoIndex !== -1) {
            loja.produtos.splice(produtoIndex, 1); // Remove o produto
            produtoRemovido = true;

            // Verifica se a loja ficou sem produtos
            const totalProdutosLoja = loja.produtos.reduce(
              (total, produto) => total + produto.quantidade,
              0
            );
            if (totalProdutosLoja === 0) {
              isPedidoVazio = true; // O pedido ficou vazio
            }
          }
        });

        if (!produtoRemovido) {
          return;
        }

        // Caso o pedido tenha ficado vazio após a remoção, você pode limpar o campo 'produtos'
        if (isPedidoVazio) {
          // Limpa o campo 'produtos' antes de excluir o pedido
          const updateQuery = `
            UPDATE Pedido
            SET produtos = ""
            WHERE id = ?;
          `;
          await db.runAsync(updateQuery, [pedido.id]);

          // Agora, podemos excluir o pedido
          const deleteQuery = `
            DELETE FROM Pedido WHERE id = ?;
          `;
          await db.runAsync(deleteQuery, [pedido.id]);
        } else {
          // Se o pedido ainda tem produtos, apenas atualize o carrinho
          let uniqueProducts = new Set();
          let totalPieces = 0;

          produtosLoja.forEach((loja) => {
            loja.produtos.forEach((produto) => {
              uniqueProducts.add(produto.codigo);
              totalPieces += produto.quantidade;
            });
          });

          const updateQuery = `
            UPDATE Pedido
            SET produtos = ?, quantidadeItens = ?, quantidadePecas = ?
            WHERE id = ? AND cpfCnpj = ?;
          `;
          await db.runAsync(updateQuery, [
            JSON.stringify(produtosLoja),
            uniqueProducts.size,
            totalPieces,
            pedido.id,
            pedido.cpfCnpj,
          ]);
        }

        // Atualizar o estado do carrinho após a remoção
        updateCarrinhosCount();
      } else {
        console.log("Pedido não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao remover produto do carrinho:", error);
      Alert.alert("Erro", "Não foi possível remover o produto do carrinho.");
    } finally {
      updateCarrinhosCount();
    }
  };

  const EditarPedidoIncrementar = async (
    codigo: string,
    cpfCnpj: string,
    clienteId: string,
    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,
    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto: number | undefined
  ) => {
    const novaQtd = (editarPedidoQuantidades[codigo] || 0) + 1;
    setEditarPedidoQuantidades((prev) => ({ ...prev, [codigo]: novaQtd }));

    await EditarPedidoCriarOuAtualizarProdutoNoCarrinho(
      codigo,
      novaQtd,
      nomeEcommerce,
      precoUnitario,
      imagem,
      cpfCnpj,
      clienteId,

      selectedTabelaPreco,
      selectedClient,
      percentualDesconto
    );
  };

  const EditarPedidoDecrementar = async (
    codigo: string,
    cpfCnpj: string,
    clienteId: string,
    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,

    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto: number | undefined
  ) => {
    const novaQtd = Math.max((editarPedidoQuantidades[codigo] || 0) - 1, 0);
    setEditarPedidoQuantidades((prev) => ({ ...prev, [codigo]: novaQtd }));

    await EditarPedidoCriarOuAtualizarProdutoNoCarrinho(
      codigo,
      novaQtd,
      nomeEcommerce,
      precoUnitario,
      imagem,
      cpfCnpj,
      clienteId,

      selectedTabelaPreco,
      selectedClient,
      percentualDesconto
    );
  };

  const EditarPedidoSetQuantidade = async (
    codigo: string,
    quantidade: number,
    cpfCnpj: string,
    clienteId: string,
    nomeEcommerce: string,
    precoUnitario: number,
    imagem: any,

    selectedTabelaPreco: any,
    selectedClient: any,
    percentualDesconto: number | undefined
  ) => {
    const novaQtd = Math.max(quantidade, 0);
    setEditarPedidoQuantidades((prev) => ({ ...prev, [codigo]: novaQtd }));

    await EditarPedidoCriarOuAtualizarProdutoNoCarrinho(
      codigo,
      novaQtd,
      nomeEcommerce,
      precoUnitario,
      imagem,
      cpfCnpj,
      clienteId,
      selectedTabelaPreco,
      selectedClient,
      percentualDesconto
    );
  };

  const EditarPedidoCarregarQuantidadeInicial = async (
    codigoProduto: string,
    cpfCnpj: string,
    clienteId: string
  ) => {
    try {
      const query = `
        SELECT * FROM Pedido 
        WHERE cpfCnpj = ? AND clienteId = ?
        LIMIT 1;
      `;
      const resultados = await db.getAllAsync(query, [cpfCnpj, clienteId]);

      if (resultados.length === 0) {
        setEditarPedidoQuantidades((prev) => ({ ...prev, [codigoProduto]: 0 }));
        return;
      }

      const pedido = resultados[0];
      const produtosJson = pedido.produtos || "[]";
      const produtosParsed = JSON.parse(produtosJson);
      let quantidadeInicial = 0;

      // Se vier no formato antigo: [{ cpfCnpj, produtos: [...] }, …]
      if (
        Array.isArray(produtosParsed) &&
        produtosParsed.length > 0 &&
        produtosParsed[0].produtos
      ) {
        const lojasComProdutos = produtosParsed as Array<{
          cpfCnpj: string;
          produtos: Array<{ codigo: string; quantidade: number }>;
        }>;

        lojasComProdutos.forEach((lojaEntry) => {
          if (lojaEntry.cpfCnpj !== cpfCnpj) return;
          const itemNaLoja = lojaEntry.produtos.find(
            (p) => p.codigo === codigoProduto
          );
          if (itemNaLoja) {
            quantidadeInicial = itemNaLoja.quantidade;
          }
        });

        // Caso venha como array plano de produtos
      } else if (Array.isArray(produtosParsed)) {
        const produtosPlano = produtosParsed as Array<{
          codigo: string;
          cpfCnpj: string;
          quantidade: number;
        }>;
        const itemEncontrado = produtosPlano.find(
          (p) => p.codigo === codigoProduto && p.cpfCnpj === cpfCnpj
        );
        quantidadeInicial = itemEncontrado ? itemEncontrado.quantidade : 0;
      }

      setEditarPedidoQuantidades((prev) => ({
        ...prev,
        [codigoProduto]: quantidadeInicial,
      }));
    } catch (error) {
      console.error(
        "Erro ao carregar quantidade inicial de EditarPedido:",
        error
      );
    }
  };

  return (
    <EditarPedidoProdutoQuantidadeContext.Provider
      value={{
        editarPedidoQuantidades,
        EditarPedidoCriarOuAtualizarProdutoNoCarrinho,
        EditarPedidoIncrementar,
        EditarPedidoDecrementar,
        EditarPedidoSetQuantidade,
        EditarPedidoCarregarQuantidadeInicial,
      }}
    >
      {children}
    </EditarPedidoProdutoQuantidadeContext.Provider>
  );
};

export const useEditarPedidoProdutoQuantidade = () =>
  useContext(EditarPedidoProdutoQuantidadeContext);
