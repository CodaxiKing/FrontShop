import { FreteItem } from "@/context/interfaces/FreteItem";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("user_data.db");

/**
 * Obtém o percentual de frete aplicável a um cliente com base no valor total do pedido,
 * considerando regras de valor mínimo, coligado e filial do representante.
 *
 * @param clienteId - ID do cliente
 * @param valorTotalPedido - Valor total do pedido (com ou sem desconto, conforme o caso)
 * @param representanteId - ID do representante
 * @returns Percentual de frete como número decimal (ex: 6.75) ou `null` se não encontrado
 */

export const getFretePercentualPorCliente = async (
  clienteId: number,
  valorTotalPedido: number,
  representanteId: number
): Promise<number | null> => {
  try {
    // Busca frete padrão por filial do representante
    const queryFreteByFilial = `
      SELECT * FROM Frete 
      WHERE filialRepresentante IN (
        SELECT filialRepresentanteCodigoFilialRepresentante 
        FROM Representante 
        WHERE representanteId = ? LIMIT 1
      );`;

    const resultFreteByFilial = (await db.getAllAsync(queryFreteByFilial, [
      representanteId,
    ])) as FreteItem[];

    if (!resultFreteByFilial.length) {
      console.warn("⚠️ Nenhum frete encontrado pela filial.");
      return null;
    }

    const freteFilial = resultFreteByFilial[0];

    // 1️⃣ Caso valor do pedido seja menor ou igual ao mínimo
    if (
      freteFilial.valorFretePedidoMinimo &&
      valorTotalPedido <= freteFilial.valorFretePedidoMinimo
    ) {
      return freteFilial.percentualFretePedidoMinimo;
    }

    // 2️⃣ Caso exista valor de frete vinculado ao código coligado do cliente
    const queryFreteByCodigoColigado = `
      SELECT * FROM Frete 
      WHERE codigoColigado IN (
        SELECT codigoColigado 
        FROM CarteiraCliente 
        WHERE clienteId = ? LIMIT 1
      );`;

    const resultFreteByCodigoColigado = (await db.getAllAsync(
      queryFreteByCodigoColigado,
      [clienteId]
    )) as FreteItem[];

    if (resultFreteByCodigoColigado.length > 0) {
      return resultFreteByCodigoColigado[0].valorFrete;
    }

    // 3️⃣ Retorna frete padrão da filial
    return freteFilial.fretePadrao || null;
  } catch (error) {
    console.warn("❌ Erro ao buscar percentual de frete:", error);
    return null;
  }
};
