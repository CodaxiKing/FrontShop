import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import {
  Container,
  SectionContainer,
  SectionHeader,
  InputRow,
  SectionSubHeader,
} from "./style";
import InputFieldComponent from "../InputFieldComponent";
import {
  vendaAcumuladaPorMarcaInfo,
  analisePorMarcaInfo,
  rankingDeProdutos2Info,
  rankingDeProdutosInfo,
} from "../../mocks/tableInfoMocks";
import { TableStripped } from "../TableStripped";

import * as SQLite from "expo-sqlite";
import { useRoute } from "@react-navigation/native";

const db = SQLite.openDatabaseSync("user_data.db");

interface DetalhesClienteProps {
  codigoCliente: string;
}
interface Cliente {
  tipologia: string;
  bairro: string;
  estado: string;
  contato: string;
  telefone: string;
  email: string;
  prazoMedio: string;
  limiteDisponivel: string;
  enderecos?: string;
}

export const DetalhesCliente = ({ codigoCliente }: DetalhesClienteProps) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (codigoCliente) {
      // console.log("Código do cliente recebido:", codigoCliente);
      fetchClienteDetalhes(codigoCliente);
    } else {
      console.warn("Código do cliente não fornecido.");
      setLoading(false);
    }
  }, [codigoCliente]);

  const fetchClienteDetalhes = async (codigo: string) => {
    console.log("Buscando detalhes do cliente... :", codigo);
    try {
      const query = `SELECT * FROM CarteiraCliente WHERE codigo = ?`;
      const result: Partial<Cliente> | null = await db.getFirstAsync(query, [
        codigo,
      ]);
      // console.log("Resultado da busca:", result);

      if (result) {
        // Desserializa os endereços
        const enderecos = result.enderecos ? JSON.parse(result.enderecos) : [];

        setCliente({
          tipologia: result?.tipologia || "",
          bairro: enderecos[0]?.bairro || "N/A",
          estado: enderecos[0]?.estado || "N/A",
          contato: result?.contato || "N/A",
          telefone: result?.telefone || "N/A",
          email: result?.email || "N/A",
          prazoMedio: result?.prazoMedio?.toString() || "N/A",
          limiteDisponivel: result?.limiteDisponivel?.toString() || "N/A",
          enderecos,
        });
      } else {
        console.warn("Cliente não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ width: "100%" }}>
      <Container>
        <SectionContainer>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="N/A"
              label="Tipologia"
              value={cliente?.tipologia}
            />
            <InputFieldComponent
              disabled
              placeholder="N/A"
              label="Número de Lojas"
              value={cliente?.enderecos?.length.toString()}
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Del Castilho"
              label="Bairro"
              value={cliente?.bairro}
            />
            <InputFieldComponent
              disabled
              placeholder="Rio de Janeiro"
              label="Estado"
              value={cliente?.estado}
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="21 999999999"
              label="Contato"
              value={cliente?.contato}
            />
            <InputFieldComponent
              disabled
              placeholder="21 999999999"
              label="Telefone"
              value={cliente?.telefone}
            />
          </InputRow>
          <InputFieldComponent
            disabled
            placeholder="criaresistemas@criare.com"
            label="Email"
            value={cliente?.email}
          />
        </SectionContainer>

        {/* Informações Financeiras */}
        <SectionContainer>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Prazo Médio 12 (m)"
              value={cliente?.prazoMedio}
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Limite Disponível"
              value={cliente?.limiteDisponivel}
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Pós roteiro"
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Em Atraso"
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="A vencer"
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Atraso médio 12 (ms)"
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Frete Acordado"
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Desconto Acordado"
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Tempo Médio Entrega"
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Máximo Transporte"
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Pedidos Reprovados 30 (d)"
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="OS's Aprovações Pendentes"
            />
          </InputRow>
          <InputRow>
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="OS's Estornadas (30d)"
            />
            <InputFieldComponent
              disabled
              placeholder="Digite"
              label="Senha Portal"
            />
          </InputRow>
        </SectionContainer>

        {/* Tabelas */}
        <>
          {/* Venda Acumulada Por Marca */}
          {/* <SectionContainer>
            <SectionHeader>Venda Acumulada por Marca</SectionHeader>
          </SectionContainer>
          <SectionContainer>
            <TableStripped
              columns={vendaAcumuladaPorMarcaInfo.columns}
              data={vendaAcumuladaPorMarcaInfo.data}
            />
          </SectionContainer> */}
          {/* Análise Por Marca */}
          {/* <SectionContainer>
            <SectionHeader>Análise Por Marca</SectionHeader>
          </SectionContainer>
          <SectionContainer>
            <TableStripped
              columns={analisePorMarcaInfo.columns}
              data={analisePorMarcaInfo.data}
            />
          </SectionContainer> */}
          {/* Ranking de Produtos 1 */}
          {/* <SectionContainer>
            <SectionHeader>Ranking de Produtos</SectionHeader>
          </SectionContainer>
          <SectionContainer>
            <TableStripped
              columns={rankingDeProdutosInfo.columns}
              data={rankingDeProdutosInfo.data}
            />
          </SectionContainer> */}
          {/* Ranking de Produtos 2 */}
          {/* <SectionContainer>
            <SectionHeader>Ranking de Produtos 2</SectionHeader>
          </SectionContainer>
          <SectionContainer>
            <TableStripped
              columns={rankingDeProdutos2Info.columns}
              data={rankingDeProdutos2Info.data}
            />
          </SectionContainer> */}
        </>
      </Container>
    </ScrollView>
  );
};
