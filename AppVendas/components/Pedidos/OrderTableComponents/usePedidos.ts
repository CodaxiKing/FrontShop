// OrderTableComponents/usePedidos.ts
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("user_data.db");

export function usePedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPedidosDB();
  }, []);

  const fetchPedidosDB = async () => {
    setLoading(true);
    try {
      const query = "SELECT * FROM Pedido";
      const result = await db.getAllAsync(query);
      setPedidos(result);
    } catch (error) {
      console.error("Erro ao buscar dados de pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  return { pedidos, loading };
}
