import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("user_data.db");

export const fetchPedidoSincronizadoById = async (pedidoId: number) => {
  try {
    const pedidoQuery = `SELECT * FROM PedidoSincronizado WHERE id = ?;`;
    const pedidoResult = await db.getAllAsync(pedidoQuery, [pedidoId]);

    if (!pedidoResult || pedidoResult.length === 0) {
      return null;
    }

    const pedido: {
      produtos?: string;
      razaoSocial?: string;
      enderecoEntrega?: string;
    } = pedidoResult[0] || {};

    const produtos = JSON.parse(pedido.produtos || "[]");

    const produtosComDetalhes = await Promise.all(
      produtos.map(async (prod: any) => {
        try {
          const catalogoQuery = `SELECT nomeEcommerce, imagens FROM Catalogo WHERE codigo = ?;`;
          const catalogoResult = await db.getAllAsync(catalogoQuery, [
            prod.codigo,
          ]);

          const produtoCatalogo =
            catalogoResult.length > 0
              ? (catalogoResult[0] as {
                  nomeEcommerce?: string;
                  imagens?: string;
                })
              : {};

          let imagemProduto = "";

          // Se houver imagens armazenadas como JSON, tenta pegar a primeira
          if (produtoCatalogo.imagens) {
            try {
              const imagensArray = JSON.parse(produtoCatalogo.imagens);
              if (Array.isArray(imagensArray) && imagensArray.length > 0) {
                imagemProduto = imagensArray[0].imagemUrl || "";
              }
            } catch (error) {
              console.error("Erro ao processar imagens do produto:", error);
            }
          }

          return {
            codigo: prod.codigo,
            nome: produtoCatalogo.nomeEcommerce || prod.nome,
            imagem: imagemProduto ? { uri: imagemProduto } : "",
            valorProduto: prod.precoUnitario,
            quantidade: prod.quantidade,
          };
        } catch (error) {
          console.error(
            `Erro ao buscar detalhes do produto ${prod.codigo}:`,
            error
          );
          return {
            codigo: prod.codigo,
            nome: prod.nome,
            imagem: "",
            valorProduto: prod.precoUnitario,
            quantidade: prod.quantidade,
          };
        }
      })
    );

    const empresa = {
      id: 1,
      nome: pedido.razaoSocial,
      endereco: pedido.enderecoEntrega,
      produtos: produtosComDetalhes,
    };

    return {
      ...pedido,
      empresas: [empresa],
    };
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return null;
  }
};
