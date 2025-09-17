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

import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";

import * as SQLite from "expo-sqlite";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
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

const ModalParcialEditarPedidoAberto: React.FC<ModalTabelaProps> = ({
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

  const { carrinho } = useEditarPedidoAberto();

  useEffect(() => {
    if (visible && pedidoId && representanteId) {
      carregarDadosPedido();
    }
  }, [visible, pedidoId, representanteId]);

  const carregarDadosPedido = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const produtosDoCarrinho = carrinho;

      let produtosCliente = [];

      if (cpfCnpj) {
        produtosCliente = produtosDoCarrinho.filter(
          (p) => p.cpfCnpj === cpfCnpj
        );

        if (
          produtosCliente.length === 0 &&
          produtosDoCarrinho.length > 0 &&
          !("cpfCnpj" in produtosDoCarrinho[0])
        ) {
          // Se não veio cpfCnpj nos produtos, assume todos como do cliente
          produtosCliente = produtosDoCarrinho.map((p) => ({
            ...p,
            cpfCnpj,
          }));
        }
      } else {
        produtosCliente = produtosDoCarrinho;
      }

      // Buscar nome da loja
      const buscarRazaoSocial = async (cpf: string): Promise<string> => {
        try {
          const result = await db.getAllAsync(
            "SELECT razaoSocial FROM CarteiraCliente WHERE cpfCnpj = ? LIMIT 1;",
            [cpf]
          );
          return result[0]?.razaoSocial || "Loja";
        } catch {
          return "Loja";
        }
      };

      const nomeLojaTmp = cpfCnpj ? await buscarRazaoSocial(cpfCnpj) : "Loja";

      setNomeLoja(nomeLojaTmp);

      // Buscar dados complementares do catálogo
      const codigosProdutos = produtosCliente
        .map((p) => `'${p.codigo}'`)
        .join(",");
      const catalogoResult = await db.getAllAsync(`
      SELECT codigo, descricaoMarca, genero, precoUnitario FROM Catalogo 
      WHERE codigo IN (${codigosProdutos})
    `);

      // Completar e agrupar produtos
      const produtosCompletos = produtosCliente
        .filter((p) => p.tipo !== "E") // ignora tipo E
        .map((produto) => {
          const info =
            catalogoResult.find((c) => c.codigo === produto.codigo) || {};

          const quantidade = produto.quantidade || 0;
          let precoUnitario =
            typeof produto.precoUnitario === "number" &&
            produto.precoUnitario > 0
              ? produto.precoUnitario
              : info.precoUnitario || 0;

          if (produto.precoUnitarioComIPI) {
            precoUnitario = produto.precoUnitarioComIPI;
          }

          return {
            ...produto,
            precoUnitario,
            descricaoMarca:
              info.descricaoMarca || produto.descricaoMarca || "Sem marca",
            genero: (info.genero || "").toUpperCase(),
            quantidade,
          };
        });

      // Agrupamento por marca e gênero
      const marcasAgrupadas: Record<string, MarcaTotal> = {};
      let qtdTotalGeral = 0;
      let valorTotalGeral = 0;

      produtosCompletos.forEach((p) => {
        const marca = p.descricaoMarca || "Marca Desconhecida";
        const genero = p.genero || "UNISSEX";
        const quantidade = p.quantidade;
        const valorTotal = quantidade * p.precoUnitario;

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
      setError("Erro ao carregar dados do pedido");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar valores monetários
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
          <ModalTitle>Parcial do Pedido Aberto: {nomeLoja}</ModalTitle>

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

          {/* Botão Fechar */}
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

export default ModalParcialEditarPedidoAberto;
