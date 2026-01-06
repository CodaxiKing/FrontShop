//context/ProdutoQuantidadeContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buscarPedido,
  atualizarPedido,
  inserirPedido,
} from "@/repositories/PedidoRepository";
import { eventBus, getHoraAtualComMs } from "@/core/eventBus";
import { CarrinhoService } from "@/services/CarrinhoService";

// ===== Tipos =====
type QuantidadesMap = Record<string, number>;

interface ProdutoSnapshot {
  codigo: string;
  codigoMarca?: string;
  nomeEcommerce?: string;
  precoUnitario?: number;
  precoUnitarioComIPI?: number;
  imagem?: string;
  descricaoSubGrupo: string;
  dataPrevistaPA?: string;
  tipo?: string;
}

interface SelectedClient {
  clienteId: string;
  cpfCnpj: string;
  razaoSocial: string;
  enderecoCompleto?: string;
  enderecos?: any[];
  codigoCliente: string;
}

interface TabelaPrecoLike {
  value?: string;
}

interface ProdutoQuantidadeContextValue {
  quantidades: QuantidadesMap;
  preloadQuantidades: (initial: QuantidadesMap) => void;
  incrementar: (
    codigo: string,
    codigoMarca: string,
    cpfCnpj: string,
    clienteId: string,
    razaoSocial: string,
    representanteId: string,
    nomeEcommerce?: string,
    precoUnitario?: number,
    precoUnitarioComIPI?: number,
    imagem?: string,
    representanteCreateId?: string,
    selectedTabelaPreco?: TabelaPrecoLike,
    selectedClient?: SelectedClient,
    descricaoSubGrupo?: string,
    dataPrevistaPA?: string
  ) => Promise<void>;
  decrementar: (
    codigo: string,
    cpfCnpj: string,
    clienteId: string,
    razaoSocial: string,
    representanteId: string,
    nomeEcommerce?: string,
    precoUnitario?: number,
    precoUnitarioComIPI?: number,
    imagem?: string,
    representanteCreateId?: string,
    selectedTabelaPreco?: TabelaPrecoLike,
    selectedClient?: SelectedClient,
    descricaoSubGrupo?: string
  ) => Promise<void>;
  setQuantidade: (
    codigo: string,
    codigoMarca: string,
    qtd: number,
    cpfCnpj: string,
    clienteId: string,
    razaoSocial: string,
    representanteId: string,
    nomeEcommerce?: string,
    precoUnitario?: number,
    precoUnitarioComIPI?: number,
    imagem?: string,
    representanteCreateId?: string,
    selectedTabelaPreco?: TabelaPrecoLike,
    selectedClient?: SelectedClient,
    descricaoSubGrupo?: string,
    dataPrevistaPA?: string,
    tipo?: string
  ) => Promise<void>;
  clear: () => void;

  aplicarDistribuicaoProduto: (
    produto: {
      codigo: string;
      codigoMarca?: string;
      nomeEcommerce?: string;
      precoUnitario?: number;
      precoComIPI?: number;
      imagens?: any[];
      descricaoSubGrupo?: string;
      dataPrevistaPA?: string;
    },
    distribuicao: Array<{ cpfCnpj: string; quantidade: number }>,
    ctx: {
      cpfCnpjPrincipal: string;
      clienteId: string;
      razaoSocial: string;
      representanteId: string;
      selectedTabelaPreco?: { value?: string };
      selectedClient: any; // SelectedClient do teu context
    }
  ) => Promise<{
    ok: boolean;
    failed: Array<{ cpfCnpj: string; reason: string }>;
  }>;
}

const ProdutoQuantidadeContext = createContext<ProdutoQuantidadeContextValue>({
  quantidades: {},
  preloadQuantidades: () => {},
  incrementar: async () => {},
  decrementar: async () => {},
  setQuantidade: async () => {},
  clear: () => {},
  aplicarDistribuicaoProduto: async () => ({ ok: false, failed: [] }),
});

export const useProdutoQuantidade = () => useContext(ProdutoQuantidadeContext);

