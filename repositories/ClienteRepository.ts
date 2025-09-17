import { executeQuery } from "@/services/dbService";
import { queryBuscarRazaoSocial } from "@/database/queries/clienteQueries";

export async function buscarRazaoSocial(cpfCnpj: string, clienteId: number): Promise<string> {
  const result = await executeQuery<{ razaoSocial: string }>(
    queryBuscarRazaoSocial,
    [cpfCnpj, clienteId]
  );

  return result.length > 0 ? result[0].razaoSocial : "Novo Pedido";
}
