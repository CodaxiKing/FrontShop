import React, { useEffect, useState } from "react";
import { Modal, FlatList, Text, View, Alert } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalTitle,
  Card,
  CardImage,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardFooter,
  QuantityContainer,
  QuantityButton,
  QuantityText,
  ButtonRow,
  ButtonCancel,
  ButtonConfirm,
  ButtonText,
  ButtonTextBlue,
} from "./style.modal.expositor";
import { MaterialIcons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import { CarrinhoInfo } from "../IconesCardEditarPedidoAberto";
import { useEditarPedidoAberto } from "@/context/EditarPedidoAbertoContext";

interface ProdutoCarrinho {
  codigo: string;
  nomeEcommerce: string;
  quantidade: number;
  precoUnitario: number;
  tipo?: string;
  imagem?: any;
  descricaoSubGrupo: string;
  dataPrevistaPA: string;
  percentualDesconto: number;
}

interface ExpositorItem {
  codigo: string;
  nomeEcommerce: string;
  codigoMarca: string;
  saldo: number;
  imagens: string | any[];
  maxQuantity: number;
  currentQuantity: number;
  selected?: boolean;
  excesso?: number;
}

interface ModalExpositorProps {
  visible: boolean;
  onClose: () => void;
  cpfCnpj: string;
  carrinhoInfo: CarrinhoInfo;
  setDeveAtualizarCarrinho: (value: boolean) => void;
}

const ModalExpositorEditarPedidoAberto: React.FC<ModalExpositorProps> = ({
  visible,
  onClose,
  cpfCnpj,
  carrinhoInfo,
}) => {
  const db = SQLite.openDatabaseSync("user_data.db");
  const [expositores, setExpositores] = useState<ExpositorItem[]>([]);
  const [quantidadesTemp, setQuantidadesTemp] = useState<{
    [codigo: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { carrinho, adicionarProduto, atualizarQuantidade } =
    useEditarPedidoAberto();

  useEffect(() => {
    if (visible) fetchExpositores();
  }, [visible, carrinho]);

  const fetchExpositores = async () => {
    try {
      const produtosDoCarrinho: ProdutoCarrinho[] = carrinho.length
        ? carrinho
        : [];
      if (!produtosDoCarrinho.length) {
        setExpositores([]);
        return;
      }

      const codigoProdutos = produtosDoCarrinho.map((p) => p.codigo);
      const qtdProdutos = produtosDoCarrinho.reduce((acc, p) => {
        if (p.tipo === "R") {
          acc[p.codigo] = p.quantidade;
        }
        return acc;
      }, {} as Record<string, number>);

      const resultExpositores = await db.getAllAsync("SELECT * FROM Expositor");
      const resultQuemComprou = await db.getAllAsync(
        `SELECT DISTINCT codigoMarca FROM QuemComprouCliente WHERE cpfCnpj = ?`,
        [cpfCnpj]
      );
      const marcasCompradas = resultQuemComprou.map((row) => row.codigoMarca);

      const resultMarcasProdutos = await db.getAllAsync(
        `SELECT codigo, codigoMarca FROM Catalogo WHERE codigo IN (${codigoProdutos
          .map((c) => `'${c}'`)
          .join(", ")})`
      );

      const mapCodigoMarcaQtd = new Map<string, number>();
      resultMarcasProdutos.forEach(({ codigo, codigoMarca }) => {
        const qtd = qtdProdutos[codigo] || 0;
        const atual = mapCodigoMarcaQtd.get(codigoMarca) || 0;
        mapCodigoMarcaQtd.set(codigoMarca, atual + qtd);
      });

      // ✅ Pega expositores do contexto também
      const mapQtdExpositorContext = new Map<string, number>();
      for (const produto of carrinho) {
        if (produto.tipo === "E") {
          const resultMarca = await db.getFirstAsync(
            "SELECT codigoMarca FROM Expositor WHERE codigo = ?",
            [produto.codigo]
          );
          const codigoMarca = resultMarca?.codigoMarca;
          if (codigoMarca) {
            mapQtdExpositorContext.set(
              produto.codigo,
              (mapQtdExpositorContext.get(produto.codigo) || 0) +
                produto.quantidade
            );
          }
        }
      }

      const expositoresRelacionados = resultExpositores.filter(
        (expositor: any) => mapCodigoMarcaQtd.has(expositor.codigoMarca)
      );

      const expositoresComLimite = expositoresRelacionados.map(
        (expositor: any) => {
          const qtdCarrinho = mapCodigoMarcaQtd.get(expositor.codigoMarca) || 0;
          const qtdJaAdicionadoContext =
            mapQtdExpositorContext.get(expositor.codigo) || 0;

          const limite = marcasCompradas.includes(expositor.codigoMarca)
            ? Math.round(qtdCarrinho * 0.7)
            : qtdCarrinho;

          const maxQuantity = limite - qtdJaAdicionadoContext;
          const excesso = maxQuantity < 0 ? Math.abs(maxQuantity) : 0;

          return {
            ...expositor,
            maxQuantity,
            currentQuantity: excesso > 0 ? -excesso : 0,
            excesso,
          };
          // return {
          //   ...expositor,
          //   maxQuantity: Math.max(0, limite - qtdJaAdicionadoContext),
          //   currentQuantity: 0,
          // };
        }
      );

      setExpositores(expositoresComLimite);
    } catch (err) {
      console.error("Erro ao buscar expositores:", err);
    }
  };

  const incrementQuantity = (codigo: string) => {
    setExpositores((prev) =>
      prev.map((item) => {
        if (item.codigo === codigo) {
          const newQty = Math.min(item.currentQuantity + 1, item.maxQuantity);
          return { ...item, currentQuantity: newQty, selected: newQty > 0 };
        }
        return item;
      })
    );
  };

  const decrementQuantity = (codigo: string) => {
    setExpositores((prev) =>
      prev.map((item) => {
        if (item.codigo === codigo) {
          const newQty = Math.max(item.currentQuantity - 1, 0);
          return { ...item, currentQuantity: newQty, selected: newQty > 0 };
        }
        return item;
      })
    );
  };

  function mergeProdutosExistentes(
    produtosExistentes: ProdutoCarrinho[],
    novosProdutos: ProdutoCarrinho[]
  ): ProdutoCarrinho[] {
    const produtosMap = new Map<string, ProdutoCarrinho>();

    // Preenche o map com os produtos existentes
    for (const produto of produtosExistentes) {
      produtosMap.set(produto.codigo, { ...produto });
    }

    // Adiciona ou atualiza os produtos novos
    for (const novoProduto of novosProdutos) {
      const existente = produtosMap.get(novoProduto.codigo);
      if (existente) {
        if (novoProduto.tipo === "E") {
          existente.quantidade += novoProduto.quantidade;
        } else {
          existente.quantidade = novoProduto.quantidade;
        }
        produtosMap.set(novoProduto.codigo, existente);
      } else {
        produtosMap.set(novoProduto.codigo, { ...novoProduto });
      }
    }

    return Array.from(produtosMap.values());
  }

  const saveSelectedExpositores = async () => {
    const selectedExpositores = expositores.filter(
      (item) => item.currentQuantity > 0
    );

    if (selectedExpositores.length === 0) {
      Alert.alert(
        "Atenção",
        "Adicione pelo menos um expositor antes de confirmar."
      );
      return false;
    }

    const produtosSelecionados = selectedExpositores.map((item) => {
      let imagemUrl = null;

      if (typeof item.imagens === "string") {
        try {
          const parsed = JSON.parse(item.imagens);
          imagemUrl = parsed?.[0]?.imagemUrl || null;
        } catch {
          imagemUrl = null;
        }
      } else if (Array.isArray(item.imagens)) {
        imagemUrl = item.imagens?.[0]?.imagemUrl || null;
      }

      return {
        codigo: item.codigo,
        nomeEcommerce: item.nomeEcommerce,
        quantidade: item.currentQuantity,
        precoUnitario: 0,
        precoUnitarioComIPI: 0,
        tipo: "E",
        imagem: imagemUrl ? { uri: imagemUrl } : undefined,
        percentualDesconto: 0,
        descricaoSubGrupo: "",
        dataPrevistaPA: "",
      };
    });

    try {
      const result = await db.getAllAsync(
        "SELECT produtos FROM Pedido WHERE id = ?",
        [carrinhoInfo.id]
      );

      let produtosExistentes: ProdutoCarrinho[] = [];

      if (result?.[0]?.produtos) {
        try {
          produtosExistentes = JSON.parse(result[0].produtos);
        } catch (err) {
          console.error("Erro ao parsear produtos existentes:", err);
        }
      }

      // Mescla os expositores novos com os já existentes
      const produtosAtualizados = mergeProdutosExistentes(
        produtosExistentes,
        produtosSelecionados
      );

      const produtosJson = JSON.stringify(produtosAtualizados);

      await db.runAsync("UPDATE Pedido SET produtos = ? WHERE id = ?", [
        produtosJson,
        carrinhoInfo.id,
      ]);

      setTimeout(() => onClose(), 300);

      return true;
    } catch (error) {
      console.error("Erro ao salvar expositores:", error);
      return false;
    }
  };

  const confirmarExpositoresSelecionados = () => {
    // const selecionados = expositores.filter((item) => item.currentQuantity > 0);
    const selecionados = expositores.filter(
      (item) => item.currentQuantity !== 0 // agora permite negativos
    );

    const todosZerados = selecionados.every(
      (item) => item.currentQuantity === 0
    );

    if (selecionados.length === 0) {
      Alert.alert(
        "Atenção",
        "Adicione pelo menos um expositor antes de confirmar."
      );
      return;
    }

    const novosProdutos = selecionados.map((item) => {
      let imagemUrl = null;
      if (typeof item.imagens === "string") {
        try {
          const parsed = JSON.parse(item.imagens);
          imagemUrl = parsed?.[0]?.imagemUrl || null;
        } catch {}
      } else if (Array.isArray(item.imagens)) {
        imagemUrl = item.imagens?.[0]?.imagemUrl || null;
      }

      return {
        codigo: item.codigo,
        nomeEcommerce: item.nomeEcommerce,
        quantidade: item.currentQuantity,
        precoUnitario: 0,
        precoUnitarioComIPI: 0,
        tipo: "E",
        imagem: imagemUrl ? { uri: imagemUrl } : undefined,
        // cpfCnpj, // garante o agrupamento correto
        percentualDesconto: 0,
        descricaoSubGrupo: "",
        dataPrevistaPA: "",
      };
    });

    // Mescla no contexto sem duplicar códigos do tipo "E"
    novosProdutos.forEach((novoProduto) => {
      const existente = carrinho.find(
        (p) => p.codigo === novoProduto.codigo && p.tipo === "E"
      );

      if (existente) {
        // Se já existe no carrinho, atualiza a quantidade somando
        const novaQuantidade = existente.quantidade + novoProduto.quantidade;
        // Se a nova quantidade for menor que 0, zera
        atualizarQuantidade(
          novoProduto.codigo,
          Math.max(novaQuantidade, 0),
          "E"
        );
        // atualizarQuantidade(novoProduto.codigo, novaQuantidade, "E");
      } else {
        // Adiciona somente se a quantidade for positiva
        if (novoProduto.quantidade > 0) {
          adicionarProduto(novoProduto);
        }
        // Se não existe, adiciona
        // adicionarProduto(novoProduto);
      }
    });

    onClose();
  };

  const handleChangeText = (codigo: string, text: string) => {
    const apenasNumeros = text.replace(/[^0-9]/g, "");
    setQuantidadesTemp((prev) => ({
      ...prev,
      [codigo]: apenasNumeros,
    }));
  };

  const handleEndEditing = (codigo: string, maxQuantity: number) => {
    const digitado = quantidadesTemp[codigo] ?? "";
    const valorNumerico = parseInt(digitado, 10);

    setExpositores((prev) =>
      prev.map((item) => {
        if (item.codigo === codigo) {
          const novaQuantidade = isNaN(valorNumerico)
            ? 0
            : Math.min(valorNumerico, maxQuantity);

          return {
            ...item,
            currentQuantity: novaQuantidade, // sempre number
            selected: novaQuantidade > 0,
          };
        }
        return item;
      })
    );

    // Limpa o campo temporário
    setQuantidadesTemp((prev) => {
      const copia = { ...prev };
      delete copia[codigo];
      return copia;
    });
  };

  const renderItem = ({ item }: { item: ExpositorItem }) => {
    let imagensParsed: any[] = [];
    if (typeof item.imagens === "string") {
      try {
        imagensParsed = JSON.parse(item.imagens);
      } catch {
        imagensParsed = [];
      }
    } else if (Array.isArray(item.imagens)) {
      imagensParsed = item.imagens;
    }
    const imageUrl = imagensParsed?.[0]?.imagemUrl ?? null;

    return (
      <Card>
        {imageUrl && <CardImage source={{ uri: imageUrl }} />}
        <CardContent>
          <CardTitle>{item.nomeEcommerce}</CardTitle>
          <View style={{ flexDirection: "row", gap: 30, alignItems: "center" }}>
            <CardSubtitle>{item.codigo}</CardSubtitle>
            <CardSubtitle>
              <MaterialIcons name="local-offer" size={16} color="black" />
              {item.saldo}
            </CardSubtitle>
          </View>
          <CardSubtitle
            style={{ color: item.maxQuantity < 0 ? "red" : "#666" }}
          >
            Limite Máx.: {item.maxQuantity}
          </CardSubtitle>
          {/* <CardSubtitle>Limite Máx.: {item.maxQuantity}</CardSubtitle> */}
        </CardContent>
        <CardFooter>
          <QuantityContainer>
            <QuantityButton onPress={() => decrementQuantity(item.codigo)}>
              <Text>-</Text>
            </QuantityButton>
            <QuantityText
              value={
                quantidadesTemp[item.codigo] !== undefined
                  ? quantidadesTemp[item.codigo]
                  : item.currentQuantity.toString()
              }
              onChangeText={(text) => handleChangeText(item.codigo, text)}
              onEndEditing={() =>
                handleEndEditing(item.codigo, item.maxQuantity)
              }
              keyboardType="numeric"
              maxLength={3}
              style={{
                width: 40,
                textAlign: "center",
              }}
            />

            {/* <QuantityText>{item.currentQuantity}</QuantityText> */}
            <QuantityButton onPress={() => incrementQuantity(item.codigo)}>
              <Text>+</Text>
            </QuantityButton>
          </QuantityContainer>
        </CardFooter>
      </Card>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              Escolha seu expositor e adicione ao carrinho.
            </ModalTitle>
          </ModalHeader>
          <FlatList
            data={expositores}
            keyExtractor={(item) => item.codigo}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: "center", padding: 20 }}>
                Não foram encontrados expositores para os produtos no carrinho.
              </Text>
            )}
          />
          <ButtonRow>
            <ButtonCancel onPress={onClose}>
              <ButtonTextBlue>Cancelar</ButtonTextBlue>
            </ButtonCancel>
            <ButtonConfirm
              onPress={async () => {
                confirmarExpositoresSelecionados(); // ⬅️ dispara atualização
                onClose();
              }}
            >
              {/* <ButtonConfirm onPress={confirmarExpositoresSelecionados}> */}
              <ButtonText>
                {isLoading ? "Adicionando..." : "Confirmar Seleção"}
              </ButtonText>
            </ButtonConfirm>
          </ButtonRow>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ModalExpositorEditarPedidoAberto;
