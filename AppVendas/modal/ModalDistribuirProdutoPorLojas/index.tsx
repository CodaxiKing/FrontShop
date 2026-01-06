import React, { useEffect, useState } from "react";
import {
  ModalContainer,
  ModalHeader,
  Title,
  ButtonsContainer,
  ModalContent,
  ModalBody,
  StoreRow,
  ContainerQuantidade,
  InputQuantidade,
  StoreText,
} from "./style";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";

import * as SQLite from "expo-sqlite";
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { Feather, Ionicons } from "@expo/vector-icons";
const db = SQLite.openDatabaseSync("user_data.db");

type StoreVM = {
  cpfCnpj: string;
  nomeReduzido: string;
  razaoSocial: string;
};

type Props = {
  visible: boolean;
  produto: CatalogoItem | null;
  stores: StoreVM[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: (qtdMap: Record<string, number>) => Promise<void> | void;
  isApplying?: boolean;

  pedidoAtual?: any | null;
};

const ITEM_H = 120; // estimativa da altura do StoreRow
const HEADER_H = 74; // altura aproximada do ModalHeader
const FOOTER_H = 86; // altura aproximada dos botões
const GAP_H = 40; // paddings/margens internas

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const ModalDistribuirProdutoPorLojas: React.FC<Props> = ({
  visible,
  produto,
  stores,
  loading,
  onClose,
  onConfirm,
  pedidoAtual,
  isApplying = false,
}) => {
  const [qtdMap, setQtdMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!visible || !produto) return;

    const codigoProduto = String(produto.codigo);

    // pedidoAtual?.produtos é string JSON no banco
    const rawList =
      typeof pedidoAtual?.produtos === "string"
        ? JSON.parse(pedidoAtual.produtos)
        : Array.isArray(pedidoAtual?.produtos)
        ? pedidoAtual.produtos
        : [];

    const initial: Record<string, number> = {};

    // monta qtd por loja a partir do pedido
    for (const bucket of rawList) {
      const cnpj = String(bucket?.cpfCnpj ?? "");
      if (!cnpj) continue;

      const prod = Array.isArray(bucket?.produtos)
        ? bucket.produtos.find((p: any) => String(p?.codigo) === codigoProduto)
        : null;

      initial[cnpj] = prod ? Number(prod?.quantidade ?? 0) : 0;
    }

    // garante que TODAS as lojas do modal existam no map (mesmo se não tiver bucket no pedido)
    for (const s of stores ?? []) {
      const cnpj = String(s.cpfCnpj);
      if (!(cnpj in initial)) initial[cnpj] = 0;
    }

    setQtdMap(initial);
  }, [visible, produto?.codigo, pedidoAtual, stores]);

  const { height: H } = useWindowDimensions();
  const count = stores?.length ?? 0;

  const visibleItems = Math.min(count, 7); // até 7 cresce, depois vira scroll
  const contentHeight = HEADER_H + FOOTER_H + GAP_H + visibleItems * ITEM_H;

  const modalMaxHeight = H * 0.8;
  const modalMinHeight = 260;

  const modalHeight = clamp(contentHeight, modalMinHeight, modalMaxHeight);
  const bodyMaxHeight = modalHeight - (HEADER_H + FOOTER_H + GAP_H);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (isApplying) return; // evita fechar no Android
        onClose();
      }}
    >
      <ModalContainer>
        <ModalContent style={{ height: modalHeight }}>
          {/* <SafeAreaView style={{ flex: 1 }}> */}
          <ModalHeader>
            {/* <Title>Outras Lojas</Title> */}
            <Title>
              {produto
                ? `Outras Lojas - Produto: ${produto.codigo}`
                : "Outras Lojas"}
            </Title>
          </ModalHeader>

          <ModalBody style={{ maxHeight: bodyMaxHeight }}>
            {loading ? (
              <StoreRow style={{ flexDirection: "column" }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 8 }}>Carregando lojas...</Text>
              </StoreRow>
            ) : (
              <FlatList
                data={stores}
                keyExtractor={(it) => it.cpfCnpj}
                renderItem={({ item }) => {
                  const qtd = qtdMap[item.cpfCnpj] || 0;

                  // console.log("Renderizando loja:", item.cpfCnpj, "qtd:", qtd);

                  return (
                    <StoreRow>
                      <View style={{ flexDirection: "row" }}>
                        <StoreText>
                          {item.cpfCnpj} {" - "}
                        </StoreText>
                        <StoreText>{item.razaoSocial}</StoreText>
                        {/* <StoreText>{item.nomeReduzido}</StoreText> */}
                      </View>
                      <ContainerQuantidade>
                        <TouchableOpacity
                          onPress={() =>
                            setQtdMap((prev) => ({
                              ...prev,
                              [item.cpfCnpj]: Math.max(
                                (prev[item.cpfCnpj] ?? 0) - 1,
                                0
                              ),
                            }))
                          }
                          disabled={isApplying}
                        >
                          <Ionicons name="remove" size={20} color="black" />
                        </TouchableOpacity>

                        <InputQuantidade
                          keyboardType="numeric"
                          value={String(qtd)}
                          onChangeText={(txt) => {
                            const n = Math.max(
                              parseInt((txt || "").replace(/\D/g, ""), 10) || 0,
                              0
                            );
                            setQtdMap((prev) => ({
                              ...prev,
                              [item.cpfCnpj]: n,
                            }));
                          }}
                          editable={!isApplying}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setQtdMap((prev) => ({
                              ...prev,
                              [item.cpfCnpj]: (prev[item.cpfCnpj] ?? 0) + 1,
                            }))
                          }
                          disabled={isApplying}
                        >
                          <Feather name="plus" size={20} color="black" />
                        </TouchableOpacity>
                      </ContainerQuantidade>
                    </StoreRow>
                  );
                }}
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 12 }}
              />
            )}
          </ModalBody>

          {/* Botões */}
          <ButtonsContainer>
            <ConfirmacaoModalButton
              text="Cancelar"
              variant="exit"
              onPress={onClose}
              disabled={isApplying}
            />
            <ConfirmacaoModalButton
              text={isApplying ? "Salvando..." : "Confirmar"}
              variant="confirm"
              onPress={() => onConfirm(qtdMap)}
              disabled={isApplying}
            />
          </ButtonsContainer>
          {/* </SafeAreaView> */}
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
