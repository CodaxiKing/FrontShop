import { Endereco } from "@/components/CardCarrinho/IconesCardCarrinho";

export const formatarEnderecoCompleto = (
  endereco: Endereco | null | undefined
): string => {
  if (!endereco) return "Endereço não disponível";

  const logradouro = endereco.endereco?.trim() || "";
  const numero = endereco.numero?.trim() || "";
  const complemento = endereco.complemento?.trim() || "";
  const bairro = endereco.bairro?.trim() || "";
  const municipio = endereco.municipio?.trim() || "";
  const estado = endereco.estado?.trim() || "";
  const cep = endereco.cep?.trim() || "";

  const partes = [
    `${logradouro}, ${numero}\n${bairro},\n${municipio} - ${estado}${
      complemento ? `\n${complemento}` : ""
    }`,
  ];

  return partes.filter(Boolean).join(", ").toUpperCase();
};
