export const vendaAcumuladaPorMarcaInfo = {
  columns: [
    { key: "rank", title: "RANK", width: "80px" },
    { key: "marca", title: "Marca", width: "150px" },
    { key: "fatXXXX", title: "Fat.XXXX", width: "120px" },
    { key: "percentCre1", title: "%Cre.", width: "80px" },
    { key: "fatXxxx", title: "Fat.X XXX", width: "120px" },
    { key: "percentCre2", title: "%Cre.", width: "80px" },
    { key: "janDezXXXX", title: "JAN-DEZ/XXXX", width: "150px" },
    { key: "percentCre3", title: "%Cre.", width: "80px" },
    { key: "janDezYYYY", title: "JAN-DEZ/YYYY", width: "150px" },
    { key: "percentCre4", title: "%Cre.", width: "80px" },
    { key: "janDezZZZZ", title: "JAN-DEZ/ZZZZ", width: "150px" },
    { key: "percentCre5", title: "%Cre.", width: "80px" },
  ],
  data: [
    {
      rank: 1,
      marca: "Marca A",
      fatXXXX: "1000",
      percentCre1: "10%",
      fatXxxx: "2000",
      percentCre2: "20%",
      janDezXXXX: "3000",
      percentCre3: "30%",
      janDezYYYY: "4000",
      percentCre4: "40%",
      janDezZZZZ: "5000",
      percentCre5: "50%",
    },
    {
      rank: 2,
      marca: "Marca B",
      fatXXXX: "1500",
      percentCre1: "15%",
      fatXxxx: "2500",
      percentCre2: "25%",
      janDezXXXX: "3500",
      percentCre3: "35%",
      janDezYYYY: "4500",
      percentCre4: "45%",
      janDezZZZZ: "5500",
      percentCre5: "55%",
    },
    {
      rank: 3,
      marca: "Marca C",
      fatXXXX: "1200",
      percentCre1: "12%",
      fatXxxx: "2200",
      percentCre2: "22%",
      janDezXXXX: "3200",
      percentCre3: "32%",
      janDezYYYY: "4200",
      percentCre4: "42%",
      janDezZZZZ: "5200",
      percentCre5: "52%",
    },
  ],
};

export const analisePorMarcaInfo = {
  columns: [
    { key: "ultimaCompra", title: "Últ. Compra", width: "150px" },
    { key: "precoMedio", title: "Preço médio (12m)", width: "200px" },
    { key: "pedidoMedio", title: "Pedido médio", width: "150px" },
    { key: "pecasPorPedido", title: "Pçs./Pedido", width: "150px" },
    { key: "marca", title: "Marca", width: "150px" },
  ],
  data: [
    {
      ultimaCompra: "01/01/2024",
      precoMedio: "R$ 120,00",
      pedidoMedio: "R$ 1.200,00",
      pecasPorPedido: "25",
      marca: "Marca A",
    },
    {
      ultimaCompra: "15/12/2023",
      precoMedio: "R$ 100,00",
      pedidoMedio: "R$ 1.000,00",
      pecasPorPedido: "20",
      marca: "Marca B",
    },
    {
      ultimaCompra: "10/11/2023",
      precoMedio: "R$ 110,00",
      pedidoMedio: "R$ 1.100,00",
      pecasPorPedido: "22",
      marca: "Marca C",
    },
  ],
};

export const rankingDeProdutosInfo = {
  columns: [
    { key: "marca", title: "Marca", width: "375px" },
    { key: "vendedor", title: "Vendedor", width: "375px" },
  ],
  data: [
    { marca: "Marca A", vendedor: "Vendedor 1" },
    { marca: "Marca B", vendedor: "Vendedor 2" },
    { marca: "Marca C", vendedor: "Vendedor 3" },
    { marca: "Marca D", vendedor: "Vendedor 4" },
    { marca: "Marca E", vendedor: "Vendedor 5" },
  ],
};

export const rankingDeProdutos2Info = {
  columns: [
    { key: "rankBrasil1", title: "RANK Brasil", width: "250px" },
    { key: "rankBrasil2", title: "RANK Brasil", width: "250px" },
    { key: "rankVendedor", title: "RANK Vendedor", width: "250px" },
  ],
  data: [
    { rankBrasil1: 1, rankBrasil2: 2, rankVendedor: 3 },
    { rankBrasil1: 2, rankBrasil2: 3, rankVendedor: 1 },
    { rankBrasil1: 3, rankBrasil2: 1, rankVendedor: 2 },
    { rankBrasil1: 4, rankBrasil2: 5, rankVendedor: 4 },
    { rankBrasil1: 5, rankBrasil2: 4, rankVendedor: 5 },
  ],
};
