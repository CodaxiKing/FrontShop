import React, { useContext, useEffect, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  StyledModal,
  ModalContainer,
  ModalContent,
  Header,
  Title,
  StoreSelection,
  Label,
  StoreList,
  StoreOption,
  StoreText,
  Footer,
  ActionButton,
  ActionButtonText,
  ContainerList,
} from "./style";

import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useMenuContext } from "@/context/MenuProvider";

import * as SQLite from "expo-sqlite";
import { Endereco } from "@/components/CardCarrinho/IconesCardCarrinho";
import AuthContext from "@/context/AuthContext";

const db = SQLite.openDatabaseSync("user_data.db");

function safeJsonParse<T>(raw: any, fallback: T): T {
  try {
    if (raw == null) return fallback;
    if (typeof raw === "string") return JSON.parse(raw) as T;
    return raw as T;
  } catch {
    return fallback;
  }
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function norm(v: any) {
  return String(v ?? "").trim();
}

function calcTotals(produtosPorLoja: any[]) {
  const all = (produtosPorLoja ?? []).flatMap((b) => b?.produtos ?? []);
  const quantidadeItens = all.length;
  const quantidadePecas = all.reduce(
    (acc, p) => acc + (Number(p?.quantidade) || 0),
    0
  );
  const valorTotal = all.reduce(
    (acc, p) =>
      acc + (Number(p?.quantidade) || 0) * (Number(p?.precoUnitario) || 0),
    0
  );

  const nomeEcommerce = all?.[all.length - 1]?.nomeEcommerce ?? "";
  return { quantidadeItens, quantidadePecas, valorTotal, nomeEcommerce };
}

/**
 * Atualiza o carrinho (DB) com as lojas selecionadas.
 * Regra: novas lojas duplicam produtos do pai (cnpjCliente).
 * Lojas desmarcadas removem bucket do DB.
 */
async function persistSelectedStoresInCartDB(params: {
  cnpjCliente: string;
  representanteId: string;
  selectedStores: string[];
}) {
  const { cnpjCliente, representanteId, selectedStores } = params;

  // pega pedido atual
  const q = `
    SELECT id, produtos
    FROM NovoPedido
    WHERE cpfCnpj = ? AND representanteId = ?
    ORDER BY id DESC
    LIMIT 1;
  `;
  const rows: any[] = await db.getAllAsync(q, [cnpjCliente, representanteId]);

  if (!rows?.length) {
    // se não existe pedido, não tem o que atualizar
    // (se quiser, pode criar um pedido vazio aqui - mas você não pediu isso)
    return;
  }

  const pedidoId = rows[0]?.id;
  const produtosRaw = rows[0]?.produtos;

  let produtosPorLoja = safeJsonParse<any[]>(produtosRaw, []);
  if (!Array.isArray(produtosPorLoja)) produtosPorLoja = [];

  // garante pai sempre incluso
  const selected = uniq([cnpjCliente, ...selectedStores].map(norm)).filter(
    Boolean
  );

  // bucket do pai (fonte da duplicação)
  const paiCpf = norm(cnpjCliente);

  // tenta achar bucket com cpfCnpj igual ao pai
  let bucketPai = produtosPorLoja.find((b) => norm(b?.cpfCnpj) === paiCpf);

  // se não achou, pega o primeiro bucket que tem produtos
  if (!bucketPai) {
    bucketPai = produtosPorLoja.find(
      (b) => Array.isArray(b?.produtos) && b.produtos.length > 0
    );
  }

  // fallback final: primeiro bucket do array
  if (!bucketPai) {
    bucketPai = produtosPorLoja[0];
  }

  const produtosPai = Array.isArray(bucketPai?.produtos)
    ? bucketPai.produtos
    : [];

  // 1) manter somente selecionados
  let next = produtosPorLoja.filter((b) => selected.includes(norm(b?.cpfCnpj)));

  // 2) adicionar buckets que faltam duplicando produtos do pai
  for (const cpf of selected) {
    const exists = next.some((b) => norm(b?.cpfCnpj) === cpf);
    if (!exists) {
      next.push({
        cpfCnpj: cpf,
        produtos: [...produtosPai], // ✅ DUPLICA produtos do pai (regra atual)
        enderecoEntrega: null,
      });
    }
  }

  // 3) opcional: consolidar por cpfCnpj (evita duplicado)
  const seen = new Set<string>();
  next = next.filter((b) => {
    const cpf = norm(b?.cpfCnpj);
    if (!cpf) return false;
    if (seen.has(cpf)) return false;
    seen.add(cpf);
    return true;
  });

  const { quantidadeItens, quantidadePecas, valorTotal, nomeEcommerce } =
    calcTotals(next);

  const update = `
    UPDATE NovoPedido
    SET produtos = ?,
        quantidadeItens = ?,
        quantidadePecas = ?,
        valorTotal = ?,
        nomeEcommerce = ?
    WHERE id = ? AND representanteId = ?;
  `;

  await db.runAsync(update, [
    JSON.stringify(next),
    quantidadeItens,
    quantidadePecas,
    valorTotal,
    nomeEcommerce,
    pedidoId,
    representanteId,
  ]);
}

interface ModalLojasProps {
  visible: boolean;
  onClose: () => void;
  cnpjCliente: string | undefined;
  setRefreshKeyLojas: React.Dispatch<React.SetStateAction<number>>;
}

interface Store {
  cpfCnpj: string | undefined;
  razaoSocial: string;
  nomeReduzido: string;
  enderecos: Endereco[];
}

const ModalLojas: React.FC<ModalLojasProps> = ({
  visible,
  onClose,
  cnpjCliente,
  setRefreshKeyLojas,
}) => {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const { lojasSelecionadas, setLojasSelecionadas } = useMenuContext();
  const { getLojasSelecionadasParaCliente, setLojasParaCliente } =
    useMenuContext();

  const { userData } = useContext(AuthContext);
  const representanteId = String(userData?.representanteId ?? "");

  useEffect(() => {
    if (!visible || !cnpjCliente) return;

    fetchStores();

    const lojasSalvas = getLojasSelecionadasParaCliente(cnpjCliente);
    if (lojasSalvas.length > 0) {
      setSelectedStores(lojasSalvas);
    } else {
      setSelectedStores([cnpjCliente]); // fallback
    }
  }, [visible, cnpjCliente]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const query = `
      SELECT cpfCnpjPai, cpfCnpj, razaoSocial, nomeReduzido, enderecos
      FROM CarteiraCliente
      WHERE codigoColigado = (
        SELECT codigoColigado
        FROM CarteiraCliente
        WHERE cpfCnpj = '${cnpjCliente}'
        LIMIT 1
      );
    `;
      const result = await db.getAllAsync(query);

      const uniqueResult = result.filter(
        (value: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.cpfCnpj === value.cpfCnpj)
      );

      if (uniqueResult.length > 0) {
        setStores(uniqueResult as Store[]);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Erro ao buscar lojas filhas:", error);
      setStores([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectStore = (cpfCnpj: string) => {
    // Se for a loja do próprio cliente, não permite alterar
    if (cpfCnpj === cnpjCliente) return;
    if (selectedStores.includes(cpfCnpj)) {
      setSelectedStores(selectedStores.filter((item) => item !== cpfCnpj));
    } else {
      setSelectedStores([...selectedStores, cpfCnpj]);
    }
  };

  const handleConfirmSelection = async () => {
    if (!cnpjCliente) return;

    if (selectedStores.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos uma loja.");
      return;
    }

    try {
      // ✅ 1) persistir no DB (fonte da verdade)
      await persistSelectedStoresInCartDB({
        cnpjCliente,
        representanteId,
        selectedStores,
      });

      // ✅ 2) manter contexto atualizado (continua igual)
      setLojasParaCliente(cnpjCliente, selectedStores);

      // ✅ 3) forçar recarregar carrinho
      setRefreshKeyLojas((prev) => prev + 1);

      onClose();
    } catch (e) {
      console.log("Erro ao salvar lojas no DB:", e);
      Alert.alert("Erro", "Não foi possível salvar as lojas selecionadas.");
    }
  };

  return (
    <StyledModal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ScrollView>
            <Header>
              <Title>Seleção de Loja</Title>
            </Header>
            <StoreSelection>
              <Label>Lojas</Label>
              <StoreList>
                <ContainerList>
                  {loading ? (
                    <View style={{ flexDirection: "column", gap: 10 }}>
                      <ActivityIndicator size="large" color="#007bff" />
                      <Text>Buscando Lojas</Text>
                    </View>
                  ) : stores.length > 0 ? (
                    stores.map((store) => (
                      <StoreOption
                        key={store.cpfCnpj}
                        selected={
                          store.cpfCnpj
                            ? selectedStores.includes(store.cpfCnpj)
                            : false
                        }
                        onPress={() =>
                          store.cpfCnpj && toggleSelectStore(store.cpfCnpj)
                        }
                      >
                        <FontAwesome5
                          name={
                            store.cpfCnpj &&
                            selectedStores.includes(store.cpfCnpj)
                              ? "check-circle"
                              : "circle"
                          }
                          size={20}
                          color={
                            store.cpfCnpj &&
                            selectedStores.includes(store.cpfCnpj)
                              ? "#007bff"
                              : "#ccc"
                          }
                          style={{ marginRight: 10 }}
                        />
                        <StoreText
                          selected={
                            store.cpfCnpj
                              ? selectedStores.includes(store.cpfCnpj)
                              : false
                          }
                        >
                          {store.cpfCnpj} - {store.razaoSocial}
                          {/* {store.cpfCnpj} - {store.nomeReduzido} */}
                        </StoreText>
                      </StoreOption>
                    ))
                  ) : (
                    <StoreText selected={false}>
                      Nenhuma loja encontrada
                    </StoreText>
                  )}
                </ContainerList>
              </StoreList>
            </StoreSelection>
            <Footer>
              <ActionButton onPress={onClose} outlined>
                <ActionButtonText outlined>Fechar</ActionButtonText>
              </ActionButton>
              <ActionButton onPress={handleConfirmSelection}>
                <ActionButtonText>
                  Selecionar ({selectedStores.length})
                </ActionButtonText>
              </ActionButton>
            </Footer>
          </ScrollView>
        </ModalContent>
      </ModalContainer>
    </StyledModal>
  );
};

export default ModalLojas;
