import logoFornecedor from "../assets/images/icon-criare.png";

interface EmpresaDestino {
  id: number;
  code: number;
  nome: string;
  email: string;
  imagem: string | number;
}

const destinatarios: EmpresaDestino[] = [
  {
    id: 1,
    code: 10001,
    nome: "Criare Sistemas",
    email: "criaresistemas1@criare.com",
    imagem: logoFornecedor,
  },
  {
    id: 2,
    code: 10002,
    nome: "Criare Sistemas",
    email: "criaresistemas1@criare.com",
    imagem: logoFornecedor,
  },
  {
    id: 3,
    code: 10003,
    nome: "Criare Sistemas",
    email: "criaresistemas1@criare.com",
    imagem: logoFornecedor,
  },
  {
    id: 4,
    code: 10004,
    nome: "Criare Sistemas",
    email: "criaresistemas1@criare.com",
    imagem: logoFornecedor,
  },
  {
    id: 5,
    code: 10005,
    nome: "Criare Sistemas",
    email: "criaresistemas1@criare.com",
    imagem: logoFornecedor,
  },
  {
    id: 6,
    code: 10006,
    nome: "Criare Sistemas",
    email: "criaresistemas1@criare.com",
    imagem: logoFornecedor,
  },
];

export default destinatarios;
