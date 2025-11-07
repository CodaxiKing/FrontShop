import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("user_data.db");

export async function fetchLojas() {
  try {
    const queryDeLojas = `
      SELECT
          "CpfCnpjPai"
      FROM
          "CarteiraCliente"
      GROUP BY
          "CpfCnpjPai"
      HAVING
          COUNT(*) > 1
    `;
    const result = await db.getAllAsync(queryDeLojas);
    return result;
  } catch (error) {
    throw new Error("Erro ao buscar lojas: " + error);
  }
}

/**
 * Busca clientes por nome, código ou CPF/CNPJ (com máscara ou sem).
 * - Termos < 3 chars retornam [] para evitar varredura pesada.
 */

export async function fetchClienteDBSearch(search: string) {
  const hasSearch = !!search && search.trim() !== "";
  const like = `%${search.trim().toLowerCase()}%`;

  if (search.length < 3) {
    return [];
  }

  const sql = `
      SELECT codigo, nomeReduzido, razaoSocial, cpfCnpj, cpfCnpjPai, enderecos
      FROM CarteiraCliente
      ${
        hasSearch
          ? `WHERE (
               LOWER(codigo)       LIKE ? OR
               LOWER(razaoSocial)  LIKE ? OR
               LOWER(cpfCnpj)      LIKE ? OR
               LOWER(cpfCnpjPai)   LIKE ?
             )`
          : ""
      }
      ORDER BY codigo, nomeReduzido
      ;
    `;
  const params = hasSearch ? [like, like, like, like] : [];

  return db.getAllAsync(sql, params);
}

/**
 * Paginação básica por código (navegação).
 */
export async function fetchClienteDBData(
  currentPage: number,
  itemsPerPage: number
) {
  const offset = (currentPage - 1) * itemsPerPage;
  const query = `
    SELECT clienteId, codigo, nomeReduzido, razaoSocial, cpfCnpj, cpfCnpjPai, enderecos
    FROM CarteiraCliente
    ORDER BY codigo, nomeReduzido
    LIMIT ? OFFSET ?;
  `;
  return db.getAllAsync(query, [itemsPerPage, offset]);
}
