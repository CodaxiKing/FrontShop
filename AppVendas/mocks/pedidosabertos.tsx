interface Order {
  id: string;
  date: string;
  client: string;
  products: number;
  total: string;
  status: string;
}

export const mockDataPedidos: Order[] = [
  {
    id: "#1001",
    date: "02/09/2024",
    client: "Criare Sistemas",
    products: 30,
    total: "R$20.000,00",
    status: "Aberto",
  },
  {
    id: "#1002",
    date: "04/09/2024",
    client: "Criare Sistemas",
    products: 120,
    total: "R$90.000,00",
    status: `Falha Process.`,
  },
  {
    id: "#1003",
    date: "04/09/2024",
    client: "Criare Sistemas",
    products: 120,
    total: "R$90.000,00",
    status: `Erro ${"\n"}Process.`,
  },
  {
    id: "#1004",
    date: "05/09/2024",
    client: "Criare Sistemas",
    products: 80,
    total: "R$50.000,00",
    status: "Concluído",
  },
];
