import React, { useContext, useEffect, useState } from "react";
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
import AuthContext from "@/context/AuthContext";
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
  cnpjCliente: string;
  visible: boolean;
  onClose: () => void;
}

export const ModalParcialGeral: React.FC<ModalTabelaProps> = ({
  visible,
  onClose,
  cnpjCliente,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marcasTotais, setMarcasTotais] = useState<MarcaTotal[]>([]);
  const [totalGeral, setTotalGeral] = useState({
    qtdTotal: 0,
    valorTotal: 0,
  });
  const [nomeLojas, setNomeLojas] = useState<string>("");

  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  useEffect(() => {
    if (visible) {
      carregarDadosPedido();
    }
  }, [visible]);

  const carregarDadosPedido = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Consulta os pedidos no banco
      const querySelectPedidos = `
        SELECT produtos, razaoSocial FROM NovoPedido WHERE cpfCnpj = ? AND representanteId = ? LIMIT 1;

      `;

      if (!representanteId) {
        throw new Error("Representante ID não encontrado");
      }

      const pedidosResult = await db.getAllAsync(querySelectPedidos, [
        cnpjCliente,
        representanteId,
      ]);

      if (pedidosResult.length === 0) {
        throw new Error("Nenhum pedido encontrado");
      }

      let todosProdutos: any[] = [];
      let lojasUnicas: Set<string> = new Set();

      pedidosResult.forEach((pedido: any) => {
        try {
          const produtosPedido = JSON.parse(pedido.produtos || "[]");

          produtosPedido.forEach((loja: any) => {
            if (loja.cpfCnpj) {
              lojasUnicas.add(pedido.razaoSocial || "Loja desconhecida");
              if (Array.isArray(loja.produtos)) {
                todosProdutos = [...todosProdutos, ...loja.produtos];
              }
            }
          });
        } catch (error) {
          console.error("Erro ao processar produtos do pedido:", error);
        }
      });

      setNomeLojas(Array.from(lojasUnicas).join(", "));

      if (todosProdutos.length === 0) {
        throw new Error("Nenhum produto encontrado no carrinho");
      }

      // Buscar informações detalhadas dos produtos no catálogo
      const codigosProdutos = todosProdutos
        .map((p: any) => p.codigo)
        .join("','");

      const queryCatalogo = `
        SELECT codigo, descricaoMarca, genero, precoUnitario, precoComIPI
        FROM Catalogo
        WHERE codigo IN ('${codigosProdutos}')
      `;

      const catalogoResult = await db.getAllAsync(queryCatalogo);

      // console.log("Catalogo Result:", catalogoResult);

      // Mapeamento de produtos com suas informações completas
      const produtosCompletos = todosProdutos
        .filter((p) => p.tipo !== "E")
        .map((produto: any) => {
          const infoCatalogo =
            catalogoResult.find(
              (item: any) => item.codigo === produto.codigo
            ) || {};

          const tipo = produto.tipo || "R";
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

      // Agrupar produtos por marca
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

      const marcasArray = Object.values(marcasAgrupadas);

      setMarcasTotais(marcasArray);
      setTotalGeral({
        qtdTotal: qtdTotalGeral,
        valorTotal: valorTotalGeral,
      });
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
          <ModalTitle>Parcial Geral do Pedido: {nomeLojas}</ModalTitle>

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
