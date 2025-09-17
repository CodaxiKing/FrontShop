import * as SQLite from "expo-sqlite";
import { Destinatario } from "./types";

const db = SQLite.openDatabaseSync("user_data.db");

export const PAGE_SIZE_DEFAULT = 100;

type PageArgs = {
  limit?: number;
  offset?: number;
  search?: string; // opcional
};

export async function fetchDestinatarios({
  limit = PAGE_SIZE_DEFAULT,
  offset = 0,
  search = "",
}: PageArgs): Promise<Destinatario[]> {
  try {
    const hasSearch = !!search && search.trim() !== "";
    const like = `%${search.trim().toLowerCase()}%`;

    const sql = `
      SELECT clienteId, codigo, nomeReduzido, email
      FROM CarteiraCliente
      WHERE email IS NOT NULL AND email <> ''
      ${
        hasSearch
          ? `AND (
        LOWER(codigo) LIKE ? OR
        LOWER(nomeReduzido) LIKE ? OR
        LOWER(email) LIKE ?
      )`
          : ""
      }
      ORDER BY codigo, nomeReduzido
      LIMIT ? OFFSET ?;
    `;

    const params = hasSearch
      ? [like, like, like, limit, offset]
      : [limit, offset];

    const rows = await db.getAllAsync<Destinatario>(sql, params);
    return rows;
  } catch (error) {
    console.error("Mala Direta - Erro ao buscar página de clientes:", error);
    return [];
  }
}

export const fetchPedidos = async () => {
  const query = "SELECT * FROM Pedido WHERE status = 1";
  try {
    const result = await db.getAllAsync(query);
    return result;
  } catch (error) {
    console.error("Maladireta: Erro ao buscar pedidos:", error);
    throw error;
  }
};
