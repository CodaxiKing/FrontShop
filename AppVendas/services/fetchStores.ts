import { Database } from "@/database/Database";
import { Endereco } from "@/types/types";

const db = Database.getConnection();

export interface Store {
  cpfCnpj: string;
  cpfCnpjPai: string;
  razaoSocial: string;
  nomeReduzido: string;
  enderecos: Endereco[];
}

export async function fetchStoresByCliente(
  cnpjCliente: string
): Promise<Store[]> {
  try {
    const query = `
      SELECT cpfCnpjPai, cpfCnpj, razaoSocial, nomeReduzido, enderecos
      FROM CarteiraCliente
      WHERE codigoColigado = (
        SELECT codigoColigado
        FROM CarteiraCliente
        WHERE cpfCnpj = '${cnpjCliente}'
        LIMIT 1
      );
    `;
    const result = await db.getAllAsync(query);

    const unique = (result ?? []).filter(
      (value: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.cpfCnpj === value.cpfCnpj)
    );

    return unique as Store[];
  } catch (e) {
    console.error("Erro ao buscar lojas filhas:", e);
    return [];
  }
}
