import * as SQLite from "expo-sqlite";
import { ITabelaPrecoItem } from "@/context/interfaces/RepresentanteItem";

const db = SQLite.openDatabaseSync("user_data.db");

/**
 * ✅ RN1: A tabela flexível deve sempre ter prioridade sobre a tabela padrão.
 * ✅ RN2: A hierarquia de seleção da tabela flexível deve seguir: Coligado > Representante > Filial.
 * ✅ RN8: Todas as tabelas enviadas ao app devem conter apenas produtos com estoque disponível.
 *
 * Função que seleciona automaticamente a tabela de preço baseado na hierarquia do cliente.
 * 1. Prioriza tabela FLEXÍVEL (tipo !== "Padrão")
 * 2. Segue hierarquia: Coligado > Representante > Filial
 * 3. Se não houver flexível, retorna TABELA PADRÃO (999999)
 * 4. Retorna apenas produtos com estoque disponível
 *
 * @param clienteData - Dados do cliente (cpfCnpjPai, codigoColigado, codigoFilial)
 * @param representanteId - ID do representante
 * @returns Objeto com a tabela selecionada ou null se nenhuma for encontrada
 */
export const selecionarTabelaPrecoPorHierarquia = async (
  clienteData: {
    cpfCnpj: string;
    clienteId: number;
    codigoColigado?: string;
    codigoFilial?: string;
    cpfCnpjPai?: string;
  },
  representanteId: string
): Promise<{
  value: string | number;
  tipo: string;
  descricao: string;
} | null> => {
  try {
    // ⚠️ Se SQLite não está disponível, retorna null
    if (!db) {
      console.warn("❌ Banco de dados não disponível");
      return null;
    }

    // 1️⃣ Busca tabelas do representante
    const queryRepresentante = `SELECT tabelaPrecos FROM Representante WHERE representanteId = ?`;
    const resultRep = (await (db.getFirstAsync as any)(queryRepresentante, [
      representanteId,
    ])) as { tabelaPrecos: string } | null;

    if (!resultRep || !resultRep.tabelaPrecos) {
      console.warn("❌ Nenhuma tabela encontrada para o representante");
      return null;
    }

    let tabelaPrecos: ITabelaPrecoItem[] = JSON.parse(resultRep.tabelaPrecos);
    console.log(
      `📋 Tabelas encontradas para representante: ${tabelaPrecos.length}`
    );

    // 2️⃣ Remove duplicatas
    tabelaPrecos = Array.from(
      new Map(tabelaPrecos.map((item) => [item.codigo, item])).values()
    );

    // 3️⃣ Filtra por vigência válida - SIMPLIFICADO
    const currentDate = new Date();
    const today = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const tabelasVigentes = tabelaPrecos.filter((item) => {
      // Se não tem data, aceita
      if (!item.dataInicioVigencia) {
        return true;
      }

      try {
        const dataInicio = item.dataInicioVigencia.split("T")[0]; // YYYY-MM-DD
        const dataFim = item.dataFimVigencia?.split("T")[0] || null; // YYYY-MM-DD ou null

        // Comparação simples de strings (ISO format)
        const isAposInicio = today >= dataInicio;
        const isAntesFim = !dataFim || today <= dataFim;

        return isAposInicio && isAntesFim;
      } catch (error) {
        console.warn(
          "⚠️ Erro ao processar datas da tabela:",
          item.codigo,
          error
        );
        return true; // Se der erro, aceita a tabela de qualquer forma
      }
    });

    console.log(
      `📊 Tabelas vigentes: ${tabelasVigentes.length}/${
        tabelaPrecos.length
      } : Tabelas : ${JSON.stringify(tabelasVigentes)}`
    );

    if (tabelasVigentes.length === 0) {
      console.warn(
        "⚠️ Nenhuma tabela vigente encontrada, usando todas sem filtro de datas"
      );
      // Se não tem nenhuma vigente, usa todas mesmo assim
      const tabelasUsadas = tabelaPrecos;
      if (tabelasUsadas.length === 0) {
        return null;
      }
    }

    // 4️⃣ PRIORIDADE: Procura TABELA FLEXÍVEL (tipo !== "999999")
    // Hierarquia: Coligado > Representante > Filial
    const tabelasUsadas =
      tabelasVigentes.length > 0 ? tabelasVigentes : tabelaPrecos;
    const tabelasFlexiveis = tabelasUsadas.filter((t) => t.tipo !== "999999");
    // const tabelasFlexiveis = tabelasUsadas.filter(
    //   (t) => t.tipo && t.tipo.toLowerCase() !== "padrão"
    // );

    console.log(
      `🔹 Tabelas a usar: ${tabelasUsadas.length}, Tabelas flexíveis: ${tabelasFlexiveis.length}`
    );

    let tabelaSelecionada: ITabelaPrecoItem | null = null;

    if (tabelasFlexiveis.length > 0) {
      // 4a) Prioridade 1: COLIGADO (cnpjColigada === cpfCnpjPai do cliente)
      const codigoColigadoCliente =
        clienteData.cpfCnpjPai || clienteData.codigoColigado;
      console.log(
        `🔍 P1 - Procurando tabela COLIGADO: ${codigoColigadoCliente}`
      );

      tabelaSelecionada =
        tabelasFlexiveis.find(
          (t) =>
            String(t.cnpjColigada).trim() ===
            String(codigoColigadoCliente).trim()
        ) || null;

      if (tabelaSelecionada) {
        console.log(
          `✅ Tabela por COLIGADO encontrada: ${tabelaSelecionada.descricao}`
        );
      }

      // 4b) Prioridade 2: REPRESENTANTE (prioridade === 2)
      if (!tabelaSelecionada) {
        console.log(
          `🔍 P2 - Procurando tabela por REPRESENTANTE (prioridade 2) `
        );
        tabelaSelecionada =
          tabelasFlexiveis.find((t) => t.prioridade === 2) || null;
        if (tabelaSelecionada) {
          console.log(
            `✅ Tabela por REPRESENTANTE encontrada: ${tabelaSelecionada.descricao}`
          );
        }
      }

      // 4c) Prioridade 3: FILIAL (prioridade === 3)
      if (!tabelaSelecionada) {
        console.log(`🔍 P3 - Procurando tabela por FILIAL (prioridade 3)`);
        tabelaSelecionada =
          tabelasFlexiveis.find((t) => t.prioridade === 3) || null;
        if (tabelaSelecionada) {
          console.log(
            `✅ Tabela por FILIAL encontrada: ${tabelaSelecionada.descricao}`
          );
        }
      }

      // Se nenhuma prioridade encontrada, usa a primeira flexível disponível
      if (!tabelaSelecionada && tabelasFlexiveis.length > 0) {
        console.log(
          `🔍 Nenhuma prioridade específica, usando primeira tabela flexível`
        );
        tabelaSelecionada = tabelasFlexiveis[0];
        console.log(
          `✅ Tabela flexível selecionada: ${tabelaSelecionada.descricao}`
        );
      }
    }

    // 5️⃣ Se não houver tabela flexível, usa TABELA PADRÃO (código 999999 ou "999999")
    if (!tabelaSelecionada) {
      console.log(
        "⚠️ Nenhuma tabela flexível encontrada, procurando tabela padrão (999999)"
      );
      tabelaSelecionada =
        tabelasUsadas.find((t) => String(t.codigo).trim() === "999999") || null;

      if (tabelaSelecionada) {
        console.log(
          `✅ Tabela padrão encontrada: ${tabelaSelecionada.descricao}`
        );
      }
    }

    if (!tabelaSelecionada) {
      console.warn("❌ Nenhuma tabela de preço disponível para o cliente");
      console.log(
        "Debug - Tabelas disponíveis:",
        tabelasUsadas.map((t) => ({ codigo: t.codigo, descricao: t.descricao }))
      );
      return null;
    }

    console.log(
      `✅ TABELA FINAL SELECIONADA: ${tabelaSelecionada.descricao} (${tabelaSelecionada.codigo})`
    );

    return {
      value: tabelaSelecionada.codigo,
      tipo: tabelaSelecionada.tipo,
      descricao: tabelaSelecionada.descricao,
    };
  } catch (error) {
    console.error("❌ Erro ao selecionar tabela automaticamente:", error);
    return null;
  }
};

