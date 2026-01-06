import React, { useState, useContext } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  CardContainer,
  InfoRow,
  Label,
  Value,
  Separator,
  IconContainer,
  IconButton,
  CheckButtonContainer,
  CheckButton,
} from "./style";
import { ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";
import { useOrientation } from "@/context/OrientationContext";
import { AntDesign } from "@expo/vector-icons";
import { PedidoCopiaProvider } from "@/context/PedidoCopiaContext";
import { selecionarTabelaPrecoPorHierarquia, getProdutosComEstoque } from "@/helpers/selecionarTabelaPrecoPorHierarquia";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import AuthContext from "@/context/AuthContext";
import { useTopContext } from "@/context/TopContext";

interface CardClienteProps {
  cliente: {
    codigo: string;
    cpfCnpj: string;
    razaoSocial: string;
    enderecoCompleto: string;
    [key: string]: any; // Para aceitar outras propriedades
  };
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
  isSelected: boolean;
  onSelect: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TopRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

export const CardCliente: React.FC<CardClienteProps> = ({
  cliente,
  isSelected,
  onSelect,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TopRouteProp>();
  const { isModoPaisagem, width } = useOrientation();
  const { setClientInfo } = useClientInfoContext();
  const { userData } = useContext(AuthContext);
  const { updateCarrinhosCount } = useTopContext();
  const [isLoading, setIsLoading] = useState(false);

  if (!cliente) {
    console.warn("Cliente não foi fornecido.");
    return null;
  }

  /**
   * 🎯 Seleção Automática da Tabela de Preço
   * Executa a hierarquia automaticamente quando o cliente é selecionado
   * Sem modal de seleção - direto para o catálogo
   */
  const handleSelectTabelaPreco = async () => {
    setIsLoading(true);
    try {
      const representanteId = userData?.representanteId || "";

      if (!representanteId) {
        Alert.alert("Erro", "Representante não identificado");
        setIsLoading(false);
        return;
      }

      // ✅ CA1: Identifica automaticamente a tabela base do cliente seguindo a hierarquia
      const tabelaSelecionada = await selecionarTabelaPrecoPorHierarquia(
        {
          cpfCnpj: cliente.cpfCnpj,
          clienteId: Number(cliente.clienteId || cliente.codigo),
          codigoColigado: cliente.codigoColigado,
          codigoFilial: cliente.codigoFilial,
          cpfCnpjPai: cliente.cpfCnpjPai,
        },
        representanteId
      );

      if (!tabelaSelecionada) {
        Alert.alert(
          "Sem Tabela",
          "Nenhuma tabela de preço disponível para este cliente"
        );
        setIsLoading(false);
        return;
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ TABELA DE PREÇO SELECIONADA: ${tabelaSelecionada.descricao}`);
      console.log(`📊 Código da tabela: ${String(tabelaSelecionada.value).trim()}`);
      console.log(`🏷️ Tipo da tabela: ${tabelaSelecionada.tipo}`);
      console.log(`👤 Cliente: ${cliente.razaoSocial} (${cliente.cpfCnpj})`);
      console.log(`${'='.repeat(60)}\n`);

      // ✅ CA10: Filtra apenas produtos com estoque disponível
      console.log("🔍 Buscando produtos com estoque...");
      const produtosComEstoque = await getProdutosComEstoque(
        {
          value: tabelaSelecionada.value,
          tipo: tabelaSelecionada.tipo,
        }
      );

      console.log(`📦 Produtos encontrados: ${produtosComEstoque?.length || 0}`);
      if (produtosComEstoque && produtosComEstoque.length > 0) {
        console.log(`✅ Primeiros 3 produtos: ${produtosComEstoque.slice(0, 3).map((p: any) => `${p.codigo} - ${p.descricaoMarca}`).join(', ')}`);
      } else {
        console.warn(`⚠️ NENHUM PRODUTO com estoque encontrado!`);
        console.warn(`   - Tabela: ${tabelaSelecionada.value}`);
        console.warn(`   - Tipo: ${tabelaSelecionada.tipo}`);
        console.warn(`   - Verifique se existem produtos com quantidadeEstoquePA > 0 no banco de dados`);
      }

      // Garante que sempre tem um array, mesmo vazio
      const produtosParaNavegar = produtosComEstoque || [];
      const parsedProdutos = produtosParaNavegar.map((produto: any) => ({
        ...produto,
        imagens: produto.imagens ? JSON.parse(produto.imagens) : [],
      }));

      console.log(`✅ Navegando para catálogo com ${parsedProdutos.length} produtos`);

      // Atualiza contexto com tabela selecionada
      setClientInfo({
        cpfCnpjContext: cliente.cpfCnpj,
        clienteIdContext: cliente.clienteId || cliente.codigo,
        selectedTabelaPrecoContext: {
          value: String(tabelaSelecionada.value),
          tipo: tabelaSelecionada.tipo,
        },
        produtosFiltradosTabelaPrecoContext: parsedProdutos,
        selectedClientContext: {
          cpfCnpj: cliente.cpfCnpj,
          clienteId: cliente.clienteId || cliente.codigo,
          codigoCliente: cliente.codigo,
          razaoSocial: cliente.razaoSocial || "",
          enderecoCompleto: cliente.enderecoCompleto || "",
          enderecos: cliente.enderecos || [],
        },
      });

      // ✅ SEMPRE navega para o catálogo, mesmo com produtos vazio
      navigation.navigate("CatalogoFechado", {
        pedidoId: 0,
        catalogOpen: false,
        cpfCnpj: cliente.cpfCnpj,
        clienteId: cliente.clienteId || cliente.codigo,
        representanteCreateId: representanteId,
        selectedTabelaPreco: String(tabelaSelecionada.value),
        selectedClient: {
          cpfCnpj: cliente.cpfCnpj,
          clienteId: cliente.clienteId || cliente.codigo,
          codigoCliente: cliente.codigo,
          razaoSocial: cliente.razaoSocial || "",
          enderecoCompleto: cliente.enderecoCompleto || "",
          enderecos: cliente.enderecos || [],
        },
      });

      updateCarrinhosCount();
    } catch (error) {
      console.error("❌ Erro ao selecionar tabela automaticamente:", error);
      Alert.alert("Erro", "Não foi possível selecionar a tabela de preço");
    } finally {
      setIsLoading(false);
    }
  };

  //forma anterior de selecionar cliente e navegar para o catálogo fechado, deixar comentado para futura referência

  return (
    <>
      <CardContainer isModoPaisagem={isModoPaisagem}>
        <InfoRow style={{ marginBottom: 5 }}>
          <View style={{ width: "50%" }}>
            <Label isModoPaisagem={isModoPaisagem} width={width}>
              Código:
            </Label>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.codigo}
            </Value>
          </View>
          <View style={{ width: "50%" }}>
            <Label isModoPaisagem={isModoPaisagem} width={width}>
              CNPJ:
            </Label>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.cpfCnpj}
            </Value>
          </View>
        </InfoRow>
        <Separator />
        <View style={{ marginBottom: 5 }}>
          <Label isModoPaisagem={isModoPaisagem} width={width}>
            Razão Social:
          </Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.razaoSocial}
            </Value>
          </ScrollView>
        </View>
        <Separator />
        <View style={{ marginBottom: 5 }}>
          <Label isModoPaisagem={isModoPaisagem} width={width}>
            Endereço:
          </Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Value isModoPaisagem={isModoPaisagem} width={width}>
              {cliente.enderecoCompleto}
            </Value>
          </ScrollView>
        </View>
        <Separator />
        <IconContainer>
          <IconButton>
            <FontAwesome name="thumbs-up" size={34} color="#000" />
          </IconButton>

          {/* <IconButton
            onPress={() =>
              navigation.navigate("DetalhesDoCliente", {
                codigo: cliente.codigo,
              })
            }
          >
            <MaterialIcons name="find-in-page" size={34} color="#000" />
          </IconButton> */}
          <IconButton onPress={handleSelectTabelaPreco}>
            <Entypo name="shop" size={34} color="black" />
          </IconButton>
        </IconContainer>
      </CardContainer>
    </>
  );
};
