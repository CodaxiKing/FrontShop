import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("user_data.db");

export const useBloqueios = async ({
  clienteIdContext,
  representanteId,
}: {
  clienteIdContext: number | string;
  representanteId: number | string;
}) => {
  // 🔍 Buscar bloqueios do Cliente na tabela CarteiraCliente
  const clienteQuery = `SELECT bloqueios FROM CarteiraCliente WHERE clienteId = ?;`;
  const clienteResult = (await db.getFirstAsync(clienteQuery, [
    clienteIdContext,
  ])) as {
    bloqueios?: string;
  } | null;

  // console.log("🟢 Bloqueios do Cliente Selecionado:", clienteResult);

  // 🔍 Buscar bloqueios do Representante na tabela Representante
  const representanteQuery = `SELECT bloqueios FROM Representante WHERE representanteId = ?;`;
  const representanteResult = (await db.getFirstAsync(representanteQuery, [
    representanteId,
  ])) as { bloqueios?: string } | null;

  const bloqueiosCliente = clienteResult?.bloqueios
    ? JSON.parse(clienteResult.bloqueios)
    : [];

  const bloqueiosRepresentante = representanteResult?.bloqueios
    ? JSON.parse(representanteResult.bloqueios)
    : [];

  // console.log("🟢 Bloqueios Cliente Selecionado:", bloqueiosCliente);
  // console.log(
  //   "🟢 Bloqueios Representante Selecionado:",
  //   bloqueiosRepresentante
  // );

  const bloqueiosArray = [...bloqueiosCliente, ...bloqueiosRepresentante];

  // console.log("🟢 Bloqueios Combinados:", bloqueiosArray);

  return bloqueiosArray;
};
