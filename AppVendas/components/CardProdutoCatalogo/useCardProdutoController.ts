// components/CardProdutoCatalogo/useCardProdutoController.ts

import { useContext, useMemo, useState, useCallback } from "react";
import { useNavigation } from "expo-router";
import { useProdutoQuantidade } from "@/context/ProdutoQuantidadeContext";
import { useSelectedProducts } from "@/context/SelectedProductsContext";
import { useClientInfoContext } from "@/context/ClientInfoContext";
import AuthContext from "@/context/AuthContext";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { useRoute } from "@react-navigation/native";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";
import { SelectedProduct } from "../../context/SelectedProductsContext";

export function useCardProdutoController(produto: CatalogoItem) {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedClientContext, selectedTabelaPrecoContext } =
    useClientInfoContext();
  const { userData } = useContext(AuthContext);
  const { selectedProducts, addProduct, removeProduct } = useSelectedProducts();

  const cpfCnpj = String(selectedClientContext?.cpfCnpj ?? "");
  const razaoSocial = String(selectedClientContext?.razaoSocial);
  const clienteId = String(selectedClientContext?.clienteId ?? "");
  const representanteId = String(userData?.representanteId ?? "");

  const isEditarPedidoCatalogoFechado =
    route.name === "EditarPedidoCatalogoFechado";

  const [contadorVisual, setContadorVisual] = useState(0);

  const selectedTabelaPreco = useMemo(() => {
    const v: any = selectedTabelaPrecoContext;
    return typeof v === "object" && v?.value
      ? String(v.value)
      : String(v ?? "999999");
  }, [selectedTabelaPrecoContext]);

  const selectedClient = useMemo(
    () => ({
      clienteId,
      cpfCnpj,
      razaoSocial,
      enderecoCompleto: selectedClientContext?.enderecoCompleto ?? "",
      enderecos: Array.isArray(selectedClientContext?.enderecos)
        ? selectedClientContext!.enderecos
        : [],
    }),
    [
      clienteId,
      cpfCnpj,
      razaoSocial,
      selectedClientContext?.enderecoCompleto,
      selectedClientContext?.enderecos,
    ]
  );

  const { quantidades, incrementar, decrementar, setQuantidade } =
    useProdutoQuantidade();

  const { adicionarProduto, diminuirProduto, quantidadesCarrinho } =
    useEditarPedidoAberto();

  const quantity = isEditarPedidoCatalogoFechado
    ? contadorVisual
    : quantidades?.[produto.codigo] ?? 0;

  // mapeia o item do catálogo pro shape do contexto
  const toSelectedProduct = (p: CatalogoItem): SelectedProduct => ({
    codigo: p.codigo,
    nomeEcommerce: p.nomeEcommerce ?? "",
    precoUnitario: p.precoUnitario ?? p.precoUnitarioComIPI ?? 0,
    productImage: p.imagens?.[0]?.imagemUrl
      ? { uri: p.imagens[0].imagemUrl }
      : 0,
    quantidade: 1,
    // no contexto: descricaoSubgrupo (s minúsculo)
    descricaoSubgrupo: p.descricaoSubGrupo ?? "", // <- cuidado com o S maiúsculo no CatalogoItem
    // dataPrevistaPA: p.dataPrevistaPA,
  });
  // se está selecionado?
  const isChecked = Array.isArray(selectedProducts)
    ? selectedProducts.some((sp) => sp.codigo === produto.codigo)
    : false;

  // toggle via add/remove do contexto
  const onCheckBoxPress = () => {
    if (isChecked) {
      removeProduct(produto.codigo);
    } else {
      addProduct(toSelectedProduct(produto));
    }
  };

  // (opcional) logs para depurar
  // console.log("Selecionados (len):", selectedProducts.length);

  const onIncrementQuantity = useCallback(async () => {
    // console.log("onIncrementQuantity chamado:", produto);
    if (isEditarPedidoCatalogoFechado) {
      await adicionarProduto(produto);
      setContadorVisual((prev) => prev + 1);
      return;
    }

    await incrementar(
      produto.codigo,
      produto.codigoMarca,
      cpfCnpj,
      clienteId,
      razaoSocial,
      representanteId,
      produto.nomeEcommerce ?? "",
      produto.precoUnitario ?? 0,
      produto.precoComIPI ?? 0,
      produto.imagens?.[0]?.imagemUrl ?? "",
      representanteId,
      { value: selectedTabelaPreco },
      selectedClient,
      produto.descricaoSubGrupo ?? "",
      produto.dataPrevistaPA
    );
  }, [
    // AQUI ESTÁ A CORREÇÃO: Adicionamos todas as dependências
    isEditarPedidoCatalogoFechado,
    produto,
    adicionarProduto,
    contadorVisual,
    incrementar,
    cpfCnpj,
    clienteId,
    razaoSocial,
    representanteId,
    selectedTabelaPreco,
    selectedClient,
  ]);

  const onDecrementQuantity = useCallback(async () => {
    if (isEditarPedidoCatalogoFechado) {
      if (contadorVisual > 0) {
        diminuirProduto(produto);
        setContadorVisual((prev) => prev - 1);
      }
      return;
    }

    await decrementar(
      produto.codigo,
      cpfCnpj,
      clienteId,
      razaoSocial,
      representanteId,
      produto.nomeEcommerce ?? "",
      produto.precoUnitario ?? 0,
      produto.precoComIPI ?? 0,
      produto.imagens?.[0]?.imagemUrl ?? "",
      representanteId,
      { value: selectedTabelaPreco },
      selectedClient,
      produto.descricaoSubGrupo ?? ""
    );
  }, [
    // AQUI ESTÁ A CORREÇÃO: Adicionamos todas as dependências
    isEditarPedidoCatalogoFechado,
    produto,
    diminuirProduto,
    contadorVisual,
    decrementar,
    cpfCnpj,
    clienteId,
    razaoSocial,
    representanteId,
    selectedTabelaPreco,
    selectedClient,
  ]);

  const onInputChange = useCallback(
    async (valor: string) => {
      if (isEditarPedidoCatalogoFechado) {
        const novaQuantidadeVisual = parseInt(valor.replace(/\D/g, "")) || 0;
        const quantidadeVisualAntiga = contadorVisual;
        const diferenca = novaQuantidadeVisual - quantidadeVisualAntiga;

        if (diferenca > 0) {
          for (let i = 0; i < diferenca; i++) {
            await adicionarProduto(produto);
          }
        } else if (diferenca < 0) {
          for (let i = 0; i < Math.abs(diferenca); i++) {
            diminuirProduto(produto);
          }
        }
        setContadorVisual(novaQuantidadeVisual);
        return;
      }

      const qtd = parseInt((valor || "").replace(/\D/g, ""), 10) || 0;
      await setQuantidade(
        produto.codigo,
        qtd,
        cpfCnpj,
        clienteId,
        razaoSocial,
        representanteId,
        produto.nomeEcommerce ?? "",
        produto.precoUnitario ?? 0,
        produto.precoComIPI ?? 0,
        produto.productImage,
        representanteId,
        { value: selectedTabelaPreco },
        selectedClient,
        produto.descricaoSubGrupo ?? "",
        produto.dataPrevistaPA
      );
    },
    [
      // AQUI ESTÁ A CORREÇÃO: Adicionamos todas as dependências
      isEditarPedidoCatalogoFechado,
      produto,
      adicionarProduto,
      diminuirProduto,
      contadorVisual,
      setQuantidade,
      cpfCnpj,
      clienteId,
      razaoSocial,
      representanteId,
      selectedTabelaPreco,
      selectedClient,
    ]
  );

  const onNavigateToDetails = () => {
    if (produto.pedidoId) {
      navigation.navigate("EditarPedidoDetalhesDoProduto", {
        produto,
        pedidoId: produto.pedidoId,
      } as any);
    } else {
      navigation.navigate("DetalhesDoProduto", { produto } as any);
    }
  };

  return {
    isChecked,
    quantity,
    onCheckBoxPress,
    onIncrementQuantity,
    onDecrementQuantity,
    onInputChange,
    onNavigateToDetails,
  };
}