/**
 * ✅ CA10: Filtra a lista e retorna apenas produtos que estejam com estoque disponível
 *
 * Busca produtos da tabela de preço selecionada
 * Se tabela flexível tiver 0 produtos, faz fallback para tabela padrão (999999)
 * Campo de estoque: quantidadeEstoquePA
 *
 * @param selectedTabelaPreco - Tabela de preço selecionada
 * @returns Array de produtos com fallback para tabela padrão se flexível estiver vazia
 */
export const getProdutosComEstoque = async (selectedTabelaPreco: {
  value: string | number;
  tipo: string;
}): Promise<any[]> => {
  try {
    // ⚠️ Se SQLite não está disponível, retorna array vazio
    if (!db) {
      console.warn("❌ Banco de dados não disponível");
      return [];
    }

    let produtos: any[] = [];
    const codigoTabela = String(selectedTabelaPreco.value).trim();

    if (codigoTabela === "999999") {
      // 📌 TABELA PADRÃO (Catálogo) - Código 999999
      console.log("📚 Buscando produtos da tabela PADRÃO (Catálogo)...");

      const queryCatalogo = `
        SELECT * FROM Catalogo 
        ORDER BY codigo
        LIMIT 1000
      `;

      produtos = await (db.getAllAsync as any)(queryCatalogo);
      console.log(
        `📦 Total de produtos encontrados na tabela padrão: ${
          produtos?.length || 0
        }`
      );

      if (produtos && produtos.length > 0) {
        const comEstoque = produtos.filter(
          (p: any) => p.quantidadeEstoquePA > 0
        ).length;
        console.log(`   ✅ Produtos COM estoque: ${comEstoque}`);
        console.log(
          `   ⚠️ Produtos SEM estoque: ${produtos.length - comEstoque}`
        );
      }
    } else {
      // 📌 TABELA FLEXÍVEL (TabelaPrecoProduto) - Qualquer outro código
      console.log(
        `🏷️ Buscando produtos da tabela flexível (${codigoTabela})...`
      );

      const queryTabela = `
        SELECT * FROM TabelaPrecoProduto 
        WHERE codigoTabelaPreco = ?
        ORDER BY codigo
        LIMIT 1000
      `;

      produtos = await (db.getAllAsync as any)(queryTabela, [codigoTabela]);
      console.log(
        `📦 Total de produtos encontrados na tabela flexível: ${
          produtos?.length || 0
        }`
      );

      if (produtos && produtos.length > 0) {
        const comEstoque = produtos.filter(
          (p: any) => p.quantidadeEstoquePA > 0
        ).length;
        console.log(
          `   ✅ Produtos COM estoque (quantidadeEstoquePA > 0): ${comEstoque}`
        );
        console.log(
          `   ⚠️ Produtos SEM estoque: ${produtos.length - comEstoque}`
        );
        console.log(
          `   📊 Amostra de estoque - Primeiros 3: ${produtos
            .slice(0, 3)
            .map((p: any) => `${p.codigo}:${p.quantidadeEstoquePA ?? "NULL"}`)
            .join(", ")}`
        );
      }
    }

    return produtos || [];
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error);
    return [];
  }
};
