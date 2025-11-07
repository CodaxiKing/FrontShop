import ProdutoImg01 from "../assets/images/relogios/relogio01.png";
import ProdutoImg02 from "../assets/images/relogios/relogio02.png";
import ProdutoImg03 from "../assets/images/relogios/relogio03.png";

interface Empresa {
  id: string;
  nome: string;
  endereco: string;
  produtos: Produto[];
}

interface Produto {
  codigo: string;
  nome: string;
  quantidade: number;
  imagem: any;
  valorProduto: number;
}

const mockEmpresas: Empresa[] = [
  {
    id: "1",
    nome: "RELOJOARIA EXEMPLO 01 - RJ",
    endereco: "Rua Alameda dos Anjos 100, Rio de Janeiro - RJ",
    produtos: [
      {
        codigo: "#TMAXAN/1D",
        nome: "Relógio X3 Edition",
        quantidade: 1,
        valorProduto: 100,
        imagem: ProdutoImg01,
      },
      {
        codigo: "#TMAXAN/2D",
        nome: "Relógio X3 Edition",
        quantidade: 1,
        valorProduto: 100,
        imagem: ProdutoImg02,
      },
      {
        codigo: "#TMAXAN/3D",
        nome: "Relógio X3 Edition",
        quantidade: 1,
        valorProduto: 100,
        imagem: ProdutoImg03,
      },
      {
        codigo: "#TMAXAN/4D",
        nome: "Relógio X3 Edition",
        quantidade: 1,
        valorProduto: 100,
        imagem: ProdutoImg01,
      },
      // {
      //   codigo: "#TMAXAN/5D",
      //   nome: "Relógio X3 Edition",
      //   quantidade: 1,
      //   valorProduto: 100,
      //   imagem: ProdutoImg02,
      // },
      // {
      //   codigo: "#TMAXAN/6D",
      //   nome: "Relógio X3 Edition",
      //   quantidade: 1,
      //   valorProduto: 100,
      //   imagem: ProdutoImg03,
      // },
      // {
      //   codigo: "#TMAXAN/7D",
      //   nome: "Relógio X3 Edition",
      //   quantidade: 1,
      //   valorProduto: 100,
      //   imagem: ProdutoImg01,
      // },
      // {
      //   codigo: "#TMAXAN/8D",
      //   nome: "Relógio X3 Edition",
      //   quantidade: 1,
      //   valorProduto: 100,
      //   imagem: ProdutoImg02,
      // },
      // {
      //   codigo: "#TMAXAN/9D",
      //   nome: "Relógio X3 Edition",
      //   quantidade: 1,
      //   valorProduto: 100,
      //   imagem: ProdutoImg03,
      // },
    ],
  },
];

export default mockEmpresas;
