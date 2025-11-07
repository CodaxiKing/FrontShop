import React, { useEffect, useState } from "react";
import { Modal, ActivityIndicator, Text, View } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalTitle,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableFooter,
  ButtonRow,
  ButtonClose,
  ButtonText,
} from "./style.modal.pesquisa";
import * as SQLite from "expo-sqlite";
import { formatMoneyToBRL } from "@/utils/formatMoney";

const db = SQLite.openDatabaseSync("user_data.db");

interface MarcaTotal {
  marca: string;
  qtdMasculino: number;
  valorMasculino: number;
  qtdFeminino: number;
  valorFeminino: number;
  qtdUnissex: number;
  valorUnissex: number;
}

interface ModalTabelaProps {
  visible: boolean;
  onClose: () => void;
  pedidoId?: number;
  representanteId?: string;
  cpfCnpj?: string;
}

const ModalParcialCarrinho: React.FC<ModalTabelaProps> = ({
  visible,
  onClose,
  pedidoId,
  representanteId,
  cpfCnpj,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marcasTotais, setMarcasTotais] = useState<MarcaTotal[]>([]);
  const [totalGeral, setTotalGeral] = useState({
    qtdTotal: 0,
    valorTotal: 0,
  });
  const [nomeLoja, setNomeLoja] = useState<string>("Loja");

  useEffect(() => {
    if (visible && pedidoId && representanteId) {
      carregarDadosPedido();
    }
  }, [visible, pedidoId, representanteId]);

  const carregarDadosPedido = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const querySelectPedido = `
        SELECT produtos, razaoSocial FROM NovoPedido WHERE id = ? AND representanteId = ? LIMIT 1;
      `;

      const pedidoResult = await db.getAllAsync(querySelectPedido, [
        pedidoId || 0,
        representanteId || "",
      ]);

      if (pedidoResult.length === 0) {
        throw new Error("Pedido não encontrado");
      }

      const pedidoData = pedidoResult[0] as {
        produtos?: string;
        razaoSocial?: string;
      };

      let produtosDoCarrinho: any[] = [];
      try {
        let rawProdutos = String(pedidoData.produtos || "[]");

        // Remove caracteres de controle como quebras de linha, tabulações, etc.
        rawProdutos = rawProdutos.replace(/[\n\r\t]/g, " ");

        const parsed = JSON.parse(rawProdutos);

        if (Array.isArray(parsed)) {
          if (parsed.every((p) => p.produtos && Array.isArray(p.produtos))) {
            produtosDoCarrinho = parsed.flatMap((cliente) =>
              cliente.produtos.map((produto: any) => ({
                ...produto,
                cpfCnpj: cliente.cpfCnpj,
              }))
            );
          } else {
            produtosDoCarrinho = parsed;
          }
        } else {
          produtosDoCarrinho = [];
        }
      } catch (err) {
        console.error("[ModalParcial] Erro ao parsear produtos:", err);
      }

      const buscarRazaoSocial = async (cpfCnpj: string): Promise<string> => {
        try {
          // console.log(
          //   `[ModalParcial] Buscando razaoSocial para cpfCnpj: ${cpfCnpj}`
          // );
          const queryCarteiraCliente = `
            SELECT razaoSocial FROM CarteiraCliente 
            WHERE cpfCnpj = ? 
            LIMIT 1;
          `;
          const carteiraResult = await db.getAllAsync(queryCarteiraCliente, [
            cpfCnpj,
          ]);
          if (carteiraResult.length > 0) {
            const carteiraData = carteiraResult[0] as { razaoSocial?: string };

            return carteiraData.razaoSocial || "Loja";
          }
        } catch (error) {
          console.error(`[ModalParcial] Erro ao buscar razaoSocial:`, error);
        }

        return pedidoData.razaoSocial || "Loja";
      };

      let produtosCliente: any[] = [];
      let cpfCnpjCliente = "";
      let nomeLojaTmp = "Loja";

      if (cpfCnpj) {
        produtosCliente = produtosDoCarrinho.filter(
          (produto: any) => produto.cpfCnpj === cpfCnpj
        );

        // 🔥 Se os produtos não tiverem cpfCnpj, assume que são todos do cliente
        if (
          produtosCliente.length === 0 &&
          produtosDoCarrinho.length > 0 &&
          !("cpfCnpj" in produtosDoCarrinho[0])
        ) {
          produtosCliente = produtosDoCarrinho.map((produto: any) => ({
            ...produto,
            cpfCnpj,
          }));
        }

        cpfCnpjCliente = cpfCnpj;
        nomeLojaTmp = await buscarRazaoSocial(cpfCnpjCliente);
      } else {
        produtosCliente = produtosDoCarrinho;
      }

      setNomeLoja(nomeLojaTmp);

      if (produtosCliente.length === 0) {
        throw new Error("Nenhum produto encontrado para este cliente");
      }

      const codigosProdutos = produtosCliente
        .map((p: any) => p.codigo)
        .join("','");
      const queryCatalogo = `
        SELECT codigo, descricaoMarca, genero, precoUnitario 
        FROM Catalogo 
        WHERE codigo IN ('${codigosProdutos}')
      `;
      const catalogoResult = await db.getAllAsync(queryCatalogo);

      const produtosCompletos = produtosCliente
        .filter((p) => p.tipo !== "E")
        .map((produto: any) => {
          const infoCatalogo =
            (catalogoResult.find(
              (item: any) => item.codigo === produto.codigo
            ) as {
              codigo?: string;
              descricaoMarca?: string;
              genero?: string;
              precoUnitario?: number;
            }) || {};

          const tipo = produto.tipo;
          const quantidade =
            typeof produto.quantidade === "number" ? produto.quantidade : 0;

          let precoUnitario =
            typeof produto.precoUnitario === "number"
              ? produto.precoUnitario
              : infoCatalogo.precoUnitario || 0;

          if (produto.precoUnitarioComIPI) {
            precoUnitario = produto.precoUnitarioComIPI;
          }

          const descricaoMarca =
            infoCatalogo.descricaoMarca ||
            (tipo === "E" ? produto.nomeEcommerce || "Expositor" : "Sem marca");

          const genero = infoCatalogo.genero || "";

          return {
            ...produto,
            tipo,
            quantidade,
            precoUnitario,
            descricaoMarca,
            genero,
          };
        });

      const marcasAgrupadas: Record<string, MarcaTotal> = {};
      let qtdTotalGeral = 0;
      let valorTotalGeral = 0;

      produtosCompletos.forEach((produto: any) => {
        const marca = produto.descricaoMarca;
        const genero = (produto.genero || "").toUpperCase();
        const quantidade = produto.quantidade || 0;
        const valorTotal = quantidade * produto.precoUnitario;

        qtdTotalGeral += quantidade;
        valorTotalGeral += valorTotal;

        if (!marcasAgrupadas[marca]) {
          marcasAgrupadas[marca] = {
            marca,
            qtdMasculino: 0,
            valorMasculino: 0,
            qtdFeminino: 0,
            valorFeminino: 0,
            qtdUnissex: 0,
            valorUnissex: 0,
          };
        }

        if (genero === "MASCULINO") {
          marcasAgrupadas[marca].qtdMasculino += quantidade;
          marcasAgrupadas[marca].valorMasculino += valorTotal;
        } else if (genero === "FEMININO") {
          marcasAgrupadas[marca].qtdFeminino += quantidade;
          marcasAgrupadas[marca].valorFeminino += valorTotal;
        } else {
          marcasAgrupadas[marca].qtdUnissex += quantidade;
          marcasAgrupadas[marca].valorUnissex += valorTotal;
        }
      });

      setMarcasTotais(Object.values(marcasAgrupadas));
      setTotalGeral({ qtdTotal: qtdTotalGeral, valorTotal: valorTotalGeral });
    } catch (error) {
      console.error("Erro ao carregar dados do pedido:", error);
      setError("Falha ao carregar os dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatarValor = (valor: number): string => {
    return formatMoneyToBRL(valor);
  };

  // Calcular totais por gênero
  const calcularTotaisGenero = () => {
    const totais = {
      qtdMasculino: 0,
      valorMasculino: 0,
      qtdFeminino: 0,
      valorFeminino: 0,
      qtdUnissex: 0,
      valorUnissex: 0,
    };

    marcasTotais.forEach((marca) => {
      totais.qtdMasculino += marca.qtdMasculino;
      totais.valorMasculino += marca.valorMasculino;
      totais.qtdFeminino += marca.qtdFeminino;
      totais.valorFeminino += marca.valorFeminino;
      totais.qtdUnissex += marca.qtdUnissex;
      totais.valorUnissex += marca.valorUnissex;
    });

    return totais;
  };

  const totaisGenero = calcularTotaisGenero();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalTitle>Parcial do Pedido Carrinho: {nomeLoja}</ModalTitle>

          {isLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#3490DC" />
              <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
            </View>
          ) : error ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "red" }}>{error}</Text>
            </View>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell header>Marca</TableCell>
                    <TableCell masculine header center>
                      Qtd
                    </TableCell>
                    <TableCell masculine header center>
                      R$
                    </TableCell>
                    <TableCell feminine header center>
                      Qtd
                    </TableCell>
                    <TableCell feminine header center>
                      R$
                    </TableCell>
                    <TableCell unissex header center>
                      Qtd
                    </TableCell>
                    <TableCell unissex header center>
                      R$
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {marcasTotais.map((marca, index) => (
                  <TableRow key={index}>
                    <TableCell>{marca.marca}</TableCell>
                    <TableCell masculine center>
                      {marca.qtdMasculino}
                    </TableCell>
                    <TableCell masculine center>
                      {formatarValor(marca.valorMasculino)}
                    </TableCell>
                    <TableCell feminine center>
                      {marca.qtdFeminino}
                    </TableCell>
                    <TableCell feminine center>
                      {formatarValor(marca.valorFeminino)}
                    </TableCell>
                    <TableCell unissex center>
                      {marca.qtdUnissex}
                    </TableCell>
                    <TableCell unissex center>
                      {formatarValor(marca.valorUnissex)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Rodapé */}
                <TableFooter>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell masculine center>
                      {totaisGenero.qtdMasculino}
                    </TableCell>
                    <TableCell masculine center>
                      {formatarValor(totaisGenero.valorMasculino)}
                    </TableCell>
                    <TableCell feminine center>
                      {totaisGenero.qtdFeminino}
                    </TableCell>
                    <TableCell feminine center>
                      {formatarValor(totaisGenero.valorFeminino)}
                    </TableCell>
                    <TableCell unissex center>
                      {totaisGenero.qtdUnissex}
                    </TableCell>
                    <TableCell unissex center>
                      {formatarValor(totaisGenero.valorUnissex)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell footer>
                      Total: Qtd {totalGeral.qtdTotal}
                    </TableCell>
                    <TableCell footer center>
                      Total: R$ {formatarValor(totalGeral.valorTotal)}
                    </TableCell>
                    <TableCell footer></TableCell>
                    <TableCell footer></TableCell>
                    <TableCell footer></TableCell>
                    <TableCell footer></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </>
          )}

          <ButtonRow>
            <ButtonClose onPress={onClose}>
              <ButtonText>Fechar</ButtonText>
            </ButtonClose>
          </ButtonRow>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalParcialCarrinho;