// ===== Provider =====
export const ProdutoQuantidadeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [quantidades, setQuantidades] = useState<QuantidadesMap>({});

  // Cache do pedido e de metadados do cliente para evitar SELECTs repetidos
  const pedidoIdRef = useRef<string | null>(null);
  const chavePedidoRef = useRef<{
    cpfCnpj: string;
    clienteId: string;
    representanteId: string;
    razaoSocial: string;
  } | null>(null);
  const tabelaPrecoRef = useRef<string>("999999");
  const clienteSnapshotRef = useRef<SelectedClient | null>(null);
  const representanteCreateIdRef = useRef<string>("");

  // Fila de mudanças a aplicar no flush (debounced)
  const pendingChangesRef = useRef<
    Map<string, { qtd: number; snapshot?: ProdutoSnapshot }>
  >(new Map());
  const flushTimerRef = useRef<any>(null);
  const isFlushingRef = useRef(false);

  // --- helpers de estado ---
  const applyLocalChange = useCallback((codigo: string, qtd: number) => {
    setQuantidades((prev) => {
      if (prev[codigo] === qtd) return prev;
      return { ...prev, [codigo]: qtd };
    });
  }, []);

  const rememberContext = useCallback(
    (
      cpfCnpj: string,
      clienteId: string,
      razaoSocial: string,
      representanteId: string,
      representanteCreateId?: string,
      selectedTabelaPreco?: TabelaPrecoLike,
      selectedClient?: SelectedClient
    ) => {
      //console.warn(`rememberContext useCallback cpfCnpj[${cpfCnpj}], clienteId[${clienteId}],  representanteId[${representanteId}], representanteCreateId[${representanteId}]`)
      const k = { cpfCnpj, clienteId, representanteId, razaoSocial };
      // se mudou o trio-chave, invalida o pedidoId cacheado
      if (
        !chavePedidoRef.current ||
        chavePedidoRef.current.cpfCnpj !== k.cpfCnpj ||
        chavePedidoRef.current.clienteId !== k.clienteId ||
        chavePedidoRef.current.representanteId !== k.representanteId ||
        chavePedidoRef.current.razaoSocial !== k.razaoSocial
      ) {
        pedidoIdRef.current = null;
        chavePedidoRef.current = k;
      }
      if (selectedTabelaPreco && selectedTabelaPreco.value) {
        tabelaPrecoRef.current = String(selectedTabelaPreco.value);
      }
      if (selectedClient) {
        clienteSnapshotRef.current = selectedClient;
      }
      if (representanteCreateId) {
        representanteCreateIdRef.current = representanteCreateId;
      }
    },
    []
  );

  const enqueueChange = useCallback(
    (codigo: string, qtd: number, snapshot?: ProdutoSnapshot) => {
      const map = pendingChangesRef.current;
      map.set(codigo, { qtd, snapshot });
    },
    []
  );

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
    }
    // Debounce curto para agrupar múltiplos cliques/inputs
    flushTimerRef.current = setTimeout(() => {
      void flushChanges();
    }, 300);
  }, []);

  // flush em lote com 1 SELECT e 1 INSERT/UPDATE ---
  const flushChanges = useCallback(async () => {
    if (isFlushingRef.current) return;
    const key = chavePedidoRef.current;
    const selectedClient = clienteSnapshotRef.current;
    if (!key || !selectedClient) return; // sem contexto completo não flushar

    const { cpfCnpj, clienteId, representanteId, razaoSocial } = key;
    const tabelaPreco = tabelaPrecoRef.current || "999999";
    const representanteCreateId =
      representanteCreateIdRef.current || representanteId;

    // snapshot das mudanças e limpa fila
    const toApply = [...pendingChangesRef.current.entries()];
    if (toApply.length === 0) return;

    isFlushingRef.current = true;
    pendingChangesRef.current.clear();

    try {
      eventBus.emit("carrinho:changing", { cpfCnpj, cliente: clienteId });

      // 1) Se não temos pedidoId ainda, tentar buscar UMA vez
      let pedidoExistente: any | null = null;
      if (!pedidoExistente) {
        // if (!pedidoIdRef.current) {
        const rows = await buscarPedido(cpfCnpj, clienteId, representanteId);
        pedidoExistente = rows?.[0] ?? null;
        if (pedidoExistente?.id) {
          pedidoIdRef.current = String(pedidoExistente.id);
        }
      }

      // 2) Se ainda não existe pedido -> INSERT único com os itens > 0
      if (!pedidoExistente) {
        const itensInsert = toApply
          .filter(([, v]) => v.qtd > 0)
          .map(([, v]) => ({
            codigo: v.snapshot?.codigo!,
            codigoMarca: v.snapshot?.codigoMarca!,
            nomeEcommerce: v.snapshot?.nomeEcommerce ?? "",
            quantidade: v.qtd,
            precoUnitario: v.snapshot?.precoUnitario ?? 0,
            precoUnitarioComIPI:
              v.snapshot?.precoUnitarioComIPI ?? v.snapshot?.precoUnitario ?? 0,
            imagem: v.snapshot?.imagem,
            tipo: v.snapshot?.tipo ?? "R",
            // tipo: "R",
            descricaoSubGrupo: v.snapshot?.descricaoSubGrupo ?? "",
            dataPrevistaPA: v.snapshot?.dataPrevistaPA,
          }));

        // se nada > 0, não há o que inserir
        if (itensInsert.length === 0) {
          isFlushingRef.current = false;
          return;
        }

        const produtosStr = JSON.stringify([
          {
            cpfCnpj: cpfCnpj,
            produtos: itensInsert,
          },
        ]);

        const quantidadeTotal = itensInsert.reduce(
          (acc, p) => acc + p.quantidade,
          0
        );
        const valorTotal = itensInsert.reduce(
          (acc, p) => acc + p.quantidade * (p.precoUnitario ?? 0),
          0
        );

        const endereco = Array.isArray(selectedClient.enderecos)
          ? selectedClient.enderecos[0] || {}
          : {};

        await inserirPedido(
          {
            clienteId: selectedClient.clienteId,
            cpfCnpj: selectedClient.cpfCnpj,
            razaoSocial: selectedClient.razaoSocial,
            enderecoCompleto: selectedClient.enderecoCompleto ?? "",
            enderecos: JSON.stringify(selectedClient.enderecos ?? []),
          },
          endereco,
          produtosStr,
          quantidadeTotal,
          valorTotal,
          tabelaPreco,
          itensInsert[0]?.nomeEcommerce ?? "",
          representanteId, // NOVO
          representanteCreateId // NOVO (fallback: representanteId)
        );

        // pós-insert: buscar 1 vez para capturar o id e cachear
        const rows = await buscarPedido(cpfCnpj, clienteId, representanteId);
        const novo = rows?.[0];
        pedidoIdRef.current = novo?.id ? String(novo.id) : null;

        isFlushingRef.current = false;
        return;
      }

      // 3) Já existe pedido -> UPDATE único
      //    pega produtos atuais UMA vez (se ainda não temos do passo 1)
      if (!pedidoExistente) {
        const rows = await buscarPedido(cpfCnpj, clienteId, representanteId);
        pedidoExistente = rows?.[0] ?? null;
      }

      const lista = pedidoExistente?.produtos
        ? JSON.parse(pedidoExistente.produtos)
        : [];
      // esperamos formato [{ cpfCnpj, produtos: [...] }]
      const bucket =
        Array.isArray(lista) && lista[0]?.produtos
          ? lista[0]
          : { cpfCnpj, produtos: [] };
      const produtosAtuais: any[] = Array.isArray(bucket.produtos)
        ? bucket.produtos
        : [];

      // aplica mudanças (set/remove)
      const indexByCodigo = new Map<string, number>();
      produtosAtuais.forEach((p, idx) => indexByCodigo.set(p.codigo, idx));

      for (const [codigo, { qtd, snapshot }] of toApply) {
        const i = indexByCodigo.get(codigo);
        if (qtd <= 0) {
          if (i !== undefined) {
            produtosAtuais.splice(i, 1);
            indexByCodigo.delete(codigo);
          }
        } else {
          if (i !== undefined) {
            produtosAtuais[i] = {
              ...produtosAtuais[i],
              quantidade: qtd,
              precoUnitario:
                snapshot?.precoUnitario ??
                produtosAtuais[i]?.precoUnitario ??
                0,
              precoUnitarioComIPI:
                snapshot?.precoUnitarioComIPI ??
                snapshot?.precoUnitario ??
                produtosAtuais[i]?.precoUnitarioComIPI ??
                produtosAtuais[i]?.precoUnitario ??
                0,
              nomeEcommerce:
                snapshot?.nomeEcommerce ??
                produtosAtuais[i]?.nomeEcommerce ??
                "",
              imagem: snapshot?.imagem ?? produtosAtuais[i]?.imagem,
              tipo: snapshot?.tipo ?? "R",
              // tipo: "R",
              descricaoSubGrupo:
                snapshot?.descricaoSubGrupo ??
                produtosAtuais[i]?.descricaoSubGrupo ??
                "",
              dataPrevistaPA:
                snapshot?.dataPrevistaPA ?? produtosAtuais[i]?.dataPrevistaPA,
            };
          } else {
            produtosAtuais.push({
              codigo,
              codigoMarca: snapshot?.codigoMarca,
              nomeEcommerce: snapshot?.nomeEcommerce ?? "",
              quantidade: qtd,
              precoUnitario: snapshot?.precoUnitario ?? 0,
              precoUnitarioComIPI:
                snapshot?.precoUnitarioComIPI ?? snapshot?.precoUnitario ?? 0,
              imagem: snapshot?.imagem,
              tipo: snapshot?.tipo ?? "R",
              // tipo: "R",
              descricaoSubGrupo: snapshot?.descricaoSubGrupo,
              dataPrevistaPA: snapshot?.dataPrevistaPA,
            });
            indexByCodigo.set(codigo, produtosAtuais.length - 1);
          }
        }
      }

      const quantidadeItens = produtosAtuais.length;
      const quantidadePecas = produtosAtuais.reduce(
        (acc, p) => acc + (p.quantidade || 0),
        0
      );
      const valorTotal = produtosAtuais.reduce(
        (acc, p) => acc + (p.quantidade || 0) * (p.precoUnitario || 0),
        0
      );

      const produtosStr = JSON.stringify([
        { cpfCnpj, produtos: produtosAtuais },
      ]);
      await atualizarPedido(
        produtosStr,
        produtosAtuais[produtosAtuais.length - 1]?.nomeEcommerce ?? "",
        quantidadeItens,
        quantidadePecas,
        valorTotal,
        tabelaPreco,
        pedidoIdRef.current!
      );
    } catch (e) {
      console.warn("[ProdutoQuantidade] flush error:", e);
    } finally {
      // evento de carrinho atualizado
      isFlushingRef.current = false;
      setTimeout(() => {
        eventBus.emit("carrinho:changed", {
          phase: "after-update",
          pedidoId: pedidoIdRef.current,
        });
      }, 1000);
    }
  }, []);

  // ===== API pública =====
  const preloadQuantidades = useCallback((initial: QuantidadesMap) => {
    setQuantidades(initial || {});
  }, []);

  const incrementar: ProdutoQuantidadeContextValue["incrementar"] = useCallback(
    async (
      codigo,
      codigoMarca,
      cpfCnpj,
      clienteId,
      razaoSocial,
      representanteId,
      nomeEcommerce,
      precoUnitario,
      precoUnitarioComIPI,
      imagem,
      representanteCreateId,
      selectedTabelaPreco,
      selectedClient,
      descricaoSubGrupo,
      dataPrevistaPA
    ) => {
      //console.warn(`ProdutoQuantidadeContext.tsx incrementar representanteId[${representanteId}] representanteCreateId[${representanteCreateId}]`)
      rememberContext(
        cpfCnpj,
        clienteId,
        razaoSocial,
        representanteId,
        representanteCreateId,
        selectedTabelaPreco,
        selectedClient
      );
      const novaQtd = (quantidades[codigo] ?? 0) + 1;
      applyLocalChange(codigo, novaQtd);
      enqueueChange(codigo, novaQtd, {
        codigo,
        codigoMarca,
        nomeEcommerce,
        precoUnitario,
        precoUnitarioComIPI,
        imagem,
        descricaoSubGrupo: descricaoSubGrupo ?? "",
        dataPrevistaPA,
      });
      scheduleFlush();
    },
    [
      quantidades,
      applyLocalChange,
      enqueueChange,
      rememberContext,
      scheduleFlush,
    ]
  );

  const decrementar: ProdutoQuantidadeContextValue["decrementar"] = useCallback(
    async (
      codigo,
      cpfCnpj,
      clienteId,
      razaoSocial,
      representanteId,
      nomeEcommerce,
      precoUnitario,
      precoUnitarioComIPI,
      imagem,
      representanteCreateId,
      selectedTabelaPreco,
      selectedClient,
      descricaoSubGrupo
    ) => {
      rememberContext(
        cpfCnpj,
        clienteId,
        razaoSocial,
        representanteId,
        representanteCreateId,
        selectedTabelaPreco,
        selectedClient
      );
      const novaQtd = Math.max((quantidades[codigo] ?? 0) - 1, 0);
      applyLocalChange(codigo, novaQtd);
      enqueueChange(codigo, novaQtd, {
        codigo,
        nomeEcommerce,
        precoUnitario,
        precoUnitarioComIPI,
        imagem,
        descricaoSubGrupo: descricaoSubGrupo ?? "",
      });
      scheduleFlush();
    },
    [
      quantidades,
      applyLocalChange,
      enqueueChange,
      rememberContext,
      scheduleFlush,
    ]
  );

  const aplicarDistribuicaoProduto: ProdutoQuantidadeContextValue["aplicarDistribuicaoProduto"] =
    useCallback(
      async (produto, distribuicao, ctx) => {
        const failed: Array<{ cpfCnpj: string; reason: string }> = [];

        try {
          const {
            cpfCnpjPrincipal,
            clienteId,
            razaoSocial,
            representanteId,
            selectedTabelaPreco,
            selectedClient,
          } = ctx;

          // guarda contexto (mantém padrão do Provider)
          rememberContext(
            cpfCnpjPrincipal,
            clienteId,
            razaoSocial,
            representanteId,
            representanteId,
            selectedTabelaPreco,
            selectedClient
          );

          // sanitiza distribuicao (cpfCnpj válido, qtd >= 0)
          const dist = (distribuicao ?? [])
            .filter((d) => !!d?.cpfCnpj)
            .map((d) => ({
              cpfCnpj: String(d.cpfCnpj),
              quantidade: Math.max(Number(d.quantidade ?? 0), 0),
            }));

          // nada pra fazer? (ex: tudo 0)
          // aqui ainda pode precisar remover de todas as lojas existentes -> então não retorna cedo

          // 1) Busca pedido existente
          const rows = await buscarPedido(
            cpfCnpjPrincipal,
            clienteId,
            representanteId
          );
          const pedidoExistente = rows?.[0] ?? null;

          // helper: extrai imagem
          const imagem =
            produto?.imagens?.[0]?.imagemUrl ??
            (produto as any)?.productImage ??
            "";

          // helper: cria payload do produto
          const makeProduto = (qtd: number) => ({
            codigo: String(produto.codigo),
            codigoMarca: String(produto.codigoMarca ?? ""),
            nomeEcommerce: String(produto.nomeEcommerce ?? ""),
            quantidade: qtd,
            precoUnitario: Number(produto.precoUnitario ?? 0),
            precoUnitarioComIPI: Number(produto.precoComIPI ?? 0),
            imagem: String(imagem ?? ""),
            tipo: "R",
            descricaoSubGrupo: String(produto.descricaoSubGrupo ?? ""),
            dataPrevistaPA: String(produto.dataPrevistaPA ?? ""),
          });

          // helper: aplica/substitui COMPLETAMENTE o produto em buckets
          const applyToBuckets = (buckets: any[]) => {
            const codigoAlvo = String(produto.codigo);

            // index rápido
            const byCpf = new Map<string, any>();
            for (const b of buckets) {
              if (b?.cpfCnpj) byCpf.set(String(b.cpfCnpj), b);
            }

            // 1) remove produto alvo de TODOS os buckets (substituição completa)
            for (const b of buckets) {
              const arr = Array.isArray(b?.produtos) ? b.produtos : [];
              b.produtos = arr.filter(
                (p: any) => String(p?.codigo) !== codigoAlvo
              );
            }

            // 2) re-aplica apenas onde qtd > 0
            for (const d of dist) {
              if (d.quantidade <= 0) continue;

              let bucket = byCpf.get(d.cpfCnpj);
              if (!bucket) {
                bucket = { cpfCnpj: d.cpfCnpj, produtos: [] };
                buckets.push(bucket);
                byCpf.set(d.cpfCnpj, bucket);
              }

              if (!Array.isArray(bucket.produtos)) bucket.produtos = [];
              bucket.produtos.push(makeProduto(d.quantidade));
            }

            // (opcional) se bucket ficou vazio, pode remover bucket inteiro (eu recomendo remover)
            const filtered = buckets.filter(
              (b) => Array.isArray(b?.produtos) && b.produtos.length > 0
            );

            return filtered;
          };

          // 2) Se não existe pedido -> INSERT
          if (!pedidoExistente) {
            const bucketsInicial = applyToBuckets([]);

            // se tudo ficou vazio (ex: usuário confirmou tudo 0), então não cria pedido
            if (bucketsInicial.length === 0) {
              return { ok: true, failed: [] };
            }

            const produtosStr = JSON.stringify(bucketsInicial);

            const quantidadePecas = bucketsInicial.reduce(
              (acc, b) =>
                acc +
                (b.produtos ?? []).reduce(
                  (a: number, p: any) => a + (p.quantidade || 0),
                  0
                ),
              0
            );

            const quantidadeItens = bucketsInicial.reduce(
              (acc, b) => acc + (b.produtos ?? []).length,
              0
            );

            const valorTotal = bucketsInicial.reduce(
              (acc, b) =>
                acc +
                (b.produtos ?? []).reduce(
                  (a: number, p: any) =>
                    a + (p.quantidade || 0) * (p.precoUnitario || 0),
                  0
                ),
              0
            );

            const tabelaPreco = String(selectedTabelaPreco?.value ?? "999999");

            const endereco = Array.isArray(selectedClient?.enderecos)
              ? selectedClient.enderecos[0] || {}
              : {};

            await inserirPedido(
              {
                clienteId: selectedClient.clienteId,
                cpfCnpj: selectedClient.cpfCnpj,
                razaoSocial: selectedClient.razaoSocial,
                enderecoCompleto: selectedClient.enderecoCompleto ?? "",
                enderecos: JSON.stringify(selectedClient.enderecos ?? []),
              },
              endereco,
              produtosStr,
              quantidadeItens,
              valorTotal,
              tabelaPreco,
              produto?.nomeEcommerce ?? "",
              representanteId,
              representanteId
            );

            // cacheia id
            const rows2 = await buscarPedido(
              cpfCnpjPrincipal,
              clienteId,
              representanteId
            );
            const novo = rows2?.[0];
            pedidoIdRef.current = novo?.id ? String(novo.id) : null;

            // avisa UI
            eventBus.emit("carrinho:changed", {
              phase: "after-update",
              pedidoId: pedidoIdRef.current,
            });

            return { ok: failed.length === 0, failed };
          }

          // 3) Existe pedido -> UPDATE
          const bucketsAtuais = pedidoExistente?.produtos
            ? JSON.parse(pedidoExistente.produtos)
            : [];

          const bucketsFinal = applyToBuckets(
            Array.isArray(bucketsAtuais) ? bucketsAtuais : []
          );

          // se removemos tudo, pode virar carrinho vazio:
          if (bucketsFinal.length === 0) {
            // aqui você pode: atualizarPedido com "[]" e totais zero
            // ou chamar uma rotina de limpar pedido (se existir no repo)
          }

          const quantidadePecas = bucketsFinal.reduce(
            (acc, b) =>
              acc +
              (b.produtos ?? []).reduce(
                (a: number, p: any) => a + (p.quantidade || 0),
                0
              ),
            0
          );

          const quantidadeItens = bucketsFinal.reduce(
            (acc, b) => acc + (b.produtos ?? []).length,
            0
          );

          const valorTotal = bucketsFinal.reduce(
            (acc, b) =>
              acc +
              (b.produtos ?? []).reduce(
                (a: number, p: any) =>
                  a + (p.quantidade || 0) * (p.precoUnitario || 0),
                0
              ),
            0
          );

          const tabelaPreco = String(selectedTabelaPreco?.value ?? "999999");

          const produtosStr = JSON.stringify(bucketsFinal);

          // garante pedidoId
          pedidoIdRef.current = pedidoExistente?.id
            ? String(pedidoExistente.id)
            : pedidoIdRef.current;

          await atualizarPedido(
            produtosStr,
            produto?.nomeEcommerce ?? "",
            quantidadeItens,
            quantidadePecas,
            valorTotal,
            tabelaPreco,
            pedidoIdRef.current!
          );

          eventBus.emit("carrinho:changed", {
            phase: "after-update",
            pedidoId: pedidoIdRef.current,
          });

          return { ok: failed.length === 0, failed };
        } catch (e: any) {
          console.warn(
            "[ProdutoQuantidade] aplicarDistribuicaoProduto error:",
            e
          );
          return {
            ok: false,
            failed: [{ cpfCnpj: "ALL", reason: String(e?.message ?? e) }],
          };
        }
      },
      [rememberContext]
    );

  const setQuantidade: ProdutoQuantidadeContextValue["setQuantidade"] =
    useCallback(
      async (
        codigo,
        codigoMarca,
        qtd,
        cpfCnpj,
        clienteId,
        razaoSocial,
        representanteId,
        nomeEcommerce,
        precoUnitario,
        precoUnitarioComIPI,
        imagem,
        representanteCreateId,
        selectedTabelaPreco,
        selectedClient,
        descricaoSubGrupo,
        dataPrevistaPA,
        tipo
      ) => {
        rememberContext(
          cpfCnpj,
          clienteId,
          razaoSocial,
          representanteId,
          representanteCreateId,
          selectedTabelaPreco,
          selectedClient
        );
        const novaQtd = Math.max(qtd || 0, 0);
        applyLocalChange(codigo, novaQtd);
        enqueueChange(codigo, novaQtd, {
          codigo,
          codigoMarca,
          nomeEcommerce,
          precoUnitario,
          precoUnitarioComIPI,
          imagem,
          descricaoSubGrupo: descricaoSubGrupo ?? "",
          dataPrevistaPA,
          tipo,
        });
        scheduleFlush();
      },
      [applyLocalChange, enqueueChange, rememberContext, scheduleFlush]
    );

  const clear = useCallback(() => {
    setQuantidades({});
    pendingChangesRef.current.clear();
    pedidoIdRef.current = null;
    chavePedidoRef.current = null;
  }, []);

  // Listener para sincronizar com mudanças no carrinho
  useEffect(() => {
    const handleCarrinhoChanged = async (payload?: any) => {
      // console.log("Carrinho mudou - ProdutoQuantidadeContext notificado", payload);

      // Se o payload indica que o carrinho ficou vazio, zerar as quantidades
      if (payload?.phase === "after-update" && payload?.pedidoId === null) {
        setQuantidades({});
        pendingChangesRef.current.clear();
        pedidoIdRef.current = null;
        chavePedidoRef.current = null;
        return;
      }

      // Só recarregar se for uma mudança externa (não gerada por este contexto)
      // e se não estamos no meio de um flush
      if (
        payload?.phase !== "after-update" &&
        !isFlushingRef.current &&
        chavePedidoRef.current
      ) {
        try {
          const { cpfCnpj, clienteId, representanteId } =
            chavePedidoRef.current;
          const mapaAtualizado = await CarrinhoService.carregarMapaQuantidades(
            cpfCnpj,
            clienteId,
            representanteId
          );
          setQuantidades(mapaAtualizado);
        } catch (error) {
          console.warn(
            "Erro ao recarregar quantidades após mudança no carrinho:",
            error
          );
        }
      }
    };

    const unsubscribe = eventBus.on("carrinho:changed", handleCarrinhoChanged);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      quantidades,
      preloadQuantidades,
      incrementar,
      decrementar,
      setQuantidade,
      clear,
      aplicarDistribuicaoProduto,
    }),
    [
      quantidades,
      preloadQuantidades,
      incrementar,
      decrementar,
      setQuantidade,
      clear,
      aplicarDistribuicaoProduto,
    ]
  );

  return (
    <ProdutoQuantidadeContext.Provider value={value}>
      {children}
    </ProdutoQuantidadeContext.Provider>
  );
};
