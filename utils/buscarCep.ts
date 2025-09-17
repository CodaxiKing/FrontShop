// Função para buscar o CEP
import axios from "axios";

export interface CepData {
  cep: string;
  logradouro: string;
  estado: string;
  municipio: string;
  endereco: string;
  complemento: string;
  bairro: string;
  localidade: string; // município
  uf: string; // estado
  tipo: 1;
}

export interface BffEndereco {
  bairro: string;
  cep: string; // só números, 8 dígitos
  complemento: string;
  numero?: string; // opcional, pode ser vazio
  endereco: string; // corresponde ao logradouro retornado pela ViaCEP
  estado: string; // uf
  municipio: string; // localidade
  uf: string; // estado
  tipo: number;
}

/**
 *
 * @param cepInput CEP a ser buscado, deve conter 8 dígitos numéricos.
 * @description Busca o CEP na API ViaCEP e retorna os dados formatados.
 * @returns Um objeto contendo os dados do endereço formatados.
 */
export async function buscarCep(cepInput: string): Promise<BffEndereco> {
  const cep = cepInput.replace(/\D/g, "");
  const validacep = /^[0-9]{8}$/;

  // 1. Limpar e validar formato Do Cep
  if (!validacep.test(cep)) {
    throw new Error(
      "Formato de CEP inválido. Deve conter 8 dígitos numéricos."
    );
  }

  // 2. Chamada à API ViaCEP
  try {
    const { data } = await axios.get<CepData & { erro?: boolean }>(
      `https://viacep.com.br/ws/${cep}/json/`,
      { timeout: 10000 }
    );

    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }

    // 3. Mapear para a interface
    return {
      bairro: data.bairro,
      cep: data.cep,
      complemento: data.complemento,
      endereco: data.logradouro,
      estado: data.estado,
      municipio: data.localidade,
      uf: data.uf,
      tipo: 1, // Tipo fixo, pode ser ajustado conforme necessidade
    } as CepData;
  } catch (err: any) {
    if (err.code === "ECONNABORTED") {
      throw new Error("Tempo de conexão esgotado ao buscar CEP.");
    }
    throw new Error(err.message || "Erro ao buscar CEP.");
  }
}

/* 
  JSON DE ENDEREÇO RETORNADO PELO BFF
{
  "bairro": "RIO BRANCO",
  "cep": "93320021",
  "complemento": "LJ 2080",
  "endereco": "AV NACOES UNIDAS, 2001",
  "estado": "RS",
  "municipio": "NOVO HAMBURGO",
  "tipo": 1
},

  JSON DE ENDEREÇO RETORNADO PELA VIA CEP
{
      "cep": "01001-000",
      "logradouro": "Praça da Sé",
      "complemento": "lado ímpar",
      "unidade": "",
      "bairro": "Sé",
      "localidade": "São Paulo",
      "uf": "SP",
      "estado": "São Paulo",
      "regiao": "Sudeste",
      "ibge": "3550308",
      "gia": "1004",
      "ddd": "11",
      "siafi": "7107"
    }
*/
